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
    startDate: {
        name: 'Start Date',
        key: 'startDate',
        group: 'review',
        selectionType: 'checkbox',
        inputType: 'date',
        value: currentDateAsString(),
        selected: false,
        errors: []
    },
    endDate: {
        name: 'End Date',
        key: 'endDate',
        group: 'review',
        selectionType: 'checkbox',
        inputType: 'date',
        value: currentDateAsString(),
        selected: false,
        errors: [],
    },
    userName: {
        name: 'Name',
        key: 'userName',
        group: 'user',
        selectionType: 'radio',
        inputType: 'text',
        value: '',
        selected: true,
        errors: []
    },
    userEmail: {
        name: 'Email',
        key: 'userEmail',
        group: 'user',
        selectionType: 'radio',
        inputType: 'text',
        value: '',
        selected: false,
        errors: []
    },
    foodName: {
        name: 'Name',
        key: 'foodName',
        group: 'food',
        selectionType: 'radio',
        inputType: 'text',
        value: '',
        selected: true,
        errors: []
    },
    foodOrigin: {
        name: 'Origin',
        key: 'foodOrigin',
        group: 'food',
        selectionType: 'radio',
        inputType: 'text',
        value: '',
        selected: false,
        errors: []
    },
    averageRating: {
        name: 'Average Rating',
        key: 'averageRating',
        group: 'food',
        selectionType: 'radio',
        inputType: 'text',
        value: '',
        selected: false,
        errors: []
    }
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