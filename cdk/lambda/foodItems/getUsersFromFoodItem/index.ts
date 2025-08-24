import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    getPaginationParameters,
    getUsersFromFoodItems,
    PaginationParameters,
    RequestError
} from '@lunch-box-reviews/shared-utils';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    try {
        // Get the userID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw new Error('FoodID is undefined');

        const pagination: PaginationParameters = await getPaginationParameters(event);
        body = await getUsersFromFoodItems(foodID, pagination);
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