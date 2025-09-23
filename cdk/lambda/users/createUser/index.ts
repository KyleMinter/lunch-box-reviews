import {
    getAuthorizationHeaders,
    validateJwtToken,
    constructUser,
    createUser,
    getUser,
    updateUser,
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
            throw new BadRequestError('No user provided in request body');

        // Construct a new user using the request body.
        const json = JSON.parse(event.body);
        json.entityID = jwt.sub!;
        const user = await constructUser(json);

        // Check if the user is already in the database.
        const userInDatabase = await getUser(jwt.sub!)
        if (userInDatabase) {
            // If needed, update the user in the database.
            if (user.userName !== userInDatabase.userName || user.userEmail !== userInDatabase.userEmail) {
                await updateUser(user);
                body = user;
            }
            else
                body = userInDatabase;    
        }
        else {
            // If the user is not in the database, we will add them to it.
            body = await createUser(user);
        }
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