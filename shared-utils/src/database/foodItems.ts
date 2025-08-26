import {
    QueryCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4} from 'uuid';
import { BadRequestError } from '../errors';
import { EntityType, FoodAttributes, FoodItem } from '../types';
import { CriteriaFilter, getDynamoDbClient, getReview, PaginationParameters, REVIEWS_TABLE } from '.';


/*
    ======================================================================================================

    /foodItems Database Queries

    ======================================================================================================
*/

/**
 * Constructs a new food item with a given a JSON string.
 * @param jsonStr the JSON string to construct the food item from
 * @param reviewID the foodID to supply to this food item. If no ID is given, one will be generated
 * @returns the newly constructed food item
 */
export async function constructFoodItem(jsonStr: string, foodID: string = uuidv4()) {
    const json = JSON.parse(jsonStr);

    const foodAttributes: FoodAttributes = {
        description: json.foodAttributes.description,
        nutrition: json.foodAttributes.nutrition
    };

    const foodItem: FoodItem = {
        entityID: foodID,
        entityType: EntityType.FoodItem,
        foodName: json.foodName,
        foodOrigin: json.foodOrigin,
        foodAttributes: foodAttributes
    }

    return foodItem;
}

/**
 * Stores a food item in the database.
 * @param foodItem the food item to store
 * @returns the ID of the food item that was stored in this operation
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

/**
 * Gets a list of food items in the database.
 * @param pagination the pagination parameters used to query the database
 * @param criteriaFilter an optional criteria filter used to query the database
 * @returns a list of food items and the last evaluated key
 */
export async function getAllFoodItems(pagination: PaginationParameters, criteriaFilter?: CriteriaFilter) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    // Query the database for food items using a criteria and filter.
    if (criteriaFilter) {
        const filter = criteriaFilter.filter;
        const criteria = criteriaFilter.criteria;

        if (criteria !== 'foodName' && criteria !== 'foodOrigin')
            throw new BadRequestError('Unsupported criteria');

        indexName = `GSI-entityType-${criteria}`;
        keyConditionExpression = `entityType = :pkValue AND begins_with(${criteria}, :skValue)`;
        expressionAttributeValues = {
                ':pkValue': EntityType.FoodItem,
                ':skValue': filter
        };
    }
    // Query the database for all food items.
    else {
        indexName = 'GSI-entityType';
        keyConditionExpression = 'entityType = :pkValue';
        expressionAttributeValues = {
                ':pkValue': EntityType.FoodItem
        };
    }

    const dynamo = getDynamoDbClient();
    const foodItems = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: 'entityID, foodName, foodOrigin, foodAttributes',
            ExclusiveStartKey: pagination.offset,
            Limit: pagination.limit,
        })
    );

    // Return the results of the query and the last evaluated key.
    return {
        Items: foodItems.Items ? foodItems.Items : [],
        LastEvaluatedKey: foodItems.LastEvaluatedKey
    };
}

/**
 * Retrieves a food item from the database.
 * @param reviewID the id of the food item to retrieve
 * @returns the food item retrieved
 */
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

/**
 * Retrives a list of reviews with a given food item.
 * @param foodID the ID of the food item that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted for the given food item
 */
export async function getReviewsFromFoodItem(foodID: string, pagination: PaginationParameters | undefined) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: 'GSI-entityType-foodID',
            KeyConditionExpression: 'entityType = :pkValue AND foodID = :skValue',
            ExpressionAttributeValues: {
                ':pkValue': EntityType.Review,
                ':skValue': foodID
            },
            ProjectionExpression: 'entityID, foodID, userID, quality, quantity, rating, reviewDate, menuDate',
            ExclusiveStartKey: pagination ? pagination.offset : undefined,
            Limit: pagination ? pagination.limit : undefined,
        })
    );

    // Store the results of the query and the last evaluated key to the response body.
    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

/**
 * Retrieves a list of users with a given food item
 * @param foodID the id of the food item that will be used to retrieve the list of users
 * @param pagination the pagination parameters used to query the database
 * @returns a list of users who have submitted a review for the given food item
 */
export async function getUsersFromFoodItems(foodID: string, pagination: PaginationParameters) {
    // Query the database for reviews with the provided foodID.
    const reviews = await getReviewsFromFoodItem(foodID, pagination);

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!reviews.Items) {
        return {
            Items: [],
            LastEvaluatedKey: reviews.LastEvaluatedKey
        }
    }
    else {
        // Retreive each food entity for every userID retrieved in the previous query.
        const users: any[] = [];
        
        const dynamo = getDynamoDbClient();
        const promises = reviews.Items.map(async (review)  => {
            const user = await dynamo.send(
                new GetCommand({
                    TableName: REVIEWS_TABLE,
                    Key: {
                        entityID: review.userID
                    },
                    ProjectionExpression: 'entityID, userName, userEmail, userPermissions'
                })
            );

            if (user.Item)
                users.push(user.Item);
        });
        await Promise.all(promises);

        // Store the results of the query and the last evaluated key to the response body.
        return {
            Items: users,
            LastEvaluatedKey: reviews.LastEvaluatedKey
        };
    }
}

/**
 * Updates an existing food item in the database.
 * @param foodItem a food item containing the updated information
 * @returns the updated values in the database
 */
export async function updateFoodItem(foodItem: FoodItem) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: foodItem.entityID
            },
            UpdateExpression: 'SET foodName = :newName, foodOrigin = :newOrigin, foodAttributes = :newAttributes',
            ConditionExpression: 'attribute_exists(entityID)',
            ExpressionAttributeValues: {
                ':newName': foodItem.foodName,
                ':newOrigin': foodItem.foodOrigin,
                ':newAttributes': foodItem.foodAttributes
            },
            ReturnValues: 'UPDATED_NEW'
        })
    );

    return result.Attributes;
}

/**
 * Removes an existing food item, along with all of the reviews submitted for the food item
 * and the menu instances of the food item, from the database.
 * @param foodID the ID of the food item to remove
 * @returns the ID of the food item that was removed
 */
export async function deleteFoodItem(foodID: string) {
    const dynamo = getDynamoDbClient();

    // Delete all reviews for the provided food item.
    const reviews = await getReviewsFromFoodItem(foodID, undefined);
    const promises = reviews.Items.map(async (review)  => {
        await dynamo.send(
            new DeleteCommand({
                TableName: REVIEWS_TABLE,
                Key: {
                    entityID: review.entityID
                }
            })
        );
    });
    await Promise.all(promises);

    // TODO: Will also need to delete any menu instances with the current foodID.

    // Delete the food item.
    await dynamo.send(
        new DeleteCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: foodID
            }
        })
    );

    return {
        entityID: foodID
    };
}