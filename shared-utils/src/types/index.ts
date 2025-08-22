export enum EntityType {
    Review = 'review',
    User = 'user',
    FoodItem = 'foodItem',
    MenuInstace = 'menuInstace'
}

export interface Entity {
    entityID: string,
    entityType: EntityType
}

export interface Review extends Entity {
    foodID: string,
    userID: string,
    quality: number,
    quantity: number,
    rating: number,
    reviewDate: string,
    menuDate: string
}

export interface User extends Entity {
    userName: string;
    userEmail: string;
    userPermissions: UserPermission[]
}

export enum UserPermission {
    userReviewPermissions,
    adminReviewPermissions,
    adminFoodItemPermissions,
    adminMenuInstancePermissions,
    adminUserPermissions
}

export interface FoodItem extends Entity{
    foodName: string,
    foodOrigin: string,
    foodAttributes: FoodAttributes
}

export interface FoodAttributes {
    description: string,
    nutrition: string
}