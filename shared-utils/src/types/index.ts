export enum EntityType {
    Review = 'review',
    User = 'user',
    FoodItem = 'foodItem',
    MenuInstace = 'menuInstace'
}

export interface Review {
    entityID: string,
    entityType: EntityType,
    foodID: string,
    userID: string,
    quality: string,
    quantity: string,
    rating: string,
    reviewDate: string,
    menuDate: string
}

export interface User {
    entityID: string;
    entityType: EntityType,
    userName: string;
    userEmail: string;
    userFlags: UserFlag[]
}

export enum UserFlag {
    canSubmitReviews,
    canDeleteReviews,
    canSubmitFoodItems,
    canDeleteFoodItems,
    canSubmitMenuInstances,
    canDeleteMenuInstances
}

export interface FoodItem {
    entityID: string,
    entityType: EntityType,
    foodName: string,
    foodOrigin: string,
    foodAttributes: FoodAttributes
}

export interface FoodAttributes {
    description: string,
    nutrition: string
}