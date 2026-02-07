import {
    QueryCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import {
    CriteriaFilter,
    deleteReview,
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
import { EntityType, FoodItem, Review, ReviewProps, User, UserPermission, UserProps } from '@lunch-box-reviews/shared-types';


/*
    ======================================================================================================

    /users Database Queries

    ======================================================================================================
*/

/**
 * Constructs a new user with a given a JSON string.
 * @param json the JSON object to construct the user from
 * @returns the newly constructed user
 */
export async function constructUser(json: any) {
    const userPermissions: UserPermission[] = json.userPermissions
    ? json.userPermissions as UserPermission[]
    : [
        UserPermission.userReviewPermissions,
        UserPermission.adminUserPermissions
    ]

    const user: User = {
        entityID: json.entityID,
        entityType: EntityType.User,
        userName: json.userName,
        userEmail: json.userEmail,
        accountCreated: '',
        userPermissions: userPermissions
    };

    return user;
}

/**
 * Stores a user in the database.
 * @param user the user to store
 * @returns the newly created user
 */
export async function createUser(user: User) {
    // Add the new user to the database.
    const dynamo = getDynamoDbClient();
    await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: user,
        })
    ) as IPutCommandOutput<User>;

    return user;
}

/**
 * Gets a list of users in the database.
 * @param pagination the pagination parameters used to query the database
 * @param criteriaFilter an optional criteria filter used to query the database
 * @returns a list of users and the last evaluated key
 */
export async function getAllUsers(pagination?: PaginationParameters, criteriaFilter?: CriteriaFilter) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    // Query the database for users using a criteria and filter.
    if (criteriaFilter) {
        const filter = criteriaFilter.filter;
        const criteria = criteriaFilter.criteria;

        if (criteria !== UserProps.userName && criteria !== UserProps.userEmail)
            throw new Error('Unsupported criteria');

        indexName = `GSI-${UserProps.entityID}-${criteria}`;
        keyConditionExpression = `${UserProps.entityType} = :pkValue AND begins_with(${criteria}, :skValue)`;
        expressionAttributeValues = {
                ':pkValue': EntityType.User,
                ':skValue': filter
        };
    }
    // Query the database for all users.
    else {
        indexName = `GSI-${UserProps.entityType}`;
        keyConditionExpression = `${UserProps.entityType} = :pkValue`;
        expressionAttributeValues = {
                ':pkValue': EntityType.User
        };
    }

    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: UserProps.keys,
            ExclusiveStartKey: pagination?.offset,
            Limit: pagination?.limit,
        })
    ) as IQueryCommandOutput<User>;

    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

/**
 * Retrieves a user from the database.
 * @param userID the id of the user to retrieve
 * @returns the user retrieved
 */
export async function getUser(userID: string) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: userID
            },
            ProjectionExpression: UserProps.keys
        })
    ) as IGetCommandOutput<User>;

    return results.Item;
}

/**
 * Retrives a list of reviews with a given user.
 * @param userID the ID of the user that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted by the given user
 */
export async function getReviewsFromUser(userID: string, pagination?: PaginationParameters | undefined) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: `GSI-${ReviewProps.entityType}-${ReviewProps.userID}`,
            KeyConditionExpression: `${ReviewProps.entityType} = :pkValue AND ${ReviewProps.userID} = :skValue`,
            ExpressionAttributeValues: {
                ':pkValue': EntityType.Review,
                ':skValue': userID
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
 * Retrieves a list of food items with a given user
 * @param userID the id of the user that will be used to retrieve the list of food items
 * @param pagination the pagination parameters used to query the database
 * @returns a list of food items that have been reviewed by the given user
 */
export async function getFoodItemsFromUser(userID: string, pagination?: PaginationParameters) {
    // Query the database for reviews with the provided userID.
    const reviews = await getReviewsFromUser(userID, pagination);

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!reviews.Items) {
        return {
            Items: [],
            LastEvaluatedKey: reviews.LastEvaluatedKey
        };
    }
    
    // Retreive each food entity for every foodID retrieved in the previous query.
    const foodItems: FoodItem[] = [];
    const promises = reviews.Items.map(async (review) => {
        const foodItem = await getFoodItem(review.foodID);
        if (foodItem && !foodItems.find(f => f.entityID === foodItem.entityID))
            foodItems.push(foodItem);
    });
    await Promise.all(promises);

    // Return the results of the query and the last evaluated key.
    return {
        Items: foodItems,
        LastEvaluatedKey: reviews.LastEvaluatedKey
    };
}

/**
 * Updates an existing user in the database.
 * @param user a user containing the updated information
 * @returns the updated attributes of the user
 */
export async function updateUser(user: User) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: user.entityID
            },
            UpdateExpression: `SET
                ${UserProps.userName} = :newName,
                ${UserProps.userEmail} = :newEmail,
                ${UserProps.userPermissions} = :newPermissions`,
            ConditionExpression: `attribute_exists(${UserProps.entityID})`,
            ExpressionAttributeValues: {
                ':newName': user.userName,
                ':newEmail': user.userEmail,
                ':newPermissions': user.userPermissions
            },
            ReturnValues: 'UPDATED_NEW'
        })
    ) as IUpdateCommandOutput<User>;

    return result.Attributes;
}

/**
 * Removes an existing user and all of the reviews submitted by the user from the database.
 * @param userID the ID of the user to remove
 * @returns the removed user
 */
export async function deleteUser(userID: string) {
    // Delete all reviews for the provided food item.
    const reviews = await getReviewsFromUser(userID);
    if (reviews.Items) {
        const promises = reviews.Items.map(async (review)  => {
            await deleteReview(review);
        });
        await Promise.all(promises);
    }

    // Delete the user.
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new DeleteCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: userID
            }
        })
    ) as IDeleteCommandOutput<User>;

    return results.Attributes;
}