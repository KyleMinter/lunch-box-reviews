import { EntityType, FoodItem, Review, User } from "@lunch-box-reviews/shared-types";
import { createContext } from "react";
import SearchFilters from "./searchFilters";


export interface FiltersContextInterface {
    filters: SearchFilters;
    setFilters: (filters: SearchFilters) => void;
    search: () => Promise<void>;
};

export interface ResultsContextInterface {
    searchResults: Review[] | User[] | FoodItem[] | undefined;
    isLoading: boolean;
};

export const defaultFilters: SearchFilters = {
    entityType: EntityType.Review,
    startDate: '',
    endDate: '',
    userName: '',
    userEmail: '',
    foodName: '',
    foodOrigin: '',
    averageRating: '5',
    selectedReviewCriteria: 'START_DATE',
    selectedUserCriteria: 'NAME',
    selectedFoodCriteria: 'NAME'
};

const stub = (): never => {
    throw new Error('You forgot to wrap your component in <SearchProvider>.');
};

const initFilters: FiltersContextInterface = {
    filters: defaultFilters,
    setFilters: stub,
    search: stub
};

const initResults: ResultsContextInterface = {
    searchResults: undefined,
    isLoading: false
};

export const FiltersContext = createContext(initFilters);
export const ResultsContext = createContext(initResults);