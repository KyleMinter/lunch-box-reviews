import {
    getCriteriaFilterParameters,
    CriteriaFilter,
    getPaginationParameters,
    PaginationParameters,
    getAllFoodItems,
    RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application-json',
    };

    try {
        const filter: CriteriaFilter | undefined = getCriteriaFilterParameters(event);
        const pagination: PaginationParameters = getPaginationParameters(event);

        body = await getAllFoodItems(pagination, filter);
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