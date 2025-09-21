import {
    Review,
    UserPermission,
    ReviewProps,
    validateJwtToken,
    validateUserPermissions,
    constructReview,
    createReview,
    RequestError,
    BadRequestError,
    getFoodItem,
    getAuthorizationHeaders,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,POST');

    try {
        // Validate user permissions.
        const jwt = await validateJwtToken(event);
        await validateUserPermissions(jwt.sub!, [
            UserPermission.userReviewPermissions
        ]);

        // Ensure that a body was sent with the request.
        if (!event.body)
            throw new BadRequestError('No review provided in request body');

        // If a food item is being supplied, we will verify it actually exists.
        const json = JSON.parse(event.body);
        if (!json.foodID)
            throw new BadRequestError(`No ${ReviewProps.foodID} provided in request body`);

        // Validate foodID.
        const foodItem = await getFoodItem(json.foodID);
        if (!foodItem)
            throw new BadRequestError(`Provided ${ReviewProps.foodID} matches no existing elements`);

        json.userID = jwt.sub!;
        const review: Review = await constructReview(json);
        body = await createReview(review, foodItem);
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