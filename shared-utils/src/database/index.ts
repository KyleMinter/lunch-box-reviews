import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    QueryCommand,
    QueryCommandOutput,
    GetCommand,
    PutCommand
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequestError } from '../errors';
import { EntityType, FoodItem, Review, User } from '../types';


/*
    ======================================================================================================

    Database Utils
    
    ======================================================================================================
*/

export const REVIEWS_TABLE = 'Review-Entities-Table';

interface PaginationParameters {
    limit: number,
    offset: Record<string, any> | undefined
}

interface FilterParameters {
    filter: string | undefined,
    criteria: string | undefined
}

/**
 * Gets the Dynamo DB client to use for querying.
 * @returns the Dynamo DB client 
 */
export function getDynamoDbClient(): DynamoDBDocumentClient {
    const client = new DynamoDBClient({});
    const dynamo = DynamoDBDocumentClient.from(client);
    return dynamo;
}

/**
 * Gets the pagination (limit & offset) query parameters for a given request.
 * @param event the request event
 * @returns the pagination (limit & offset) query parameters
 */
export function getPaginationParameters(event: APIGatewayProxyEvent): PaginationParameters {
    let limit: number = 10;
    let offset: Record<string, any> | undefined = undefined;

    const queryParams = event.queryStringParameters;
    if (queryParams && queryParams.limit) {
        const supportedLimits = [10, 30, 50, 100];
        const limitParam = Number(queryParams.limit);
        if (supportedLimits.includes(limitParam))
            limit = limitParam;
        else
            throw new BadRequestError('Unsupported limit parameter');

        const offsetParam: string | undefined = queryParams ? queryParams.offset : undefined;

        if (offsetParam) {
            offset = JSON.parse(decodeURIComponent(offsetParam));
        }
    }

    return {
        limit: limit,
        offset: offset
    }
}

/**
 * Gets the filter (filter & criteria) query parameters for a given request.
 * @param event the request event
 * @returns the filter (filter & criteria) query parameters
 */
export function getFilterParameters(event: APIGatewayProxyEvent): FilterParameters {
    const queryParams = event.queryStringParameters;
    const filter: string | undefined = queryParams ? queryParams.filter : undefined;
    const criteria: string | undefined = queryParams ? queryParams.criteria : undefined;
    if ((filter && !criteria) || (!filter && criteria))
        throw new Error('An unsupported combination of query parameters was supplied');

    return {
        filter: filter,
        criteria: criteria
    }
}

/*
    ======================================================================================================

    /foodItems Database Queries

    ======================================================================================================
*/

export async function createFoodItem(foodItem: FoodItem) {
    const dynamo = getDynamoDbClient();
    await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: foodItem,
        })
    );

    return {
        entityID: foodItem.entityID
    };
}

export async function getAllFoodItems(filter: string | undefined, criteria: string | undefined, limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();

    let foodItems: QueryCommandOutput;
    if (filter && criteria) {
        if (criteria !== 'foodName' && criteria !== 'foodOrigin')
            throw new BadRequestError('Unsupported criteria');

        // Query the database for food items using a criteria and filter.
        foodItems = await dynamo.send(
            new QueryCommand({
                TableName: REVIEWS_TABLE,
                IndexName: `GSI-entityType-${criteria}`,
                KeyConditionExpression: `entityType = :pkValue AND begins_with(${criteria}, :skValue)`,
                ExpressionAttributeValues: {
                        ':pkValue': 'foodItem',
                        ':skValue': filter
                },
                ProjectionExpression: 'entityID, foodName, foodOrigin, foodAttributes',
                ExclusiveStartKey: offset,
                Limit: limit,
            })
        );
    }
    else {
        // Query the database for all food items.
        foodItems = await dynamo.send(
            new QueryCommand({
                TableName: REVIEWS_TABLE,
                IndexName: 'GSI-entityType',
                KeyConditionExpression: 'entityType = :pkValue',
                ExpressionAttributeValues: {
                        ':pkValue': 'foodItem'
                },
                ProjectionExpression: 'entityID, foodName, foodOrigin, foodAttributes',
                ExclusiveStartKey: offset,
                Limit: limit,
            })
        );
    }

    // Return the results of the query and the last evaluated key.
    return {
        Items: foodItems.Items ? foodItems.Items : [],
        LastEvaluatedKey: foodItems.LastEvaluatedKey
    };
}

export async function getFoodItem(foodID: string) {
    const dynamo = getDynamoDbClient();
    const foodItem = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: foodID
            },
            ProjectionExpression: 'entityID, foodName, foodOrigin, foodAttributes',
        })
    );
    return foodItem.Item;
}

export async function getReviewsFromFoodItem(foodID: string, limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: 'GSI-entityType-foodID',
            KeyConditionExpression: 'entityType = :pkValue AND foodID = :skValue',
            ExpressionAttributeValues: {
                ':pkValue': 'review',
                ':skValue': foodID
            },
            ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            ExclusiveStartKey: offset,
            Limit: limit,
        })
    );

    // Store the results of the query and the last evaluated key to the response body.
    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

export async function getUsersFromFoodItems(foodID: string, limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: 'GSI-entityType-foodID',
            KeyConditionExpression: 'entityType = :pkValue AND foodID = :skValue',
            ExpressionAttributeValues: {
                ':pkValue': 'review',
                ':skValue': foodID
            },
            ProjectionExpression: 'userID',
            ExclusiveStartKey: offset,
            Limit: limit,
        })
    );

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!results.Items) {
        return {
            Items: [],
            LastEvaluatedKey: results.LastEvaluatedKey
        }
    }
    else {
        // Retreive each food entity for every userID retrieved in the previous query.
        const users: any[] = [];

        const promises = results.Items.map(async (userID)  => {
            userID = userID.userID;
            const user = await dynamo.send(
                new GetCommand({
                    TableName: REVIEWS_TABLE,
                    Key: {
                        entityID: userID
                    },
                    ProjectionExpression: 'entityID, userName, userEmail, userFlags'
                })
            );

            if (user.Item)
                users.push(user.Item);
        });
        await Promise.all(promises);

        // Store the results of the query and the last evaluated key to the response body.
        return {
            Items: users,
            LastEvaluatedKey: results.LastEvaluatedKey
        };
    }
}

/*
    ======================================================================================================

    /reviews Database Queries

    ======================================================================================================
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

export async function getAllReviews(limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();
    const reviews = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: 'GSI-entityType',
            KeyConditionExpression: 'entityType = :pkValue',
            ExpressionAttributeValues: {
                    ':pkValue': EntityType.Review
            },
            ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            ExclusiveStartKey: offset,
            Limit: limit,
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

/*
    ======================================================================================================

    /users Database Queries

    ======================================================================================================
*/

export async function createUser(user: User) {
    const dynamo = getDynamoDbClient();
    await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: user,
        })
    );

    return {
        entityID: user.entityID
    };
}

export async function getAllUsers(filter: string | undefined, criteria: string | undefined, limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();

    let users: QueryCommandOutput;
    if (filter && criteria) {
        if (criteria !== 'userName' && criteria !== 'userEmail')
            throw new Error('Unsupported criteria');

        // Query the database for users using a criteria and filter.
        users = await dynamo.send(
            new QueryCommand({
                TableName: REVIEWS_TABLE,
                IndexName: `GSI-entityType-${criteria}`,
                KeyConditionExpression: `entityType = :pkValue AND begins_with(${criteria}, :skValue)`,
                ExpressionAttributeValues: {
                        ':pkValue': EntityType.User,
                        ':skValue': filter
                },
                ProjectionExpression: 'entityID, userName, userEmail, userFlags',
                ExclusiveStartKey: offset,
                Limit: limit,
            })
        );
    }
    else {
        // Query the database for all users.
        users = await dynamo.send(
            new QueryCommand({
                TableName: REVIEWS_TABLE,
                IndexName: 'GSI-entityType',
                KeyConditionExpression: 'entityType = :pkValue',
                ExpressionAttributeValues: {
                        ':pkValue': EntityType.User
                },
                ProjectionExpression: 'entityID, userName, userEmail, userFlags',
                ExclusiveStartKey: offset,
                Limit: limit,
            })
        );
    }

    // Return the results of the query and the last evaluated key.
    return {
        Items: users.Items ? users.Items : [],
        LastEvaluatedKey: users.LastEvaluatedKey
    };
}

export async function getFoodItemsFromUser(userID: string, limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();

    // Query the database for reviews with the provided userID.
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: 'GSI-entityType-userID',
            KeyConditionExpression: 'entityType = :pkValue AND userID = :skValue',
            ExpressionAttributeValues: {
                ':pkValue': EntityType.Review,
                ':skValue': userID
            },
            ProjectionExpression: 'foodID',
            ExclusiveStartKey: offset,
            Limit: limit,
        })
    );

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!results.Items) {
        return {
            Items: [],
            LastEvaluatedKey: results.LastEvaluatedKey
        }
    }
    else {
        // Retreive each food entity for every foodID retrieved in the previous query.
        const foodItems: any[] = [];

        const promises = results.Items.map(async (foodID) => {
            foodID = foodID.foodID;
            const foodObject = await dynamo.send(
                new GetCommand({
                    TableName: REVIEWS_TABLE,
                    Key: {
                        entityID: foodID
                    },
                    ProjectionExpression: 'entityID, foodName, foodOrigin, foodAttributes'
                })
            );

            if (foodObject.Item)
                foodItems.push(foodObject.Item);
        });
        await Promise.all(promises);

        // Return the results of the query and the last evaluated key.
        return {
            Items: foodItems,
            LastEvaluatedKey: results.LastEvaluatedKey
        };
    }
}

export async function getReviewsFromUser(userID: string, limit: number, offset: Record<string, any> | undefined) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: 'GSI-entityType-userID',
            KeyConditionExpression: 'entityType = :pkValue AND userID = :skValue',
            ExpressionAttributeValues: {
                ':pkValue': EntityType.Review,
                ':skValue': userID
            },
            ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            ExclusiveStartKey: offset,
            Limit: limit,
        })
    );

    // Return the results of the query and the last evaluated key.
    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

export async function getUser(userID: string) {
    const dynamo = getDynamoDbClient();
    const user = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: userID
            },
            ProjectionExpression: 'entityID, userName, userEmail, userFlags'
        })
    );
    return user.Item;
}