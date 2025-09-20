import {
    getAuthorizationHeaders,
    getReview,
    RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,GET');

    try {
        // Get the reviewID from the request's path parameter.
        const reviewID = event.pathParameters?.id;
        if (!reviewID)
            throw new Error('ReviewID is undefined');

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        body = await getReview(reviewID);
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