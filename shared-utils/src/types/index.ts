/**
 * An enum representing an entity type stored in the Reviews Table.
 * Can either one of the following: `Review`, `User`, `FoodItem`, `MenuInstance`.
 */
export enum EntityType {
    Review = 'review',
    User = 'user',
    FoodItem = 'foodItem',
    MenuInstace = 'menuInstace'
}

/**
 * An interface representing an entity stored in the Reviews Table.
 * Contains the unique ID and the entity type of a given entity instance.
 */
export interface Entity {
    entityID: string,
    entityType: EntityType
}

/**
 * An interface representing a review entity stored in the Reviews Table.
 * Contains the following fields:
 * `foodID` - the ID of the food item that this review is for.
 * `userID` - the ID of the user who created the review.
 * `quality` - the quality rating of the review.
 * `quantity` - the quantity rating of the review.
 * `rating` - the overall rating of the review.
 * `reviewDate` - the date this review was last edited. Represented as an ISO-8601 string.
 * `menuDate` - the date of the menu instance this review is referencing. Represented as an ISO-8601 string.
 */
export interface Review extends Entity {
    foodID: string,
    userID: string,
    quality: number,
    quantity: number,
    rating: number,
    reviewDate: string,
    menuDate: string
}

/**
 * An interface representing a user entity stored in the Reviews Table.
 * Contains the following fields:
 * `userName` - the user name of the user.
 * `userEmail` - the email of the user.
 * `userPermissions` - an array containing the various permissions the user has.
 */
export interface User extends Entity {
    userName: string;
    userEmail: string;
    userPermissions: UserPermission[]
}

/**
 * An enum representing a permission a user can be given.
 * Can either one of the following: `userReviewPermissions`, `adminReviewPermissions`,
 * `admindFoodItemPermissions`, `adminMenuInstancePermissions`, `adminUserPermissions`.
 */
export enum UserPermission {
    userReviewPermissions,
    adminReviewPermissions,
    adminFoodItemPermissions,
    adminMenuInstancePermissions,
    adminUserPermissions
}

/**
 * An interface representing a food item entity stored in the Reviews Table.
 * Contains the following fields:
 * `foodName` - the name of the food item.
 * `foodOrigin` - the name of the origin/location the food item came from.
 * `foodAttributes` - an object containing various attributes of a food item.
 */
export interface FoodItem extends Entity{
    foodName: string,
    foodOrigin: string,
    foodAttributes: FoodAttributes
}

/**
 * An interface representing the attributes of a food item stored in the Reviews Table.
 * Contains a description and the nutritional information of the food item.
 */
export interface FoodAttributes {
    description?: string,
    nutrition?: string
}