import {
    getDateFilterParameters,
    DateFilter,
    getPaginationParameters,
    PaginationParameters,
    getAllReviews,
    RequestError,
    getAuthorizationHeaders,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = getAuthorizationHeaders('OPTIONS,GET');

    try {
        const filter: DateFilter = getDateFilterParameters(event);
        const pagination: PaginationParameters = getPaginationParameters(event);
        
        body = await getAllReviews(filter, pagination);
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