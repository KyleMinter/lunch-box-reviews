import {
  getDateFilterParameters,
  DateFilter,
  getPaginationParameters,
  PaginationParameters,
  getAllReviews,
  RequestError,
  getAuthorizationHeaders,
  getReview,
  validateJwtToken,
  UnauthorizedError,
  updateReview,
  getFoodItem,
  createReview,
  ReviewPrototype,
  constructReview,
  reviewPrototypeToDtoSchema,
  deleteReview,
  NoBodyProvidedError,
  NotFoundError,
  NoIdProvidedError,
} from '@lunch-box-reviews/shared-utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEventV2) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const routeKey = event.requestContext.routeKey;
  const reviewId = event.pathParameters?.id;

  try {
    switch (routeKey) {
      case 'POST /reviews/{id}': {
        if (!event.body || event.body.length === 0) {
          throw new NoBodyProvidedError();
        }

        const json = JSON.parse(event.body);
        const jwt = await validateJwtToken(event);
        json.userId = jwt.sub;
        const review: ReviewPrototype = await constructReview(json);

        const foodItem = await getFoodItem(review.foodId);
        if (!foodItem)
          throw new NotFoundError();

        body = await createReview(review, foodItem);
        break;
      }
      case 'PUT /reviews/{id}': {
        if (!reviewId) {
          throw new NoIdProvidedError();
        }

        if (!event.body || event.body.length === 0) {
          throw new NoBodyProvidedError();
        }

        const reviewInDatabase = await getReview(reviewId);
        if (!reviewInDatabase) {
          throw new NotFoundError();
        }

        const jwt = await validateJwtToken(event);
        if (!jwt.sub || reviewInDatabase.userId !== jwt.sub) {
          throw new UnauthorizedError();
        }

        const json = JSON.parse(event.body);
        const review: ReviewPrototype = await constructReview(json, reviewInDatabase);
        body = await updateReview(review, reviewInDatabase);
        break;
      }
      case 'DELETE /reviews/{id}': {
        if (!reviewId) {
          throw new NoIdProvidedError();
        }

        const reviewInDatabase = await getReview(reviewId);
        if (!reviewInDatabase) {
          throw new NotFoundError()
        }

        const jwt = await validateJwtToken(event);
        if (!jwt.sub || reviewInDatabase.userId !== jwt.sub) {
          throw new UnauthorizedError();
        }

        body = await deleteReview(reviewInDatabase);
        break;
      }
      case 'GET /reviews/{id}': {
        if (!reviewId) {
          throw new NoIdProvidedError();
        }

        const review = await getReview(reviewId);
        if (!review) {
          throw new NotFoundError();
        }
        body = reviewPrototypeToDtoSchema.parse(review);
        break;
      }
      case 'GET /reviews': {
        const filter: DateFilter = getDateFilterParameters(event);
        const pagination: PaginationParameters = getPaginationParameters(event);
        
        body = await getAllReviews(filter, pagination);
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
    console.log(`before stringify: ${body}`);
    if (body) {
      body = JSON.stringify(body);
    }
    console.log(`after stringify: ${body}`);
  }
  return {
    statusCode,
    headers,
    body,
  };
};
