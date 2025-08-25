import {
    UserPermission,
    User,
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    constructUser,
    updateUser,
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
            UserPermission.adminUserPermissions
        ]);

        // Get the userID from the request's path parameter.
        const userID = event.pathParameters?.id;
        if (!userID)
            throw new Error('UserID is undefined');

        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No user provided in request body');

        const user: User = await constructUser(event.body, userID);
        body = await updateUser(user);
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