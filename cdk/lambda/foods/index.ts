import {
  getPaginationParameters,
  PaginationParameters,
  RequestError,
  getAuthorizationHeaders,
  NotFoundError,
  getFoodItem,
  getAllFoodItems,
  NoIdProvidedError,
  getReviewsFromFoodItem,
  getFilters,
  Filter,
  NoBodyProvidedError,
  validateJwtToken,
  UnauthorizedError,
  FoodItem,
  constructFoodItem,
  createFoodItem,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEventV2) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const routeKey = event.requestContext.routeKey;
  const foodId = event.pathParameters?.id;

  try {
    switch (routeKey) {
      case 'POST /foods': {
        if (!event.body || event.body.length === 0)
          throw new NoBodyProvidedError();

        const jwt = await validateJwtToken(event);
        const adminRole = process.env.AUTH0_CLAIM_NAMESPACE!
        const roles = jwt[adminRole] || [];
        if (!roles.include('Admin')) {
          throw new UnauthorizedError();
        }

        const json = JSON.parse(event.body);
        const food: FoodItem = await constructFoodItem(json);
        body = await createFoodItem(food);
        break;
      }
      case 'GET /foods': {
        const filter: Filter | undefined = getFilters(event);
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
