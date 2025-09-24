import {
    QueryCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { 
    DateFilter,
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
import { EntityType, Menu, Review, ReviewProps, User, MenuProps } from '@lunch-box-reviews/shared-types';


/*
    ======================================================================================================

    /menus Database Queries

    ======================================================================================================
*/

/**
 * Constructs a new menu with a given a JSON string.
 * @param jsonStr the JSON object to construct the menu from
 * @param oldMenu an already existing menu used to supply values to the newly constructed menu.
 * If this value is provided the existing entityID, officeLocation, officeCafe, menuOption, and menuDate will used. If no menu is given, values will instead be sourced from the provided json.
 * @returns the newly constructed food item
 */
export async function constructMenu(json: any, oldMenu?: Menu) {
    const menuDate: string = new Date().toISOString();

    const menu: Menu = {
        entityID: oldMenu ? oldMenu.entityID : uuidv4(),
        entityType: EntityType.Menu,
        officeLocation: oldMenu ? oldMenu.officeLocation : json.officeLocation,
        officeCafe: oldMenu ? oldMenu.officeCafe : json.officeCafe,
        menuOption: oldMenu ? oldMenu.menuOption : json.menuOption,
        menuDate: oldMenu ? oldMenu.menuDate : menuDate,
    }

    return menu;
}

/**
 * Stores a menu in the database.
 * @param menu the menu to store
 * @returns the newly created menu
 */
export async function createMenu(menu: Menu) {
    const dynamo = getDynamoDbClient();
    await dynamo.send(
        new PutCommand({
            TableName: REVIEWS_TABLE,
            Item: menu,
        })
    ) as IPutCommandOutput<Menu>;

    return menu;
}

/**
 * Gets a list of menus in the database.
 * @param Datefilter the date filter used to query the database
 * @param pagination the pagination parameters used to query the database
 * @returns a list of menus and the last evaluated key
 */
export async function getAllMenus(dateFilter: DateFilter, pagination?: PaginationParameters) {
    let indexName: string;
    let keyConditionExpression: string;
    let expressionAttributeValues: Record<string, string>;

    const startDate = dateFilter.startDate;
    const endDate = dateFilter.endDate;

    if (startDate && endDate) {
        indexName = `GSI-${MenuProps.entityType}-${MenuProps.menuDate}`;
        keyConditionExpression = `${MenuProps.entityType} = :pkValue AND ${MenuProps.menuDate} BETWEEN :startDate AND :endDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Menu,
                ':startDate': startDate,
                ':endDate': endDate
        };
    }
    else if (startDate) {
        indexName = `GSI-${MenuProps.entityType}-${MenuProps.menuDate}`;
        keyConditionExpression = `${MenuProps.entityType} = :pkValue AND ${MenuProps.menuDate} >= :startDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Menu,
                ':startDate': startDate
        };
    }
    else if (endDate) {
        indexName = `GSI-${MenuProps.entityType}-${MenuProps.menuDate}`;
        keyConditionExpression = `${MenuProps.entityType} = :pkValue AND ${MenuProps.menuDate} <= :endDate`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Menu,
                ':endDate': endDate
        };
    }
    // Query the database for all menus.
    else {
        indexName = `GSI-${MenuProps.entityType}`;
        keyConditionExpression = `${MenuProps.entityType} = :pkValue`;
        expressionAttributeValues = {
                ':pkValue': EntityType.Menu
        };
    }

    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ProjectionExpression: `${MenuProps.keys}`,
            ExclusiveStartKey: pagination?.offset,
            Limit: pagination?.limit,
        })
    ) as IQueryCommandOutput<Menu>;

    return {
        Items: results.Items ? results.Items : [],
        LastEvaluatedKey: results.LastEvaluatedKey
    };
}

/**
 * Retrieves a menu from the database.
 * @param menuID the id of the menu to retrieve
 * @returns the menu retrieved
 */
export async function getMenu(menuID: string) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new GetCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: menuID
            },
            ProjectionExpression: MenuProps.keys,
        })
    ) as IGetCommandOutput<Menu>;

    return results.Item;
}

/**
 * Retrives a list of reviews with a given menu date.
 * @param menuID the ID of the menu that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted for the given menu
 */
export async function getReviewsFromMenu(menuID: string, pagination?: PaginationParameters) {
    const dynamo = getDynamoDbClient();
    const results = await dynamo.send(
        new QueryCommand({
            TableName: REVIEWS_TABLE,
            IndexName: `GSI-${ReviewProps.entityType}-${ReviewProps.menuID}`,
            KeyConditionExpression: `${ReviewProps.entityType} = :pkValue AND ${ReviewProps.menuID} = :skValue`,
            ExpressionAttributeValues: {
                ':pkValue': EntityType.Review,
                ':skValue': menuID
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
 * Retrieves a list of users with a given menu
 * @param menuID the id of the menu that will be used to retrieve the list of users
 * @param pagination the pagination parameters used to query the database
 * @returns a list of users who have submitted a review for the given menu
 */
export async function getUsersFromMenu(menuID: string, pagination?: PaginationParameters) {
    // Query the database for reviews with the provided foodID.
    const reviews = await getReviewsFromMenu(menuID, pagination);

    // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
    if (!reviews.Items) {
        return {
            Items: [],
            LastEvaluatedKey: reviews.LastEvaluatedKey
        };
    }

    // Retreive each user entity for every userID retrieved in the previous query.
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
 * Updates an existing menu in the database.
 * @param menu a menu containing the updated information
 * @returns the updated attributes of the menu
 */
export async function updateMenu(menu: Menu) {
    const dynamo = getDynamoDbClient();
    const result = await dynamo.send(
        new UpdateCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: menu.entityID
            },
            UpdateExpression: `SET
                ${MenuProps.officeLocation} = :newLocation,
                ${MenuProps.officeCafe} = :newCafe,
                ${MenuProps.menuOption} = :newOption,
                ${MenuProps.menuDate} = :newDate`,
            ConditionExpression: `attribute_exists(${MenuProps.entityID})`,
            ExpressionAttributeValues: {
                ':newLocation': menu.officeLocation,
                ':newCafe': menu.officeCafe,
                ':newOption': menu.menuOption,
                ':newDate': menu.menuDate
            },
            ReturnValues: 'UPDATED_NEW'
        })
    ) as IUpdateCommandOutput<Menu>;

    return result.Attributes;
}

/**
 * Removes an existing menu, along with all of the reviews submitted for the menu from the database.
 * @param menuID the ID of the menu to remove
 * @returns the removed menu
 */
export async function deleteMenu(menuID: string) {
    const dynamo = getDynamoDbClient();

    // Delete all reviews for the provided menu.
    const reviews = await getReviewsFromMenu(menuID);
    if (reviews.Items) {
        const promises = reviews.Items.map(async (review) => {
            await deleteReview(review, false)
        });
        await Promise.all(promises);
    }

    // Delete the food menu.
    const results = await dynamo.send(
        new DeleteCommand({
            TableName: REVIEWS_TABLE,
            Key: {
                entityID: menuID
            }
        })
    ) as IDeleteCommandOutput<Menu>;

    return results.Attributes;
}