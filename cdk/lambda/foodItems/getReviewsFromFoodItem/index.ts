import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    getPaginationParameters,
    getReviewsFromFoodItem,
    RequestError
} from '@lunch-box-reviews/shared-utils';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    try {
        // Get the foodID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw Error('FoodID is undefined');

        const { limit, offset } = getPaginationParameters(event);

        // Store the results of the query and the last evaluated key to the response body.
        body = await getReviewsFromFoodItem(foodID, limit, offset);
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