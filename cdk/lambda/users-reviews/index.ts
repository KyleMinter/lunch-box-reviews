import {
  getAuthorizationHeaders,
  getPaginationParameters,
  getReviewsFromUser,
  MethodNotAllowedError,
  NoIdProvidedError,
  PaginationParameters,
  RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,GET');

  const method = event.httpMethod;
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
      default:
        throw new MethodNotAllowedError();
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