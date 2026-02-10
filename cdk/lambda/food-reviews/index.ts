import {
  getAuthorizationHeaders,
  getPaginationParameters,
  getReviewsFromFoodItem,
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
  const foodId = event.pathParameters?.id;

  try {
    switch (method) {
      case 'GET': {
        /*
          ==========================================================================================
          GET /foods/{id}/reviews
          ==========================================================================================
        */
        if (!foodId) {
          throw new NoIdProvidedError();
        }

        const pagination: PaginationParameters = getPaginationParameters(event);
        body = await getReviewsFromFoodItem(foodId, pagination);

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