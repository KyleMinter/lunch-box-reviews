import {
    UserPermission,
    FoodItem,
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    constructFoodItem,
    getFoodItem,
    updateFoodItem,
    RequestError,
    BadRequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,PUT');
    
    try {
        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Get the foodID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw new Error('FoodID is undefined');

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No food item provided in request body');

        // Check to make sure that a food item with the provided ID exists.
        const foodItemInDatabase = await getFoodItem(foodID);
        if (!foodItemInDatabase)
            throw new Error('Food item with provided ID does not exist');

        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.adminFoodItemPermissions
        ]);

        // Update the food item.
        const json = JSON.parse(event.body);
        const foodItem: FoodItem = await constructFoodItem(json, foodItemInDatabase);
        body = await updateFoodItem(foodItem);
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