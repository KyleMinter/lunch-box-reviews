function nameof<T>(name: keyof T) {
    return name;
}

/**
 * An enum representing an entity type stored in the Reviews Table.
 * Can either one of the following: `Review`, `User`, `FoodItem`, `MenuInstance`.
 */
export enum EntityType {
    Review = 'review',
    User = 'user',
    FoodItem = 'foodItem',
    MenuInstance = 'menuInstace'
}

/**
 * An interface representing an entity stored in the Reviews Table.
 * Contains the unique ID and the entity type of a given entity instance.
 */
export interface Entity {
    entityID: string,
    entityType: EntityType | string
}

/**
 * A class representing the properties of the Entity interface.
 * Also contains a key property listing all of the interface's properties as string.
 */
export class EntityProps {
    static readonly entityID: string = nameof<Entity>('entityID');
    static readonly entityType: string = nameof<Entity>('entityType');

    static readonly keys: string = `
        ${this.entityID},
        ${this.entityType}
    `;
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
 */
export interface Review extends Entity {
    foodID: string,
    userID: string,
    quality: number,
    quantity: number,
    rating: number,
    reviewDate: string
}

/**
 * A class representing the properties of the Review interface.
 * Also contains a key property listing all of the interface's properties as string.
 */
export class ReviewProps extends EntityProps {
    static readonly foodID: string = nameof<Review>('foodID');
    static readonly userID: string = nameof<Review>('userID');
    static readonly quality: string = nameof<Review>('quality');
    static readonly quanitity: string = nameof<Review>('quantity');
    static readonly rating: string = nameof<Review>('rating');
    static readonly reviewDate: string = nameof<Review>('reviewDate');

    static readonly keys: string = `
        ${EntityProps.keys},
        ${this.foodID},
        ${this.userID},
        ${this.quality},
        ${this.quanitity},
        ${this.rating},
        ${this.reviewDate}
    `;
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
 * A class representing the properties of the User interface.
 * Also contains a key property listing all of the interface's properties as string.
 */
export class UserProps extends EntityProps {
    static readonly userName: string = nameof<User>('userName');
    static readonly userEmail: string = nameof<User>('userEmail');
    static readonly userPermissions: string = nameof<User>('userPermissions');

    static readonly keys: string = `
        ${EntityProps.keys},
        ${this.userName},
        ${this.userEmail},
        ${this.userPermissions}
    `;
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
 * `foodOption` - the menu option of the food item.
 * `totalRating` - the total overall rating of the food item.
 * `numReviews` - the number of reviews for the food item.
 * `officeLocation` - the office location of the food item.
 * `officeCafe` - the office cafe of the food item.
 * `foodDate` - the date the food item was featured on the menu.
 */
export interface FoodItem extends Entity {
    foodName: string,
    foodOrigin: string,
    foodAttributes: FoodAttributes,
    foodOption: FoodOption,
    totalRating: number,
    numReviews: number,
    officeLocation: OfficeLocation,
    officeCafe?: OfficeCafe,
    foodDate: string
}

/**
 * An interface representing the attributes of a food item stored in the Reviews Table.
 * Contains a description and the nutritional information of the food item.
 */
export interface FoodAttributes {
    description?: string,
    nutrition?: string
}

/**
 * An enum representing the option a food item can be.
 * Can either one of the following: `MainOption` or `ChilledOption`.
 */
export enum FoodOption {
    MainOption,
    ChilledOption
}

/**
 * An enum representing the office location of a food item.
 * Can either one of the following: `OKC_HQ`, `Grapevine`, `NTH`.
 */
export enum OfficeLocation {
    OKC_HQ,
    Grapevine,
    NTH
}

/**
 * An enum representing the office cafe of a food item.
 * Can either one of the following: `CafeA`, `CafeB`, `CafeC`, `CafeD`, `CafeE`.
 */
export enum OfficeCafe {
    CafeA,
    CafeB,
    CafeC,
    CafeD,
    CafeE,
}

/**
 * A class representing the properties of the FoodItem interface.
 * Also contains a key property listing all of the interface's properties as string.
 */
export class FoodItemProps extends EntityProps {
    static readonly foodName: string = nameof<FoodItem>('foodName');
    static readonly foodOrigin: string = nameof<FoodItem>('foodOrigin');
    static readonly foodAttributes: string = nameof<FoodItem>('foodAttributes');
    static readonly totalRating: string = nameof<FoodItem>('totalRating');
    static readonly numReviews: string = nameof<FoodItem>('numReviews');
    static readonly officeLocation: string = nameof<FoodItem>('officeLocation');
    static readonly officeCafe: string = nameof<FoodItem>('officeCafe');
    static readonly foodDate: string = nameof<FoodItem>('foodDate');

    static readonly keys: string = `
        ${EntityProps.keys},
        ${this.foodName},
        ${this.foodOrigin},
        ${this.foodAttributes},
        ${this.totalRating},
        ${this.numReviews},
        ${this.officeLocation},
        ${this.officeCafe},
        ${this.foodDate}
    `;
}