import {
  getCriteriaFilterParameters,
  CriteriaFilter,
  getPaginationParameters,
  PaginationParameters,
  RequestError,
  getAuthorizationHeaders,
  NotFoundError,
  getFoodItem,
  getAllFoodItems,
  NoIdProvidedError,
  getReviewsFromFoodItem,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEventV2) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const routeKey = event.requestContext.http.method;
  const foodId = event.pathParameters?.id;
  // const jwt = await validateJwtToken(event);

  try {
    switch (routeKey) {
      case 'GET /foods': {
        const filter: CriteriaFilter | undefined = getCriteriaFilterParameters(event);
        const pagination: PaginationParameters = getPaginationParameters(event);

        body = await getAllFoodItems(pagination, filter);
        break;
      }
      case 'GET /foods/{id}': {
        if (!foodId) {
          throw new NoIdProvidedError();
        }

        const foodItem = await getFoodItem(foodId);
        if (!foodItem) {
          throw new NotFoundError();
        }
        body = foodItem;
        break;
      }
      case 'GET /foods/{id}/reviews': {
        if (!foodId) {
          throw new NoIdProvidedError();
        }

        const pagination: PaginationParameters = getPaginationParameters(event);
        body = await getReviewsFromFoodItem(foodId, pagination);

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
