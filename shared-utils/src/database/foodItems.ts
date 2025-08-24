import {
    QueryCommand,
    GetCommand,
    PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4} from 'uuid';
import { BadRequestError } from '../errors';
import { EntityType, FoodAttributes, FoodItem } from '../types';
import { CriteriaFilter, getDynamoDbClient, PaginationParameters, REVIEWS_TABLE } from '.';


/*
    ======================================================================================================

    /foodItems Database Queries

    ======================================================================================================
*/

export async function constructFoodItem(jsonStr: string) {
    const json = JSON.parse(jsonStr);

    const foodAttributes: FoodAttributes = {
        description: json.foodAttributes.description,
        nutrition: json.foodAttributes.nutrition
    };

    const foodItem: FoodItem = {
        entityID: uuidv4(),
        entityType: EntityType.FoodItem,
        foodName: json.foodName,
        foodOrigin: json.foodOrigin,
        foodAttributes: foodAttributes
    }

    return foodItem;
}

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

export async function getReviewsFromFoodItem(foodID: string, pagination: PaginationParameters) {
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
            ExclusiveStartKey: pagination.offset,
            Limit: pagination.limit,
        })
    );

    // Store the results of the query and the last evaluated key to the response body.
    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

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