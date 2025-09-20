import {
    getAuthorizationHeaders,
    getUser,
    RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,GET');

    try {
        // Get the userID from the request's path parameter.
        const userID = event.pathParameters?.id;
        if (!userID)
            throw new Error('UserID is undefined');

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        body = await getUser(userID);
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