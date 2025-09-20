import {
    validateJwtToken,
    validateUserPermissions,
    getAuthorizationHeaders,
    getReview,
    deleteReview,
    RequestError,
    BadRequestError
} from '@lunch-box-reviews/shared-utils';
import {
    UserPermission
} from '@lunch-box-reviews/shared-types';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,DELETE');
    
    try {
        // Get the request's query parameters.
        const queryParams = event.queryStringParameters;
        if (queryParams)
            throw new Error('Query parameters are not supported for this endpoint');

        // Get the reviewID from the request's path parameter.
        const reviewID = event.pathParameters?.id;
        if (!reviewID)
            throw new Error('ReviewID is undefined');

        // Ensure that a review with the provided ID exists.
        const reviewInDatabase = await getReview(reviewID);
        if (!reviewInDatabase) {
            throw new BadRequestError('Review with provided ID does not exist');
        }

        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        if (reviewInDatabase.userID == jwt.sub!) {
            await validateUserPermissions(jwt.sub!, [
                UserPermission.userReviewPermissions
            ]);
        }
        else {
            await validateUserPermissions(jwt.sub!, [
                UserPermission.adminReviewPermissions
            ]);
        }

        // Delete the review.
        body = await deleteReview(reviewInDatabase);
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