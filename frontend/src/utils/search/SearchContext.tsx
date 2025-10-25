import { EntityType, FoodItem, Review, User } from "@lunch-box-reviews/shared-types";
import { createContext } from "react";
import SearchFilters from "./searchFilters";


export interface FiltersContextInterface {
    filters: SearchFilters;
    setFilters: (filters: SearchFilters) => void;
};

export interface ResultsContextInterface {
    searchResults: Review[] | User[] | FoodItem[] | undefined;
    search: () => Promise<void>
};

export const defaultFilters: SearchFilters = {
    entityType: EntityType.Review
};

const stub = (): never => {
    throw new Error('You forgot to wrap your component in <SearchProvider>.');
};

const initFilters: FiltersContextInterface = {
    filters: defaultFilters,
    setFilters: stub
};

const initResults: ResultsContextInterface = {
    searchResults: undefined,
    search: stub
};

export const FiltersContext = createContext(initFilters);
export const ResultsContext = createContext(initResults);