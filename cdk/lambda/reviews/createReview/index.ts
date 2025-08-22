import {
    validateJwtToken,
    validateUserPermissions,
    Review,
    UserPermission,
    constructReview,
    createReview,
    RequestError,
    BadRequestError,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4} from 'uuid';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    try {
        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.userReviewPermissions
        ]);

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No review provided in request body');

        const review: Review = await constructReview(event.body, jwt.sub!);
        body = await createReview(review);
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