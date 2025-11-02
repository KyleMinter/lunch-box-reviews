import { EntityType, Review } from "@lunch-box-reviews/shared-types";


export interface SearchFilters {
    entityType: EntityType;
    startDate: string;
    endDate: string;
    userName: string;
    userEmail: string;
    foodName: string;
    foodOrigin: string;
    averageRating: string;
    selectedReviewCriteria: 'START_DATE' | 'END_DATE';
    selectedUserCriteria: 'NAME' | 'EMAIL'
    selectedFoodCriteria: 'NAME' | 'ORIGIN' | 'RATING';
}

export default SearchFilters;