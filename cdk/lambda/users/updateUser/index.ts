import {
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    getUser,
    constructUser,
    updateUser,
    RequestError,
    BadRequestError
} from '@lunch-box-reviews/shared-utils';
import {
    UserPermission,
    User
} from '@lunch-box-reviews/shared-types';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,PUT');
    
    try {
        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Get the userID from the request's path parameter.
        const userID = event.pathParameters?.id;
        if (!userID)
            throw new Error('UserID is undefined');

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No user provided in request body');

         // Ensure that a user with the provided ID exists.
        const userInDatabase = await getUser(userID);
        if (!userInDatabase) {
            throw new BadRequestError('User with provided ID does not exist');
        }

        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.adminUserPermissions
        ]);

        // Update the user.
        const json = JSON.parse(event.body);
        json.entityID = userInDatabase.entityID;
        const user: User = await constructUser(json);
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