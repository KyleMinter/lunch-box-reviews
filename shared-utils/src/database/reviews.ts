import {
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import {
  decodeCursor,
  encodeCursor,
  getDynamoDbClient,
  getFoodItem,
  IDeleteCommandOutput,
  IGetCommandOutput,
  IPutCommandOutput,
  IQueryCommandOutput,
  IUpdateCommandOutput,
  reviewPrototypeToDtoSchema,
  REVIEWS_TABLE,
  updateFoodItem
} from './index.js';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../errors/index.js';
import {
  EntityType,
  FoodItem,
  PaginationParameters,
  Review,
  ReviewPaginatedResponse,
  ReviewPrototype,
  ReviewPrototypePaginatedResponse,
  reviewPrototypeProps,
  reviewPrototypeSchema,
  DateFilter
} from '@lunch-box-reviews/shared-types';


/*
  ======================================================================================================

  /reviews Database Queries

  ======================================================================================================
*/

/**
 * Rounds a number to a given number of decimal places.
 * @param num the number to round
 * @param places the amount of decimal places to round to
 * @return the rounded number
 */
function roundTo(num: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
}

function getAndValidateRatings(json: any) {
  // Convert the ratings to numbers
  let quality: number = Number(json.quality);
  let quantity: number = Number(json.quantity);

  // Valiate quality and quantity ratings.
  if (isNaN(quality) || isNaN(quantity) || quality > 10 ||
    quality < 1 || quantity < 1 || quantity > 5) {
    throw new BadRequestError('Invalid review ratings provided');
  }

  // Round quality rating to two decimal places and truncate the quantity rating.
  quality = roundTo(quality as number, 2);
  quantity = Math.trunc(quantity as number);

  let rating = quality * Math.sqrt(quantity / 5);
  rating = roundTo(rating, 2);

  return {
    quality,
    quantity,
    rating
  };
}

/**
 * Constructs a new review with a given a JSON string.
 * @param jsonStr the JSON object to construct the review from
 * @param oldReview an already existing review used to supply values to the newly constructed review.
 * If this value is provided the existing entityId, userId, and foodId will used. If no review is given, values will instead be sourced from the provided json.
 * @returns the newly constructed review
 */
export async function constructReview(json: any, oldReview?: ReviewPrototype): Promise<ReviewPrototype> {
  const { quality, quantity, rating } = getAndValidateRatings(json);
  const currDate: string = new Date().toISOString();

  const preFilledJson = {
    ...json,
    entityId: oldReview?.entityId ?? uuidv4(),
    userId: oldReview?.userId ?? json.userId,
    foodId: oldReview?.foodId ?? json.foodId,
    quality: quality,
    quantity: quantity,
    rating: rating,
    reviewDate: currDate
  };

  const review = reviewPrototypeSchema.parse(preFilledJson);
  return review;
}

/**
 * Stores a review in the database.
 * @param review the review to store
 * @param foodItem the food item the review is for
 * @returns the newly created review
 */
export async function createReview(review: ReviewPrototype, foodItem: FoodItem) {
  // Update the total rating for the corresponding food item.
  foodItem.totalRating += review.rating;
  foodItem.numReviews++;
  await updateFoodItem(foodItem);

  const dynamo = getDynamoDbClient();
  await dynamo.send(
    new PutCommand({
      TableName: REVIEWS_TABLE,
      Item: review,
    })
  ) as IPutCommandOutput<ReviewPrototype>;

  return review;
}

/**
 * Gets a list of reviews in the database.
 * @param Datefilter the date filter used to query the database
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews and the last evaluated key
 */
export async function getAllReviews(
  dateFilter: DateFilter,
  pagination?: PaginationParameters,
): Promise<ReviewPaginatedResponse> {
  let indexName: string;
  let keyConditionExpression: string;
  let expressionAttributeValues: Record<string, string>;

  const startDate = dateFilter.startDate;
  const endDate = dateFilter.endDate;

  if (startDate && endDate) {
    indexName = `GSI-${reviewPrototypeProps.entityType}-${reviewPrototypeProps.reviewDate}`;
    keyConditionExpression = `${reviewPrototypeProps.entityType} = :pkValue AND ${reviewPrototypeProps.reviewDate} BETWEEN :startDate AND :endDate`;
    expressionAttributeValues = {
      ':pkValue': EntityType.Review,
      ':startDate': startDate,
      ':endDate': endDate
    };
  }
  else if (startDate) {
    indexName = `GSI-${reviewPrototypeProps.entityType}-${reviewPrototypeProps.reviewDate}`;
    keyConditionExpression = `${reviewPrototypeProps.entityType} = :pkValue AND ${reviewPrototypeProps.reviewDate} >= :startDate`;
    expressionAttributeValues = {
      ':pkValue': EntityType.Review,
      ':startDate': startDate
    };
  }
  else if (endDate) {
    indexName = `GSI-${reviewPrototypeProps.entityType}-${reviewPrototypeProps.reviewDate}`;
    keyConditionExpression = `${reviewPrototypeProps.entityType} = :pkValue AND ${reviewPrototypeProps.reviewDate} <= :endDate`;
    expressionAttributeValues = {
      ':pkValue': EntityType.Review,
      ':endDate': endDate
    };
  }
  // Query the database for all reviews.
  else {
    indexName = `GSI-${reviewPrototypeProps.entityType}`;
    keyConditionExpression = `${reviewPrototypeProps.entityType} = :pkValue`;
    expressionAttributeValues = {
      ':pkValue': EntityType.Review
    };
  }

  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new QueryCommand({
      TableName: REVIEWS_TABLE,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ProjectionExpression: reviewPrototypeProps.keys,
      ExclusiveStartKey: decodeCursor(pagination?.cursor),
      Limit: pagination?.limit,
    })
  ) as IQueryCommandOutput<ReviewPrototype>;

  return await convertReviewPrototypesToDto({
    items: results.Items ?? [],
    nextCursor: encodeCursor(results.LastEvaluatedKey)
  });
}

/**
 * Converts all ReviewPrototype instances in a given PaginatedResponse to Review.
 * @param response a PaginatedResponse containing ReviewPrototype objects
 * @returns a PaginatedResponse containing Review objects
 */
export async function convertReviewPrototypesToDto(
  response: ReviewPrototypePaginatedResponse
): Promise<ReviewPaginatedResponse> {
  let items: Review[] = [];
  if (response.items) {
    const promises = await response.items.map(async (review) => {
      return reviewPrototypeToDtoSchema.parse(review);
    });

    items = await Promise.all(promises);
  }

  return {
    items: items,
    nextCursor: response.nextCursor
  };
}

/**
 * Retrieves a review from the database.
 * @param reviewId the id of the review to retrieve
 * @returns the review retrieved
 */
export async function getReview(reviewId: string) {
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new GetCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: reviewId
      },
      ProjectionExpression: reviewPrototypeProps.keys,
    })
  ) as IGetCommandOutput<ReviewPrototype>;

  return results.Item;
}

/**
 * Updates an existing review in the database.
 * @param review a review containing the updated information
 * @param oldReview the old review containing the outdated information
 * @returns the updated attributes of the review
 */
export async function updateReview(review: ReviewPrototype, oldReview: ReviewPrototype) {
  // Update the total rating for the corresponding food item.
  const foodItem: FoodItem = (await getFoodItem(review.foodId))!;
  foodItem.totalRating -= oldReview.rating;
  foodItem.totalRating += review.rating;
  await updateFoodItem(foodItem);

  const dynamo = getDynamoDbClient();
  const result = await dynamo.send(
    new UpdateCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: review.entityId
      },
      UpdateExpression: `SET
        ${reviewPrototypeProps.quality} = :newQuality,
        ${reviewPrototypeProps.quantity} = :newQuantity,
        ${reviewPrototypeProps.rating} = :newRating,
        ${reviewPrototypeProps.reviewDate} = :newDate`,
      ConditionExpression: `attribute_exists(${reviewPrototypeProps.entityId})`,
      ExpressionAttributeValues: {
        ':newQuality': review.quality,
        ':newQuantity': review.quantity,
        ':newRating': review.rating,
        ':newDate': review.reviewDate
      },
      ReturnValues: 'UPDATED_NEW'
    })
  ) as IUpdateCommandOutput<ReviewPrototype>;

  return result.Attributes;
}

/**
 * Removes an existing review from the database.
 * @param review the review to remove
 * @param updateFoodItemRating a flag which determines if the corresponding food item should have it's total rating updated upon this review's deletion.
 * This flag is optional and is set to true by default, and should only be set to false when this function is called as the result of a food items deletion.
 * @returns the removed review
 */
export async function deleteReview(review: ReviewPrototype, updateFoodItemRating: boolean = true) {
  // Update the total rating for the corresponding food item.
  if (updateFoodItemRating) {
    const foodItem = (await getFoodItem(review.foodId))!;
    foodItem.totalRating -= review.rating;
    foodItem.numReviews--;
    await updateFoodItem(foodItem);
  }

  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new DeleteCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: review.entityId
      }
    })
  ) as IDeleteCommandOutput<ReviewPrototype>;

  return results.Attributes;
}