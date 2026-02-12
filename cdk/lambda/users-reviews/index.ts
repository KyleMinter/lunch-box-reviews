import {
  getAuthorizationHeaders,
  getPaginationParameters,
  getReviewsFromUser,
  NoIdProvidedError,
  PaginationParameters,
  RequestError
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEventV2) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,GET');

  const routeKey = event.requestContext.http.method;
  const userId = event.pathParameters?.id;

  try {
    switch (routeKey) {
      case 'GET /users/{id}/reviews': {
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
    if (err instanceof Error) {
      body = err.message;
      if (err instanceof RequestError) {
        statusCode = err.statusCode;
      } else {
        statusCode = 500;
      }
    } else {
      body = err;
    }
    body = { error: body };
  }
  finally {
    if (body) {
      body = JSON.stringify(body);
    }
  }
  return {
    statusCode,
    headers,
    body,
  };
};