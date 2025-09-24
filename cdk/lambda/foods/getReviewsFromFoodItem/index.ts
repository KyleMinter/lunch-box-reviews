import {
    getAuthorizationHeaders,
    getPaginationParameters,
    getReviewsFromFoodItem,
    PaginationParameters,
    RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,GET');

    try {
        // Get the foodID from the request's path parameter.
        const foodID = event.pathParameters?.id;
        if (!foodID)
            throw Error('FoodID is undefined');

        const pagination: PaginationParameters = getPaginationParameters(event);

        // Store the results of the query and the last evaluated key to the response body.
        body = await getReviewsFromFoodItem(foodID, pagination);
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