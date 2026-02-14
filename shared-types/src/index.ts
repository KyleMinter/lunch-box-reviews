import { z } from "zod";


const props = <T extends z.ZodObject<any>>(schema: T) => {
  const keys = Object.keys(schema.shape) as Array<keyof z.infer<T>>;
  const map = keys.reduce((acc, key) => {
    acc[key] = key;
    return acc;
  }, {} as { [K in keyof z.infer<T>]: K});

  return {
    ...map,
    keys: keys.join(',')
  };
};

/*
  ======================================================================================================

  Entity types

  ======================================================================================================
*/

/**
 * An enum representing an entity type stored in the Reviews Table.
 * Can either one of the following: 
 * ```
 * Review
 * User
 * FoodItem
 * ```
 */
export enum EntityType {
  Review = 'review',
  User = 'user',
  FoodItem = 'foodItem'
}
export const entityTypeSchema = z.nativeEnum(EntityType);

/**
 * An interface representing an entity stored in the Reviews Table.
 * Contains the unique ID and the entity type of a given entity instance.
 */
export type Entity = z.infer<typeof entitySchema>;
export const entitySchema = z.object({
  entityId: z.string(),
  entityType: entityTypeSchema
});
export const entityProps = props(entitySchema);

/*
  ======================================================================================================

  Food types

  ======================================================================================================
*/


/**
 * An interface representing the attributes of a food item stored in the Reviews Table.
 * Contains a description and the nutritional information of the food item.
 */
export type FoodAttributes = z.infer<typeof foodAttributesSchema>;
export const foodAttributesSchema = z.object({
  description: z.string().optional(),
  nutrition: z.string().optional()
})

/**
 * An interface representing a food item entity stored in the Reviews Table.
 * Contains the following fields:
 * ```js
 * foodName         // the name of the food item.
 * foodOrigin       // the name of the origin/location the food item came from.
 * foodAttributes   // an object containing various attributes of a food item.
 * totalRating      // the total overall rating of the food item.
 * numReviews       // the number of reviews for the food item.
 * ```
 */
export type FoodItem = z.infer<typeof foodItemSchema>;
export const foodItemSchema = entitySchema.extend({
  entityType: entitySchema.shape.entityType.default(EntityType.FoodItem),
  foodName: z.string(),
  foodOrigin: z.string(),
  foodAttributes: foodAttributesSchema,
  totalRating: z.number(),
  numReviews: z.number()
});
export const foodItemProps = props(foodItemSchema);

/*
  ======================================================================================================

  User types

  ======================================================================================================
*/

/**
 * An interface representing a user entity stored in the Reviews Table.
 * Contains the following fields:
 * ```js
 * userName         // the user name of the user.
 * userEmail        // the email of the user.
 * created          // the date of account creation.
 * ```
 */
export type User = z.infer<typeof userSchema>;
export const userSchema = entitySchema.extend({
  entityType: entitySchema.shape.entityType.default(EntityType.User),
  userName: z.string(),
  userEmail: z.string(),
  created: z.string().datetime()
});
export const userProps = props(userSchema);

/*
  ======================================================================================================
  
  Review types

  ======================================================================================================
*/

export const reviewBaseSchema = entitySchema.extend({
  entityType: entitySchema.shape.entityType.default(EntityType.Review),
  quality: z.number(),
  quantity: z.number(),
  rating: z.number(),
  reviewDate: z.string().datetime()
});

/**
 * An interface representing a review prototype entity stored in the Reviews Table.
 * Contains the following fields:
 * ```js
 * foodId       // the ID of the food item that this review is for.
 * userId       // the ID of the user who created the review.
 * quality      // the quality rating of the review.
 * quantity     // the quantity rating of the review.
 * rating       // the overall rating of the review.
 * reviewDate   // the date this review was last edited. Represented as an ISO-8601 string.
 * ```
 */
export type ReviewPrototype = z.infer<typeof reviewPrototypeSchema>;
export const reviewPrototypeSchema = reviewBaseSchema.extend({
  foodId: z.string(),
  userId: z.string()
});
export const reviewPrototypeProps = props(reviewPrototypeSchema);

/**
 * An interface representing a review entity stored in the Reviews Table.
 * Contains the following fields:
 * ```js
 * food         // the food item that this review is for.
 * user         // the user who created the review.
 * quality      // the quality rating of the review.
 * quantity     // the quantity rating of the review.
 * rating       // the overall rating of the review.
 * reviewDate   // the date this review was last edited. Represented as an ISO-8601 string.
 * ```
 */
export type Review = z.infer<typeof reviewDtoSchema>;
export const reviewDtoSchema = reviewBaseSchema.extend({
  food: foodItemSchema,
  user: userSchema
});

/*
  ======================================================================================================

  Pagination Response types

  ======================================================================================================
*/

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable().optional()
  });
};

export type ReviewPrototypePaginatedResponse = z.infer<typeof reviewPrototypePaginatedResponseSchema>;
export const reviewPrototypePaginatedResponseSchema = paginatedResponseSchema(reviewPrototypeSchema);

export type ReviewPaginatedResponse = z.infer<typeof reviewPaginatedResponseSchema>;
export const reviewPaginatedResponseSchema = paginatedResponseSchema(reviewDtoSchema);

export type UserPaginatedResponse = z.infer<typeof userPaginatedResponseSchema>;
export const userPaginatedResponseSchema = paginatedResponseSchema(userSchema);

export type FoodItemPaginatedResponse = z.infer<typeof foodItemPaginatedResponseSchema>;
export const foodItemPaginatedResponseSchema = paginatedResponseSchema(foodItemSchema);

/*
  ======================================================================================================

  Pagination/Filter Parameter types

  ======================================================================================================
*/

/**
 * Interface representing pagination query parameters.
 * Contains a limit and cursor parameter.
 */
export type PaginationParameters = z.infer<typeof paginationParametersSchema>;
export const paginationParametersSchema = z.object({
  limit: z.coerce.number(),
  cursor: z.string().optional()
});

export const supportedUserAttributes = ['userName', 'userEmail'] as const;
export type SupportedUserAttributes = (typeof supportedUserAttributes)[number];

export const supportedFoodAttributes = ['foodName', 'foodOrigin'] as const;
export type supportedFoodAttributes = (typeof supportedFoodAttributes)[number];

export const supportedAttributes = [...supportedUserAttributes, ...supportedFoodAttributes] as const;
export type SupportedAttributes = (typeof supportedAttributes)[number];

export type Filter = z.infer<typeof filterSchema>;
export const filterSchema = z.object({
  filterAttribute: z.enum(supportedAttributes),
  filterString: z.string().min(1)
});

export type UserFilter = z.infer<typeof userFilterSchema>;
export const userFilterSchema = filterSchema.extend({
  filterAttribute: z.enum(supportedUserAttributes)
});

export type FoodFilter = z.infer<typeof foodFilterSchema>;
export const foodFilterSchema = filterSchema.extend({
  filterAttribute: z.enum(supportedFoodAttributes)
});

export type DateFilter = z.infer<typeof dateFilterSchema>;
export const dateFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})
.refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
},
{
  message: 'startDate must be before or equal to endDate',
  path: ['startDate']
});