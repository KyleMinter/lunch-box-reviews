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
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEventV2) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const method = event.requestContext.http.method;
  const foodId = event.pathParameters?.id;
  // const jwt = await validateJwtToken(event);

  try {
    switch (method) {
      // case 'POST': {
      //   /*
      //     ==========================================================================================
      //     POST /foods
      //     ==========================================================================================
      //   */
      //   // Validate user permissions.
      //   const jwt = await validateJwtToken(event);
      //   await validateUserPermissions(jwt.sub!, [
      //     UserPermission.adminFoodItemPermissions
      //   ]);

      //   // Ensure that a body was sent with the request.
      //   if (!event.body)
      //     throw new BadRequestError('No food item provided in request body');

      //   const json = JSON.parse(event.body);
      //   const foodItem: FoodItem = await constructFoodItem(json);
      //   body = await createFoodItem(foodItem);
      //   break;
      // }
      // case 'PUT': {
      //   /*
      //     ==========================================================================================
      //     PUT /foods/{id}
      //     ==========================================================================================
      //   */
      //   // Get the request's query parameters.
      //   const queryParams = event.queryStringParameters;
      //   if (queryParams)
      //     throw new Error('Query parameters are not supported for this endpoint');

      //   // Get the foodID from the request's path parameter.
      //   const foodID = event.pathParameters?.id;
      //   if (!foodID)
      //     throw new Error('FoodID is undefined');

      //   // Ensure that a body was sent with the request.
      //   if (!event.body)
      //     throw new BadRequestError('No food item provided in request body');

      //   // Check to make sure that a food item with the provided ID exists.
      //   const foodItemInDatabase = await getFoodItem(foodID);
      //   if (!foodItemInDatabase)
      //     throw new Error('Food item with provided ID does not exist');

      //   // Validate user permissions.
      //   const jwt = await validateJwtToken(event);
      //   await validateUserPermissions(jwt.sub!, [
      //     UserPermission.adminFoodItemPermissions
      //   ]);

      //   // Update the food item.
      //   const json = JSON.parse(event.body);
      //   const foodItem: FoodItem = await constructFoodItem(json, foodItemInDatabase);
      //   body = await updateFoodItem(foodItem);
      //   break;
      // }
      // case 'DELETE': {
      //   /*
      //     ==========================================================================================
      //     DELETE /foods/{id}
      //     ==========================================================================================
      //   */
      //   // Get the request's query parameters.
      //   const queryParams = event.queryStringParameters;
      //   if (queryParams)
      //     throw new Error('Query parameters are not supported for this endpoint');

      //   // Get the foodID from the request's path parameter.
      //   const foodID = event.pathParameters?.id;
      //   if (!foodID)
      //     throw new Error('FoodID is undefined');

      //   // Ensure that a food item with the provided ID exists.
      //   const foodItem = await getFoodItem(foodID);
      //   if (!foodItem)
      //     throw new Error('Food item with provided ID does not exist');

      //   // Validate user permissions.
      //   const jwt = await validateJwtToken(event);
      //   await validateUserPermissions(jwt.sub!, [
      //     UserPermission.adminFoodItemPermissions
      //   ]);

      //   // Delete the food item.
      //   body = await deleteFoodItem(foodID);
      //   break;
      // }
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
      case 'GET /foods': {
        const filter: CriteriaFilter | undefined = getCriteriaFilterParameters(event);
        const pagination: PaginationParameters = getPaginationParameters(event);

        body = await getAllFoodItems(pagination, filter);
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
