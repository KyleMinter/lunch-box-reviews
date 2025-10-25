import { FoodItem, Review, User } from "@lunch-box-reviews/shared-types";

export interface SearchState {
    results: Review[] | User[] | FoodItem[] | undefined;
    isLoading: boolean;
}

export const initialSearchState: SearchState = {
    results: undefined,
    isLoading: false
};

export type SearchAction =
    | { type: 'SEARCH_START' }
    | { type: 'SEARCH_SUCCESS'; payload: Review[] | User[] | FoodItem[] | undefined };


export const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
    switch (action.type) {
        case 'SEARCH_START':
            return { ...state, isLoading: true };
        case 'SEARCH_SUCCESS':
            return { ...state, isLoading: false, results: action.payload };
        default:
            return state;
    }
}