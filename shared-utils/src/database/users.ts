import {
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
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
} from './index.js';
import {
  EntityType,
  PaginationParameters,
  ReviewPaginatedResponse,
  ReviewPrototype,
  ReviewPrototypePaginatedResponse,
  reviewPrototypeProps,
  User,
  UserPaginatedResponse,
  userProps,
  userSchema
} from '@lunch-box-reviews/shared-types';


/*
  ======================================================================================================

  /users Database Queries

  ======================================================================================================
*/

/**
 * Constructs a new user with a given a JSON string.
 * @param json the JSON object to construct the user from
 * @param oldUser an already existing user used to supply values to the newly constructed user.
 * If this value is provided the existing entityId and created properties will be used. If no user is given, values will instead be sourced from the provided json.
 * @returns the newly constructed user
 */
export async function constructUser(json: any, oldUser?: User) {
  const partialUserSchema = userSchema.transform((data) => {
    return {
      ...data,
      entityType: EntityType.User
    };
  });

  let constructedUserSchema;
  if (!oldUser) {
    constructedUserSchema = partialUserSchema.transform((data) => {
      const currDate: string = new Date().toISOString();
      return {
        ...data,
        created: currDate
      };
    });
  } else {
    constructedUserSchema = partialUserSchema.transform((data) => {
      return {
        ...data,
        entityId: oldUser.entityId,
        created: oldUser.created
      }
    }) 
  }

  console.log(`schema: ${JSON.stringify(constructedUserSchema)}`);

  const user = constructedUserSchema.parse(json);
  return user;
}

/**
 * Stores a user in the database.
 * @param user the user to store
 * @returns the newly created user
 */
export async function createUser(user: User) {
  console.log(`new user: ${user}`);
  // Add the new user to the database.
  const dynamo = getDynamoDbClient();
  await dynamo.send(
    new PutCommand({
      TableName: REVIEWS_TABLE,
      Item: user,
    })
  ) as IPutCommandOutput<User>;

  return user;
}

/**
 * Gets a list of users in the database.
 * @param pagination the pagination parameters used to query the database
 * @param criteriaFilter an optional criteria filter used to query the database
 * @returns a list of users and the last evaluated key
 */
export async function getAllUsers(
  pagination?: PaginationParameters,
  criteriaFilter?: CriteriaFilter
): Promise<UserPaginatedResponse> {
  let indexName: string;
  let keyConditionExpression: string;
  let expressionAttributeValues: Record<string, string>;

  // Query the database for users using a criteria and filter.
  if (criteriaFilter) {
    const filter = criteriaFilter.filter;
    const criteria = criteriaFilter.criteria;

    if (criteria !== userProps.userName && criteria !== userProps.userEmail)
      throw new Error('Unsupported criteria');

    indexName = `GSI-${userProps.entityId}-${criteria}`;
    keyConditionExpression = `${userProps.entityType} = :pkValue AND begins_with(${criteria}, :skValue)`;
    expressionAttributeValues = {
      ':pkValue': EntityType.User,
      ':skValue': filter
    };
  }
  // Query the database for all users.
  else {
    indexName = `GSI-${userProps.entityType}`;
    keyConditionExpression = `${userProps.entityType} = :pkValue`;
    expressionAttributeValues = {
      ':pkValue': EntityType.User
    };
  }

  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new QueryCommand({
      TableName: REVIEWS_TABLE,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ProjectionExpression: userProps.keys,
      ExclusiveStartKey: decodeCursor(pagination?.cursor),
      Limit: pagination?.limit,
    })
  ) as IQueryCommandOutput<User>;

  return {
    items: results.Items ?? [],
    nextCursor: encodeCursor(results.LastEvaluatedKey)
  };
}

/**
 * Retrieves a user from the database.
 * @param userId the id of the user to retrieve
 * @returns the user retrieved
 */
export async function getUser(userId: string): Promise<User | undefined> {
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new GetCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: userId
      },
      ProjectionExpression: userProps.keys
    })
  ) as IGetCommandOutput<User>;

  return results.Item;
}

/**
 * Retrieves a list of ReviewPrototypes with a given user.
 * @param userId the ID of the user that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a PaginatedResponse containing ReviewPrototype objects
 */
export async function getReviewPrototypesFromUser(
  userId: string,
  pagination?: PaginationParameters
): Promise<ReviewPrototypePaginatedResponse> {
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new QueryCommand({
      TableName: REVIEWS_TABLE,
      IndexName: `GSI-${reviewPrototypeProps.entityType}-${reviewPrototypeProps.userId}`,
      KeyConditionExpression: `${reviewPrototypeProps.entityType} = :pkValue AND ${reviewPrototypeProps.userId} = :skValue`,
      ExpressionAttributeValues: {
        ':pkValue': EntityType.Review,
        ':skValue': userId
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
 * Retrieves a list of reviews with a given user.
 * @param userId the ID of the user that will be used to retrieve the list of reviews
 * @param pagination the pagination parameters used to query the database
 * @returns a list of reviews submitted by the given user
 */
export async function getReviewsFromUser(
  userId: string,
  pagination?: PaginationParameters
): Promise<ReviewPaginatedResponse> {
  return await convertReviewPrototypesToDto(
    await getReviewPrototypesFromUser(userId, pagination)
  );
}

/**
 * Retrieves a list of food items with a given user
 * @param userId the id of the user that will be used to retrieve the list of food items
 * @param pagination the pagination parameters used to query the database
 * @returns a list of food items that have been reviewed by the given user
 */
// export async function getFoodItemsFromUser(userId: string, pagination?: PaginationParameters) {
//   // Query the database for reviews with the provided userId.
//   const reviews = await getReviewsFromUser(userId, pagination);

//   // If there are no results of the initial query we will return an empty list and not bother with the secondary queries.
//   if (!reviews.Items) {
//     return {
//       Items: [],
//       LastEvaluatedKey: reviews.LastEvaluatedKey
//     };
//   }

//   // Retreive each food entity for every foodId retrieved in the previous query.
//   const foodItems: FoodItem[] = [];
//   const promises = reviews.Items.map(async (review) => {
//     const foodItem = await getFoodItem(review.foodId);
//     if (foodItem && !foodItems.find(f => f.entityId === foodItem.entityId))
//       foodItems.push(foodItem);
//   });
//   await Promise.all(promises);

//   // Return the results of the query and the last evaluated key.
//   return {
//     Items: foodItems,
//     LastEvaluatedKey: reviews.LastEvaluatedKey
//   };
// }

/**
 * Updates an existing user in the database.
 * @param user a user containing the updated information
 * @returns the updated attributes of the user
 */
export async function updateUser(user: User) {
  const dynamo = getDynamoDbClient();
  const result = await dynamo.send(
    new UpdateCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: user.entityId
      },
      UpdateExpression: `SET
        ${userProps.userName} = :newName,
        ${userProps.userEmail} = :newEmail,
        ${userProps.created} = :newCreated`,
      ConditionExpression: `attribute_exists(${userProps.entityId})`,
      ExpressionAttributeValues: {
        ':newName': user.userName,
        ':newEmail': user.userEmail,
        ':newCreated': user.created
      },
      ReturnValues: 'UPDATED_NEW'
    })
  ) as IUpdateCommandOutput<User>;

  return result.Attributes;
}

/**
 * Removes an existing user and all of the reviews submitted by the user from the database.
 * @param userId the ID of the user to remove
 * @returns the removed user
 */
export async function deleteUser(userId: string) {
  // Delete all reviews for the provided user.
  const reviews = await getReviewPrototypesFromUser(userId);
  if (reviews.items) {
    const promises = reviews.items.map(async (review) => {
      await deleteReview(review);
    });
    await Promise.all(promises);
  }

  // Delete the user.
  const dynamo = getDynamoDbClient();
  const results = await dynamo.send(
    new DeleteCommand({
      TableName: REVIEWS_TABLE,
      Key: {
        entityId: userId
      }
    })
  ) as IDeleteCommandOutput<User>;

  return results.Attributes;
}