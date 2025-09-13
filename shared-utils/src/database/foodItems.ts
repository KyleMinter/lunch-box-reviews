import {
    QueryCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { 
    CriteriaFilter,
    deleteReview,
    getDynamoDbClient,
    getUser,
    IDeleteCommandOutput,
    IGetCommandOutput,
    IPutCommandOutput,
    IQueryCommandOutput,
    IUpdateCommandOutput,
    PaginationParameters,
    REVIEWS_TABLE
} from '.';
import { v4 as uuidv4} from 'uuid';
import { BadRequestError } from '../errors';
import { EntityType, FoodAttributes, FoodItem, FoodItemProps, FoodOption, OfficeCafe, OfficeLocation, Review, ReviewProps, User } from '../types';


/*
    ======================================================================================================

    /foodItems Database Queries

    ======================================================================================================
*/

/**
 * Constructs a new food item with a given a JSON string.
 * @param jsonStr the JSON object to construct the food item from
 * @param oldFooditem an already existing food item used to supply values to the newly constructed food item.
 * If this value is provided the existing entityID, totalRating, numReviews, and foodDate will used. If no food item is given, default values will instead be used/generated.
 * @returns the newly constructed food item
 */
export async function constructFoodItem(json: any, oldFoodItem?: FoodItem) {
    const foodAttributes: FoodAttributes = {
        description: json.foodAttributes.description,
        nutrition: json.foodAttributes.nutrition
    };

    const foodDate: string = new Date().toISOString();

    const foodItem: FoodItem = {
        entityID: oldFoodItem ? oldFoodItem.entityID : uuidv4(),
        entityType: EntityType.FoodItem,
        foodName: json.foodName,
        foodOrigin: json.foodOrigin,
        foodAttributes: foodAttributes,
        totalRating: oldFoodItem ? oldFoodItem.totalRating : 0,
        numReviews: oldFoodItem ? oldFoodItem.numReviews : 0,
        foodOption: json.foodOption,
        officeLocation: json.officeLocation,
        officeCafe: json.officeCafe,
        foodDate: oldFoodItem ? oldFoodItem.foodDate : foodDate
    }

    return foodItem;
}

/**
 * Stores a food item in the database.
 * @param foodItem the food item to store
 * @returns the newly created food item
 */
export async function createFoodItem(foodItem: FoodItem) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: foodItem,
        })
    ) as IPutCommandOutput<FoodItem>;

    return results.Attributes;
}

/**
 * Gets a list of food items in the database.
 * @param pagination the pagination parameters used to query the database
 * @param criteriaFilter an optional criteria filter used to query the database
 * @returns a list of food items and the last evaluated key
 */
export async function getAllFoodItems(pagination?: PaginationParameters, criteriaFilter?: CriteriaFilter) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    // Query the database for food items using a criteria and filter.
    if (criteriaFilter) {
        const filter = criteriaFilter.filter;
        const criteria = criteriaFilter.criteria;

        if (criteria !== FoodItemProps.foodName && criteria !== FoodItemProps.foodOrigin)
            throw new BadRequestError('Unsupported criteria');

        indexName = `GSI-${FoodItemProps.entityType}-${criteria}`;
        keyConditionExpression = `${FoodItemProps.entityType} = :pkValue AND begins_with(${criteria}, :skValue)`;
        expressionAttributeValues = {
                ':pkValue': EntityType.FoodItem,
                ':skValue': filter
        };
    }
    // Query the database for all food items.
    else {
        indexName = `GSI-${FoodItemProps.entityType}`;
        keyConditionExpression = `${FoodItemProps.entityType} = :pkValue`;
        expressionAttributeValues = {
                ':pkValue': EntityType.FoodItem
        };
    }

    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: `${FoodItemProps.keys}`,
            ExclusiveStartKey: pagination?.offset,
            Limit: pagination?.limit,
        })
    ) as IQueryCommandOutput<FoodItem>;

    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

/**
 * Retrieves a food item from the database.
 * @param foodID the id of the food item to retrieve
 * @returns the food item retrieved
 */
export async function getFoodItem(foodID: string) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: foodID
            },
            ProjectionExpression: FoodItemProps.keys,
        })
    ) as IGetCommandOutput<FoodItem>;

    return results.Item;
}

/**
 * Retrives a list of reviews with a given food item.
 * @param foodID the ID of the food item that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted for the given food item
 */
export async function getReviewsFromFoodItem(foodID: string, pagination?: PaginationParameters) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: `GSI-${ReviewProps.entityType}-${ReviewProps.foodID}`,
            KeyConditionExpression: `${ReviewProps.entityType} = :pkValue AND ${ReviewProps.foodID} = :skValue`,
            ExpressionAttributeValues: {
                ':pkValue': EntityType.Review,
                ':skValue': foodID
            },
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
 * Retrieves a list of users with a given food item
 * @param foodID the id of the food item that will be used to retrieve the list of users
 * @param pagination the pagination parameters used to query the database
 * @returns a list of users who have submitted a review for the given food item
 */
export async function getUsersFromFoodItem(foodID: string, pagination?: PaginationParameters) {
    // Query the database for reviews with the provided foodID.
    const reviews = await getReviewsFromFoodItem(foodID, pagination);

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!reviews.Items) {
        return {
            Items: [],
            LastEvaluatedKey: reviews.LastEvaluatedKey
        };
    }

    // Retreive each food entity for every userID retrieved in the previous query.
    const users: User[] = [];
    const promises = reviews.Items.map(async (review)  => {
        const user = await getUser(review.userID);
        if (user && !users.find(u => u.entityID === u.entityID))
            users.push(user);
    });
    await Promise.all(promises);

    // Store the results of the query and the last evaluated key to the response body.
    return {
        Items: users,
        LastEvaluatedKey: reviews.LastEvaluatedKey
    };
}

/**
 * Updates an existing food item in the database.
 * @param foodItem a food item containing the updated information
 * @returns the updated attributes of the food item
 */
export async function updateFoodItem(foodItem: FoodItem) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: foodItem.entityID
            },
            UpdateExpression: `SET
                ${FoodItemProps.foodName} = :newName,
                ${FoodItemProps.foodOrigin} = :newOrigin,
                ${FoodItemProps.foodAttributes} = :newAttributes,
                ${FoodItemProps.totalRating} = :newTotalRating,
                ${FoodItemProps.numReviews} = :newNumReviews,
                ${FoodItemProps.officeLocation} = :newLocation,
                ${FoodItemProps.officeCafe} = :newCafe`,
            ConditionExpression: `attribute_exists(${FoodItemProps.entityID})`,
            ExpressionAttributeValues: {
                ':newName': foodItem.foodName,
                ':newOrigin': foodItem.foodOrigin,
                ':newAttributes': foodItem.foodAttributes,
                ':newTotalRating': foodItem.totalRating,
                ':newNumReviews': foodItem.numReviews,
                ':newLocation': foodItem.officeLocation,
                ':newCafe': foodItem.officeCafe
            },
            ReturnValues: 'UPDATED_NEW'
        })
    ) as IUpdateCommandOutput<FoodItem>;

    return result.Attributes;
}

/**
 * Removes an existing food item, along with all of the reviews submitted for the food item
 * and the menu instances of the food item, from the database.
 * @param foodID the ID of the food item to remove
 * @returns the removed food item
 */
export async function deleteFoodItem(foodID: string) {
    const dynamo = getDynamoDbClient();

    // Delete all reviews for the provided food item.
    const reviews = await getReviewsFromFoodItem(foodID);
    if (reviews.Items) {
        const promises = reviews.Items.map(async (review) => {
            await deleteReview(review, false)
        });
        await Promise.all(promises);
    }

    // Delete the food item.
    const results = await dynamo.send(
        new DeleteCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: foodID
            }
        })
    ) as IDeleteCommandOutput<FoodItem>;

    return results.Attributes;
}