import {
  getAuthorizationHeaders,
  getPaginationParameters,
  getReviewsFromUser,
  NoIdProvidedError,
  PaginationParameters,
  RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,GET');

  const method = (event as any).httpMethod ?? (event as any).requestContext?.http?.method;
  const userId = event.pathParameters?.id;

  try {
    switch (method) {
      case 'GET': {
        /*
          ==========================================================================================
          GET /users/{id}/reviews
          ==========================================================================================
        */
        if (!userId) {
          throw new NoIdProvidedError();
        }

        const pagination: PaginationParameters = getPaginationParameters(event);
        body = await getReviewsFromUser(userId, pagination);

        break;
      }
    }
  }
  catch (err) {
    if (err instanceof RequestError) {
      statusCode = err.statusCode;
      body = {error: err.message};
    }
    else {
      statusCode = 500;
      body = {error: err instanceof Error ? err.message : String(err)};
    }
  }
  finally {
    if (typeof body === 'string') {
      // Already a string, keep as is
    } else if (body === undefined || body === null) {
      body = JSON.stringify({});
    } else {
      body = JSON.stringify(body);
    }
  }
  return {
    statusCode,
    headers,
    body,
  };
};