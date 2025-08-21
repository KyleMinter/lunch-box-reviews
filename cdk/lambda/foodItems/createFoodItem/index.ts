import {
    EntityType,
    UserFlag,
    FoodItem,
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    createFoodItem,
    RequestError,
    BadRequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4} from 'uuid';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,POST');
    
    try {
        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserFlag.canSubmitFoodItems
        ]);

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No food item provided in request body');

        // Construct a new food item to add to the database.
        const foodItem: FoodItem = JSON.parse(event.body);
        foodItem.entityID = uuidv4();
        foodItem.entityType = EntityType.FoodItem;

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