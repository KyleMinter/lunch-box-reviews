import { EntityType, FoodItem, Review, User } from "@lunch-box-reviews/shared-types";
import { createContext } from "react";
import SearchFilters, { FiltersAction } from "./searchFilters";


export interface FiltersContextInterface {
    filters: SearchFilters;
    filtersDispatch: React.ActionDispatch<[action: FiltersAction]>;
    search: () => Promise<void>;
};

export interface ResultsContextInterface {
    searchResults: Review[] | User[] | FoodItem[] | undefined;
    isLoading: boolean;
};

const currentDateAsString = (): string => {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth().toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const defaultFilters: SearchFilters = {
    entityType: EntityType.Review,
    startDate: { value: currentDateAsString(), selected: false },
    endDate: { value: currentDateAsString(), selected: false },
    userName: { value: '', selected: true, group: 'user' },
    userEmail: { value: '', selected: false, group: 'user' },
    foodName: { value: '', selected: true, group: 'food' },
    foodOrigin: { value: '', selected: false, group: 'food' },
    averageRating: { value: '', selected: false, group: 'food' }
};

const stub = (): never => {
    throw new Error('You forgot to wrap your component in <SearchProvider>.');
};

const initFilters: FiltersContextInterface = {
    filters: defaultFilters,
    filtersDispatch: stub,
    search: stub
};

const initResults: ResultsContextInterface = {
    searchResults: undefined,
    isLoading: false
};

export const FiltersContext = createContext(initFilters);
export const ResultsContext = createContext(initResults);