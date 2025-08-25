import {
    UserPermission,
    FoodItem,
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    constructFoodItem,
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
        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.adminFoodItemPermissions
        ]);

        // Get the foodID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw new Error('FoodID is undefined');

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No food item provided in request body');

        const foodItem: FoodItem = await constructFoodItem(event.body, foodID);
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