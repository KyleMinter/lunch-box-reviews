import {
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    getFoodItem,
    deleteFoodItem,
    RequestError,
} from '@lunch-box-reviews/shared-utils';
import { UserPermission } from '@lunch-box-reviews/shared-types';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,DELETE');
    
    try {
        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Get the foodID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw new Error('FoodID is undefined');

        // Ensure that a food item with the provided ID exists.
        const foodItem = await getFoodItem(foodID);
        if (!foodItem)
            throw new Error('Food item with provided ID does not exist');

        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.adminFoodItemPermissions
        ]);

        // Delete the food item.
        body = await deleteFoodItem(foodID);
    }
    catch (err) {
        if (err instanceof RequestError) {
            statusCode = err.statusCode;
            body = err.message;
        }
        else {
            statusCode = 500;
            body = err;
        }
    }
    finally {
        body = JSON.stringify(body);
    }
    return {
        statusCode,
        headers,
        body,
    };
};