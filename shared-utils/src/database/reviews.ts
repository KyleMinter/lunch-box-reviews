import {
    QueryCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import {
    DateFilter,
    getDynamoDbClient,
    getFoodItem,
    IDeleteCommandOutput,
    IGetCommandOutput,
    IPutCommandOutput,
    IQueryCommandOutput,
    IUpdateCommandOutput,
    PaginationParameters,
    REVIEWS_TABLE
} from '.';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../errors';
import { EntityType, Review, ReviewProps } from '../types';


/*
    ======================================================================================================

    /reviews Database Queries

    ======================================================================================================
*/

/**
 * Rounds a number to a given number of decimal places.
 * @param num the number to round
 * @param places the amount of decimal places to round to
 * @return the rounded number
 */
function roundTo(num: number, places: number): number {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
}

/**
 * Calculates the overall rating given a quality and quantity rating
 * @param quality the quality rating
 * @param quantity the quantity rating
 * @returns the overall rating
 */
function calculateOverallRating(quality: number, quantity: number): number {
    // Compute the overall rating and round it to two decimal places.
    let rating = quality * Math.sqrt(quantity / 5);
    rating = roundTo(rating, 2);
    return rating;
}

/**
 * Constructs a new review with a given a JSON string.
 * @param jsonStr the JSON string to construct the review from
 * @param userID the id of the user who is creating this review
 * @param validateFoodID a flag which determines if the foodID in the jsonStr should be validated
 * @param reviewID the reviewID to supply to this review. If no ID is given, one will be generated
 * @returns the newly constructed review
 */
export async function constructReview(jsonStr: string, userID: string, validateFoodID: boolean, reviewID: string = uuidv4()) {
    const json = JSON.parse(jsonStr);

    // Convert the ratings to numbers
    let quality: number = Number(json.quality);
    let quantity: number = Number(json.quantity);

    // Valiate quality and quantity ratings.
    if (isNaN(quality) || isNaN(quantity) || quality > 10 ||
    quality < 1 || quantity < 1 || quantity > 5)
        throw new BadRequestError('Invalid review ratings provided');

    // Round quality rating to two decimal places and truncate the quantity rating.
    quality = roundTo(json.quality as number, 2);
    quantity = Math.trunc(json.quantity as number);

    // If a food item is being supplied, we will verify it actually exists.
    if (validateFoodID) {
        if (!json.foodID)
            throw new BadRequestError(`No ${ReviewProps.foodID} provided in request body`);

        // Validate foodID.
        const foodItem = await getFoodItem(json.foodID);
        if (!foodItem)
            throw new BadRequestError(`Provided ${ReviewProps.foodID} matches no existing elements`);
    }

    const reviewDate: string = new Date().toISOString();

    // Construct the review.
    const review: Review = {
        entityID: reviewID,
        entityType: EntityType.Review,
        userID: userID,
        foodID: json.foodID,
        quality: quality,
        quantity: quantity,
        rating: calculateOverallRating(json.quality, json.quantity),
        reviewDate: reviewDate,
    }

    return review;
}

/**
 * Stores a review in the database.
 * @param review the review to store
 * @returns the newly created menu instance
 */
export async function createReview(review: Review) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: review,
        })
    ) as IPutCommandOutput<Review>;

    return results.Attributes;
}

/**
 * Gets a list of reviews in the database.
 * @param Datefilter the date filter used to query the database
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews and the last evaluated key
 */
export async function getAllReviews(dateFilter: DateFilter, pagination?: PaginationParameters) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    const startDate = dateFilter.startDate;
    const endDate = dateFilter.endDate;

    if (startDate && endDate) {
        indexName = `GSI-${ReviewProps.entityType}-${ReviewProps.reviewDate}`;
        keyConditionExpression = `${ReviewProps.entityType} = :pkValue AND ${ReviewProps.reviewDate} BETWEEN :startDate AND :endDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Review,
                ':startDate': startDate,
                ':endDate': endDate
        };
    }
    else if (startDate) {
        indexName = `GSI-${ReviewProps.entityType}-${ReviewProps.reviewDate}`;
        keyConditionExpression = `${ReviewProps.entityType} = :pkValue AND ${ReviewProps.reviewDate} >= :startDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Review,
                ':startDate': startDate
        };
    }
    else if (endDate) {
        indexName = `GSI-${ReviewProps.entityType}-${ReviewProps.reviewDate}`;
        keyConditionExpression = `${ReviewProps.entityType} = :pkValue AND ${ReviewProps.reviewDate} <= :endDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Review,
                ':endDate': endDate
        };
    }
    // Query the database for all reviews.
    else {
        indexName = `GSI-${ReviewProps.entityType}`;
        keyConditionExpression = `${ReviewProps.entityType} = :pkValue`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Review
        };
    }

    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: ReviewProps.keys,
            ExclusiveStartKey: pagination?.offset,
            Limit: pagination?.limit,
        })
    ) as IQueryCommandOutput<Review>;

    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

/**
 * Retrieves a review from the database.
 * @param reviewID the id of the review to retrieve
 * @returns the review retrieved
 */
export async function getReview(reviewID: string) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: reviewID
            },
            ProjectionExpression: ReviewProps.keys,
        })
    ) as IGetCommandOutput<Review>;

    return results.Item;
}

/**
 * Updates an existing review in the database.
 * @param review a review containing the updated information
 * @returns the updated attributes of the review
 */
export async function updateReview(review: Review) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: review.entityID
            },
            UpdateExpression: `SET
                ${ReviewProps.quality} = :newQuality,
                ${ReviewProps.quanitity} = :newQuantity,
                ${ReviewProps.rating} = :newRating,
                ${ReviewProps.reviewDate} = :newDate`,
            ConditionExpression: `attribute_exists(${ReviewProps.entityID})`,
            ExpressionAttributeValues: {
                ':newQuality': review.quality,
                ':newQuantity': review.quantity,
                ':newRating': review.rating,
                ':newDate': review.reviewDate
            },
            ReturnValues: 'UPDATED_NEW'
        })
    ) as IUpdateCommandOutput<Review>;

    return result.Attributes;
}

/**
 * Removes an existing review from the database.
 * @param reviewID the ID of the review to remove
 * @returns the removed review
 */
export async function deleteReview(reviewID: string) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new DeleteCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: reviewID
            }
        })
    ) as IDeleteCommandOutput<Review>;

    return results.Attributes;
}