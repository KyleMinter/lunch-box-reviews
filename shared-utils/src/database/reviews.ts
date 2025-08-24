import {
    QueryCommand,
    GetCommand,
    PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4} from 'uuid';
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
 * @returns the newly constructed review
 */
export async function constructReview(jsonStr: string, userID: string) {
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

    // Validate the date format.
    // This will probably need updating to ensure that the menuDate matches an existing menuInstance.
    if (!isValidISO8601(json.reviewDate) || !isValidISO8601(json.menuDate))
        throw new BadRequestError('Invalid date format. Ensure dates strings are using the ISO-8601 format.');

    // Construct the review.
    const review: Review = {
        entityID: uuidv4(),
        entityType: EntityType.Review,
        userID: userID,
        foodID: json.foodID,
        quality: quality,
        quantity: quantity,
        rating: calculateOverallRating(json.quality, json.quantity),
        reviewDate: json.reviewDate,
        menuDate: json.menuDate
    }

    return review;
}

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

export async function getAllReviews(Datefilter: DateFilter, pagination: PaginationParameters) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    const startDate = Datefilter.startDate;
    const endDate = Datefilter.endDate;

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

    return reviews.Items ? reviews.Items : [];
}

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