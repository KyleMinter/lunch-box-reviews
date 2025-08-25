import {
    QueryCommand,
    QueryCommandOutput,
    GetCommand,
    PutCommand,
    UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { EntityType, User, UserPermission } from '../types';
import { CriteriaFilter, getDynamoDbClient, PaginationParameters, REVIEWS_TABLE } from '.';


/*
    ======================================================================================================

    /users Database Queries

    ======================================================================================================
*/

/**
 * Constructs a new user with a given a JSON string.
 * @param jsonStr the JSON string to construct the user from
 * @param userID the userID to supply to this user.
 * @returns the newly constructed user
 */
export async function constructUser(jsonStr: string, userID: string) {
    const json = JSON.parse(jsonStr);

    const userPermissions: UserPermission[] = json.userPermissions
    ? json.userPermissions as UserPermission[]
    : [
        UserPermission.userReviewPermissions,
        UserPermission.adminUserPermissions
    ]

    const user: User = {
        entityID: userID,
        entityType: EntityType.User,
        userName: json.userName,
        userEmail: json.userEmail,
        userPermissions: userPermissions
    };

    return user;
}

/**
 * Stores a user in the database. Will also update an existing user's information.
 * @param user the user to store
 * @returns the ID of the user that was stored in this operation
 */
export async function createUser(user: User) {
    const dynamo = getDynamoDbClient();

    // Query database for an existing user.
    let result: Record<string, any> | undefined = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: user.entityID
            },
            ProjectionExpression: 'entityID, userName, userEmail, userPermissions'
        })
    );
    result = result.Item;

    // If the user is already in the database,
    // we will do some checks to make sure their user data is up to date.
    if (result) {
        // If needed, update user name.
        if (user.userName !== result.userName) {
            await dynamo.send(
                new UpdateCommand({
                    TableName: REVIEWS_TABLE,
                    Key: {
                        entityID: user.entityID
                    },
                    UpdateExpression: 'SET userName = :newValue',
                    ExpressionAttributeValues: {
                        ':newValue': user.userName
                    }
                })
            );
        }

        // If needed update user email
        if (user.userEmail !== result.userEmail) {
            await dynamo.send(
                new UpdateCommand({
                    TableName: REVIEWS_TABLE,
                    Key: {
                        entityID: user.entityID
                    },
                    UpdateExpression: 'SET userEmail = :newValue',
                    ExpressionAttributeValues: {
                        ':newValue': user.userEmail
                    }
                })
            );
        }
    }
    else {
        // Add the new user to the database.
        await dynamo.send(
            new PutCommand({
                TableName: REVIEWS_TABLE,
                Item: user,
            })
        );
    }

    return {
        entityID: user.entityID
    };
}

/**
 * Gets a list of users in the database.
 * @param pagination the pagination parameters used to query the database
 * @param criteriaFilter an optional criteria filter used to query the database
 * @returns a list of users and the last evaluated key
 */
export async function getAllUsers(pagination: PaginationParameters, criteriaFilter?: CriteriaFilter) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    // Query the database for users using a criteria and filter.
    if (criteriaFilter) {
        const filter = criteriaFilter.filter;
        const criteria = criteriaFilter.criteria;

        if (criteria !== 'userName' && criteria !== 'userEmail')
            throw new Error('Unsupported criteria');

        indexName = `GSI-entityType-${criteria}`;
        keyConditionExpression = `entityType = :pkValue AND begins_with(${criteria}, :skValue)`;
        expressionAttributeValues = {
                ':pkValue': EntityType.User,
                ':skValue': filter
        };
    }
    // Query the database for all users.
    else {
        indexName = 'GSI-entityType';
        keyConditionExpression = 'entityType = :pkValue';
        expressionAttributeValues = {
                ':pkValue': EntityType.User
        };
    }

    const dynamo = getDynamoDbClient();
    const users = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: 'entityID, userName, userEmail, userPermissions',
            ExclusiveStartKey: pagination.offset,
            Limit: pagination.limit,
        })
    );

    // Return the results of the query and the last evaluated key.
    return {
        Items: users.Items ? users.Items : [],
        LastEvaluatedKey: users.LastEvaluatedKey
    };
}

/**
 * Retrieves a user from the database.
 * @param userID the id of the user to retrieve
 * @returns the user retrieved
 */
export async function getUser(userID: string) {
    const dynamo = getDynamoDbClient();
    const user = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: userID
            },
            ProjectionExpression: 'entityID, userName, userEmail, userPermissions'
        })
    );
    return user.Item;
}

/**
 * Retrives a list of reviews with a given user.
 * @param userID the ID of the user that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted by the given user
 */
export async function getReviewsFromUser(userID: string, pagination: PaginationParameters) {
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
            ExclusiveStartKey: pagination.offset,
            Limit: pagination.limit,
        })
    );

    // Return the results of the query and the last evaluated key.
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
export async function getFoodItemsFromUser(userID: string, pagination: PaginationParameters) {
    // Query the database for reviews with the provided userID.
    const reviews = await getReviewsFromUser(userID, pagination);

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!reviews.Items) {
        return {
            Items: [],
            LastEvaluatedKey: reviews.LastEvaluatedKey
        }
    }
    else {
        // Retreive each food entity for every foodID retrieved in the previous query.
        const foodItems: any[] = [];

        const dynamo = getDynamoDbClient();
        const promises = reviews.Items.map(async (review) => {
            const foodObject = await dynamo.send(
                new GetCommand({
                    TableName: REVIEWS_TABLE,
                    Key: {
                        entityID: review.foodID
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
            LastEvaluatedKey: reviews.LastEvaluatedKey
        };
    }
}

/**
 * Updates an existing user in the database.
 * @param user a user containing the updated information
 * @returns the updated values in the database
 */
export async function updateUser(user: User) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: user.entityID
            },
            UpdateExpression: 'SET userName = :newName, userEmail = :newEmail, userPermissions = :newPermissions',
            ConditionExpression: 'attribute_exists(entityID)',
            ExpressionAttributeValues: {
                ':newName': user.userName,
                ':newEmail': user.userEmail,
                ':newPermissions': user.userPermissions
            },
            ReturnValues: 'UPDATED_NEW'
        })
    );

    return result.Attributes;
}