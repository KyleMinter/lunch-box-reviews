import {
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    constructFoodItem,
    createFoodItem,
    RequestError,
    BadRequestError
} from '@lunch-box-reviews/shared-utils';
import {
    UserPermission,
    FoodItem
} from '@lunch-box-reviews/shared-types';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,POST');
    
    try {
        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.adminFoodItemPermissions
        ]);

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No food item provided in request body');

        const json = JSON.parse(event.body);
        const foodItem: FoodItem = await constructFoodItem(json);
        body = await createFoodItem(foodItem);
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