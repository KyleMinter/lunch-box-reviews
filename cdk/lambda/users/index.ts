import {
  getPaginationParameters,
  PaginationParameters,
  RequestError,
  getAuthorizationHeaders,
  validateJwtToken,
  NoBodyProvidedError,
  NotFoundError,
  constructUser,
  User,
  getUser,
  updateUser,
  createUser,
  CriteriaFilter,
  getCriteriaFilterParameters,
  getAllUsers,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const method = (event as any).httpMethod ?? (event as any).requestContext?.http?.method;
  const userId = event.pathParameters?.id;

  try {
    switch (method) {
      case 'POST': {
        /*
          ==========================================================================================
          POST /users
          ==========================================================================================
        */

        if (!event.body || event.body.length === 0)
          throw new NoBodyProvidedError();

        const json = JSON.parse(event.body);
        const jwt = await validateJwtToken(event);
        json.entityId = jwt.sub;
        const user: User = await constructUser(json);

        // Check if the user is already in the database.
        const userInDatabase = await getUser(user.entityId)
        if (userInDatabase) {
          // If needed, update the user in the database.
          if (user.userName !== userInDatabase.userName || user.userEmail !== userInDatabase.userEmail) {
            await updateUser(user);
            body = user;
          }
          else {
            body = userInDatabase;
          }
        }
        else {
          // If the user is not in the database, we will add them to it.
          body = await createUser(user);
        }
        break;
      }
      // case 'PUT': {
      //   /*
      //     ==========================================================================================
      //     PUT /users/{id}
      //     ==========================================================================================
      //   */
      //   // Get the request's query parameters.
      //   const queryParams = event.queryStringParameters;
      //   if (queryParams)
      //     throw new Error('Query parameters are not supported for this endpoint');

      //   // Get the userID from the request's path parameter.
      //   const userID = event.pathParameters?.id;
      //   if (!userID)
      //     throw new Error('UserID is undefined');

      //   // Ensure that a body was sent with the request.
      //   if (!event.body)
      //     throw new BadRequestError('No user provided in request body');

      //   // Ensure that a user with the provided ID exists.
      //   const userInDatabase = await getUser(userID);
      //   if (!userInDatabase) {
      //     throw new BadRequestError('User with provided ID does not exist');
      //   }

      //   // Validate user permissions.
      //   const jwt = await validateJwtToken(event);
      //   await validateUserPermissions(jwt.sub!, [
      //     UserPermission.adminUserPermissions
      //   ]);

      //   // Update the user.
      //   const json = JSON.parse(event.body);
      //   json.entityID = userInDatabase.entityID;
      //   const user: User = await constructUser(json);
      //   body = await updateUser(user);
      //   break;
      // }
      // case 'DELETE': {
      //   /*
      //     ==========================================================================================
      //     DELETE /users/{id}
      //     ==========================================================================================
      //   */
      //   // Get the request's query parameters.
      //   const queryParams = event.queryStringParameters;
      //   if (queryParams)
      //     throw new Error('Query parameters are not supported for this endpoint');

      //   // Get the userID from the request's path parameter.
      //   const userID = event.pathParameters?.id;
      //   if (!userID)
      //     throw new Error('UserID is undefined');

      //   // Ensure that a user with the provided ID exists.
      //   const userInDatabase = await getUser(userID);
      //   if (!userInDatabase) {
      //     throw new BadRequestError('Review with provided ID does not exist');
      //   }

      //   // Validate user permissions.
      //   const jwt = await validateJwtToken(event);
      //   await validateUserPermissions(jwt.sub!, [
      //     UserPermission.adminUserPermissions
      //   ]);

      //   // Delete the user.
      //   body = await deleteUser(userID);
      //   break;
      // }
      case 'GET': {
        /*
          ==========================================================================================
          GET /users/{id}
          ==========================================================================================
        */
        if (userId) {
          // Getting one user by id.
          const user = await getUser(userId);
          if (!user) {
            throw new NotFoundError();
          }
          body = user;
        } else {
          // Getting a list of reviews.
          const filter: CriteriaFilter | undefined = getCriteriaFilterParameters(event);
          const pagination: PaginationParameters = getPaginationParameters(event);

          body = await getAllUsers(pagination, filter);
        }

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
