import {
    getAuthorizationHeaders,
    validateJwtToken,
    constructUser,
    createUser,
    RequestError,
    BadRequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,POST');
    
    try {
        // Validate user token.
        const jwt = await validateJwtToken(event);

        // Ensure that a body was sent with the request.
            if (!event.body)
                throw new BadRequestError('No food item provided in request body');

        const user = await constructUser(event.body, jwt.sub!);
        body = await createUser(user);
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