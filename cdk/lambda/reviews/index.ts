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
import { APIGatewayProxyEvent } from 'aws-lambda';


export const handler = async (event: APIGatewayProxyEvent) => {
  let body;
  let statusCode = 200;
  const headers = getAuthorizationHeaders('OPTIONS,POST,PUT,GET,DELETE');

  const method = (event as any).httpMethod ?? (event as any).requestContext?.http?.method;
  const reviewId = event.pathParameters?.id;

  console.log(`event.httpMethod: ${event.httpMethod}\nevent.requestContext.httpMethod: ${event.requestContext.httpMethod}\nmethod: ${method}`);

  try {
    switch (method) {
      case 'POST': {
        /*
          ==========================================================================================
          POST /reviews
          ==========================================================================================
        */
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
      case 'PUT': {
        /*
          ==========================================================================================
          PUT /reviews/{id}
          ==========================================================================================
        */
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
      case 'DELETE': {
        /*
          ==========================================================================================
          DELETE /reviews/{id}
          ==========================================================================================
        */
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
      case 'GET': {
        /*
          ==========================================================================================
          GET /reviews/{id}
          ==========================================================================================
        */
        if (reviewId) {
          // Getting one review by id.
          const review = await getReview(reviewId);
          if (!review) {
            throw new NotFoundError();
          }
          body = reviewPrototypeToDtoSchema.parse(review);
        } else {
          // Getting a list of reviews.
          const filter: DateFilter = getDateFilterParameters(event);
          const pagination: PaginationParameters = getPaginationParameters(event);
          
          body = await getAllReviews(filter, pagination);
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
    console.log('Before finally - body:', body);
    if (typeof body === 'string') {
      // Already a string, keep as is
    } else if (body === undefined || body === null) {
      body = JSON.stringify({});
    } else {
      body = JSON.stringify(body);
    }
    console.log('After finally - body:', body);
  }
  console.log('Response:', { statusCode, body });
  return {
    statusCode,
    headers,
    body,
  };
};
