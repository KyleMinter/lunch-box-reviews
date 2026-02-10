import {
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  convertReviewPrototypesToDto,
  CriteriaFilter,
  decodeCursor,
  deleteReview,
  encodeCursor,
  getDynamoDbClient,
  IDeleteCommandOutput,
  IGetCommandOutput,
  IPutCommandOutput,
  IQueryCommandOutput,
  IUpdateCommandOutput,
  REVIEWS_TABLE
} from '.';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../errors';
import { 
  EntityType,
  FoodItem,
  FoodItemPaginatedResponse,
  foodItemProps,
  foodItemSchema,
  PaginationParameters,
  ReviewPaginatedResponse,
  ReviewPrototype,
  ReviewPrototypePaginatedResponse,
  reviewPrototypeProps
} from '@lunch-box-reviews/shared-types';


/*
  ======================================================================================================

  /foodItems Database Queries

  ======================================================================================================
*/

/**
 * Constructs a new food item with a given a JSON string.
 * @param jsonStr the JSON object to construct the food item from
 * @param oldFooditem an already existing food item used to supply values to the newly constructed food item.
 * If this value is provided the existing entityId, totalRating, and numReviews will used. If no food item is given, default values will instead be used/generated.
 * @returns the newly constructed food item
 */
export async function constructFoodItem(json: any, oldFoodItem?: FoodItem) {
  const partialFoodItemSchema = foodItemSchema.transform((data) => {
    return {
      ...data,
      entityType: EntityType.Review
    }
  });

  let constructedFoodItemSchema;
  if (!oldFoodItem) {
    constructedFoodItemSchema = partialFoodItemSchema.transform((data) => {
      return {
        ...data,
        entityId: uuidv4(),
        totalRating: 0,
        numReviews: 0
      };
    });
  } else {
    constructedFoodItemSchema = partialFoodItemSchema.transform((data) => {
      return {
        ...data,
        entityId: oldFoodItem.entityId,
        totalRating: oldFoodItem.totalRating,
        numReviews: oldFoodItem.numReviews
      };
    });
  }

  const foodItem = constructedFoodItemSchema.parse(json);
  return foodItem;
}

/**
 * Stores a food item in the database.
 * @param foodItem the food item to store
 * @returns the newly created food item
 */
export async function createFoodItem(foodItem: FoodItem) {
  const dynamo = getDynamoDbClient();
  await dynamo.send(
    new PutCommand({
      TableName: REVIEWS_TABLE,
      Item: foodItem,
    })
  ) as IPutCommandOutput<FoodItem>;

  return foodItem;
}

/**
 * Gets a list of food items in the database.
 * @param pagination the pagination parameters used to query the database
 * @param criteriaFilter an optional criteria filter used to query the database
 * @returns a list of food items and the last evaluated key
 */
export async function getAllFoodItems(
  pagination?: PaginationParameters,
  criteriaFilter?: CriteriaFilter
): Promise<FoodItemPaginatedResponse> {
  let indexName: string;
  let keyConditionExpression: string;
  let expressionAttributeValues: Record<string, string>;

  // Query the database for food items using a criteria and filter.
  if (criteriaFilter) {
    const filter = criteriaFilter.filter;
    const criteria = criteriaFilter.criteria;

    if (criteria !== foodItemProps.foodName && criteria !== foodItemProps.foodOrigin)
      throw new BadRequestError('Unsupported criteria');

    indexName = `GSI-${foodItemProps.entityType}-${criteria}`;
    keyConditionExpression = `${foodItemProps.entityType} = :pkValue AND begins_with(${criteria}, :skValue)`;
    expressionAttributeValues = {
      ':pkValue': EntityType.FoodItem,
      ':skValue': filter
    };
  }
  // Query the database for all food items.
  else {
    indexName = `GSI-${foodItemProps.entityType}`;
    keyConditionExpression = `${foodItemProps.entityType} = :pkValue`;
    expressionAttributeValues = {
      ':pkValue': EntityType.FoodItem
    };
  }

  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new QueryCommand({
      TableName: REVIEWS_TABLE,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ProjectionExpression: `${foodItemProps.keys}`,
      ExclusiveStartKey: decodeCursor(pagination?.cursor),
      Limit: pagination?.limit,
    })
  ) as IQueryCommandOutput<FoodItem>;

  return {
    items: results.Items ?? [],
    nextCursor: encodeCursor(results.LastEvaluatedKey)
  };
}

/**
 * Retrieves a food item from the database.
 * @param foodId the id of the food item to retrieve
 * @returns the food item retrieved
 */
export async function getFoodItem(foodId: string) {
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new GetCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: foodId
      },
      ProjectionExpression: foodItemProps.keys,
    })
  ) as IGetCommandOutput<FoodItem>;

  return results.Item;
}

/**
 * Retrieves a list of ReviewPrototypes with a given food item.
 * @param foodId the ID of the food item that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a PaginatedResponse containing ReviewPrototype objects
 */
export async function getReviewPrototypesFromFoodItem(
  foodId: string,
  pagination?: PaginationParameters
): Promise<ReviewPrototypePaginatedResponse> {
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new QueryCommand({
      TableName: REVIEWS_TABLE,
      IndexName: `GSI-${reviewPrototypeProps.entityType}-${reviewPrototypeProps.foodId}`,
      KeyConditionExpression: `${reviewPrototypeProps.entityType} = :pkValue AND ${reviewPrototypeProps.foodId} = :skValue`,
      ExpressionAttributeValues: {
        ':pkValue': EntityType.Review,
        ':skValue': foodId
      },
      ProjectionExpression: reviewPrototypeProps.keys,
      ExclusiveStartKey: decodeCursor(pagination?.cursor),
      Limit: pagination?.limit,
    })
  ) as IQueryCommandOutput<ReviewPrototype>;

  return {
    items: results.Items ?? [],
    nextCursor: encodeCursor(results.LastEvaluatedKey)
  };
}

/**
 * Retrieves a list of reviews with a given food item.
 * @param foodId the ID of the food item that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted for the given food item
 */
export async function getReviewsFromFoodItem(
  foodId: string,
  pagination?: PaginationParameters
): Promise<ReviewPaginatedResponse> {
  return await convertReviewPrototypesToDto(
    await getReviewPrototypesFromFoodItem(foodId, pagination)
  );
}

/**
 * Retrieves a list of users with a given food item
 * @param foodId the id of the food item that will be used to retrieve the list of users
 * @param pagination the pagination parameters used to query the database
 * @returns a list of users who have submitted a review for the given food item
 */
// export async function getUsersFromFoodItem(foodId: string, pagination?: PaginationParameters) {
//   // Query the database for reviews with the provided foodId.
//   const reviews = await getReviewsFromFoodItem(foodId, pagination);

//   // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
//   if (!reviews.Items) {
//     return {
//       Items: [],
//       LastEvaluatedKey: reviews.LastEvaluatedKey
//     };
//   }

//   // Retreive each food entity for every userId retrieved in the previous query.
//   const users: User[] = [];
//   const promises = reviews.Items.map(async (review) => {
//     const user = await getUser(review.userId);
//     if (user && !users.find(u => u.entityId === u.entityId))
//       users.push(user);
//   });
//   await Promise.all(promises);

//   // Store the results of the query and the last evaluated key to the response body.
//   return {
//     Items: users,
//     LastEvaluatedKey: reviews.LastEvaluatedKey
//   };
// }

/**
 * Updates an existing food item in the database.
 * @param foodItem a food item containing the updated information
 * @returns the updated attributes of the food item
 */
export async function updateFoodItem(foodItem: FoodItem) {
  const dynamo = getDynamoDbClient();
  const result = await dynamo.send(
    new UpdateCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: foodItem.entityId
      },
      UpdateExpression: `SET
        ${foodItemProps.foodName} = :newName,
        ${foodItemProps.foodOrigin} = :newOrigin,
        ${foodItemProps.foodAttributes} = :newAttributes,
        ${foodItemProps.totalRating} = :newTotalRating,
        ${foodItemProps.numReviews} = :newNumReviews`,
      ConditionExpression: `attribute_exists(${foodItemProps.entityId})`,
      ExpressionAttributeValues: {
        ':newName': foodItem.foodName,
        ':newOrigin': foodItem.foodOrigin,
        ':newAttributes': foodItem.foodAttributes,
        ':newTotalRating': foodItem.totalRating,
        ':newNumReviews': foodItem.numReviews
      },
      ReturnValues: 'UPDATED_NEW'
    })
  ) as IUpdateCommandOutput<FoodItem>;

  return result.Attributes;
}

/**
 * Removes an existing food item, along with all of the reviews submitted for the food item
 * and the menu instances of the food item, from the database.
 * @param foodId the ID of the food item to remove
 * @returns the removed food item
 */
export async function deleteFoodItem(foodId: string) {
  // Delete all reviews for the provided food item.
  const reviews = await getReviewPrototypesFromFoodItem(foodId);
  if (reviews.items) {
    const promises = reviews.items.map(async (review) => {
      await deleteReview(review, false)
    });
    await Promise.all(promises);
  }

  // Delete the food item.
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new DeleteCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: foodId
      }
    })
  ) as IDeleteCommandOutput<FoodItem>;

  return results.Attributes;
}
