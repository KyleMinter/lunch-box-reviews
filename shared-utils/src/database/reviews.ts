import {
    QueryCommand,
    GetCommand,
    PutCommand,
    UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4, validate} from 'uuid';
import { BadRequestError } from '../errors';
import { EntityType, Review } from '../types';
import { DateFilter, getDynamoDbClient, isValidISO8601, PaginationParameters, REVIEWS_TABLE } from '.';

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
            throw new BadRequestError('No foodID provided in request body');

        // Get the food item specified in the review from the database.
        // This could probably be changed to use the existing getFoodItem function.
        const dynamo = getDynamoDbClient();
        const foodItem = await dynamo.send(
            new GetCommand({
                TableName: REVIEWS_TABLE,
                Key: {
                    entityID: json.foodID
                },
                ProjectionExpression: 'entityID'

            })
        );

        // Validate foodID.
        if (!foodItem.Item)
            throw new BadRequestError('Invalid foodID provided');
    }  

    // Validate the date format.
    // This will probably need updating to ensure that the menuDate matches an existing menuInstance.
    if (!isValidISO8601(json.menuDate))
        throw new BadRequestError('Invalid date format. Ensure dates strings are using the ISO-8601 format.');

    const reviewDate: string = new Date().toISOString();
    const menuDate: string = new Date().toISOString().split('T')[0];

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
        menuDate: menuDate // use this date instead of the one specified for testing purposes.
        // menuDate: json.menuDate
    }

    return review;
}

/**
 * Stores a review in the database.
 * @param review the review to store
 * @returns the ID of the review that was stored in this operation
 */
export async function createReview(review: Review) {
    const dynamo = getDynamoDbClient();
    await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: review,
        })
    );

    return {
        entityID: review.entityID
    };
}

/**
 * Gets a list of reviews in the database.
 * @param Datefilter the date filter used to query the database
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews and the last evaluated key
 */
export async function getAllReviews(dateFilter: DateFilter, pagination: PaginationParameters) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    const startDate = dateFilter.startDate;
    const endDate = dateFilter.endDate;

    if (startDate && endDate) {
        indexName = `GSI-entityType-reviewDate`;
        keyConditionExpression = `entityType = :pkValue AND reviewDate BETWEEN :startDate AND :endDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Review,
                ':startDate': startDate,
                ':endDate': endDate
        };
    }
    else if (startDate) {
        indexName = 'GSI-entityType-reviewDate';
        keyConditionExpression = 'entityType = :pkValue AND reviewDate >= :startDate';
        expressionAttributeValues = {
                ':pkValue': EntityType.Review,
                ':startDate': startDate
        };
    }
    else if (endDate) {
        indexName = 'GSI-entityType-reviewDate';
        keyConditionExpression = 'entityType = :pkValue AND reviewDate <= :endDate';
        expressionAttributeValues = {
                ':pkValue': EntityType.Review,
                ':endDate': endDate
        };
    }
    // Query the database for all reviews.
    else {
        indexName = 'GSI-entityType';
        keyConditionExpression = 'entityType = :pkValue';
        expressionAttributeValues = {
                ':pkValue': EntityType.Review
        };
    }

    const dynamo = getDynamoDbClient();
    const reviews = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            ExclusiveStartKey: pagination.offset,
            Limit: pagination.limit,
        })
    );

    return {
        Items: reviews.Items ? reviews.Items : [],
        LastEvaluatedKey: reviews.LastEvaluatedKey
    };
}

/**
 * Retrieves a review from the database.
 * @param reviewID the id of the review to retrieve
 * @returns the review retrieved
 */
export async function getReview(reviewID: string) {
    const dynamo = getDynamoDbClient();
    const review = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: reviewID
            },
            ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
        })
    );
    return review.Item;
}

/**
 * Updates an existing review in the database.
 * @param review a review containing the updated information
 * @returns the updated values in the database
 */
export async function updateReview(review: Review) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: review.entityID
            },
            UpdateExpression: 'SET quality = :newQuality, quantity = :newQuantity, rating = :newRating, reviewDate = :newDate',
            ConditionExpression: 'attribute_exists(entityID)',
            ExpressionAttributeValues: {
                ':newQuality': review.quality,
                ':newQuantity': review.quantity,
                ':newRating': review.rating,
                ':newDate': review.reviewDate
            },
            ReturnValues: 'UPDATED_NEW'
        })
    );

    return result.Attributes;
}