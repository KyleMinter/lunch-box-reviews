import {
    getAuthorizationHeaders,
    getPaginationParameters,
    getReviewsFromUser,
    PaginationParameters,
    RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,GET');

    try {
        // Get the reviewID from the request's path parameter.
        const userID = event.pathParameters?.id;
        if (!userID)
            throw Error('UserID is undefined');

        const pagination: PaginationParameters = getPaginationParameters(event);
        body = await getReviewsFromUser(userID, pagination);
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