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
  getAllUsers,
  NoIdProvidedError,
  getReviewsFromUser,
  getFilters,
  Filter,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEventV2) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const routeKey = event.requestContext.routeKey;
  const userId = event.pathParameters?.id;

  try {
    switch (routeKey) {
      case 'POST /users': {
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
      case 'GET /users': {
        const filter: Filter | undefined = getFilters(event);
        const pagination: PaginationParameters = getPaginationParameters(event);

        body = await getAllUsers(pagination, filter);
        break;
      }
      case 'GET /users/{id}': {
        if (!userId) {
          throw new NoIdProvidedError()
        }

        const user = await getUser(userId);
        if (!user) {
          throw new NotFoundError();
        }
        body = user;
        break;
      }
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
