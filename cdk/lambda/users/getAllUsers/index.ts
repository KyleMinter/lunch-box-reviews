import {
    getCriteriaFilterParameters,
    getPaginationParameters,
    getAllUsers,
    RequestError,
    CriteriaFilter,
    PaginationParameters
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

        body = await getAllUsers(pagination, filter);
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