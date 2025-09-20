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
    REVIEWS_TABLE,
    updateFoodItem
} from '.';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../errors';
import { EntityType, FoodItem, Review, ReviewProps } from '@lunch-box-reviews/shared-types';


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

function convertAndValidateRatingNumbers(qualityStr: string, quantityStr: string) {
    // Convert the ratings to numbers
    let quality: number = Number(qualityStr);
    let quantity: number = Number(quantityStr);

    // Valiate quality and quantity ratings.
    if (isNaN(quality) || isNaN(quantity) || quality > 10 ||
    quality < 1 || quantity < 1 || quantity > 5)
        throw new BadRequestError('Invalid review ratings provided');

    // Round quality rating to two decimal places and truncate the quantity rating.
    quality = roundTo(quality as number, 2);
    quantity = Math.trunc(quantity as number);

    return {
        quality,
        quantity
    };
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
 * @param jsonStr the JSON object to construct the review from
 * @param oldReview an already existing review used to supply values to the newly constructed review.
 * If this value is provided the existing entityID, userID, and foodID will used. If no review is given, values will instead be sourced from the provided json.
 * @returns the newly constructed review
 */
export async function constructReview(json: any, oldReview?: Review) {
    const { quality, quantity } = convertAndValidateRatingNumbers(json.quality, json.quantity);

    const reviewDate: string = new Date().toISOString();

    // Construct the review.
    const review: Review = {
        entityID: oldReview ? oldReview.entityID : uuidv4(),
        entityType: EntityType.Review,
        userID: oldReview ? oldReview.userID : json.userID,
        foodID: oldReview ? oldReview.foodID : json.foodID,
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
 * @param foodItem the food item the review is for
 * @returns the newly created review
 */
export async function createReview(review: Review, foodItem: FoodItem) {
    // Update the total rating for the corresponding food item.
    foodItem.totalRating += review.rating;
    foodItem.numReviews++;
    await updateFoodItem(foodItem);

    const dynamo = getDynamoDbClient();
    await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: review,
        })
    ) as IPutCommandOutput<Review>;

    return review;
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
 * @param oldReview the old review containing the outdated information
 * @returns the updated attributes of the review
 */
export async function updateReview(review: Review, oldReview: Review) {
    // Update the total rating for the corresponding food item.
    const foodItem: FoodItem = (await getFoodItem(review.foodID))!;
    foodItem.totalRating -= oldReview.rating;
    foodItem.totalRating += review.rating;
    await updateFoodItem(foodItem);

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
 * @param review the review to remove
 * @param updateFoodItemRating a flag which determines if the corresponding food item should have it's total rating updated upon this review's deletion.
 * This flag is optional and is set to true by default, and should only be set to false when this function is called as the result of a food items deletion.
 * @returns the removed review
 */
export async function deleteReview(review: Review, updateFoodItemRating: boolean = true) {
    // Update the total rating for the corresponding food item.
    if (updateFoodItemRating) {
        const foodItem = (await getFoodItem(review.foodID))!;
        foodItem.totalRating -= review.rating;
        foodItem.numReviews--;
        await updateFoodItem(foodItem);
    }

    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new DeleteCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: review.entityID
            }
        })
    ) as IDeleteCommandOutput<Review>;

    return results.Attributes;
}