import { EntityType } from "@lunch-box-reviews/shared-types";
import { createContext } from "react";
import SearchFilters, { FiltersAction } from "./searchFilters";
import dayjs from "dayjs";


export interface FiltersContextInterface {
  filters: SearchFilters;
  filtersDispatch: React.ActionDispatch<[action: FiltersAction]>;
  search: () => boolean;
}

export interface SearchStateContextInterface {
  searchFilters: SearchFilters;
}

const currentDateAsString = (): string => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth().toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const defaultFilters: SearchFilters = {
  entityType: EntityType.Review,
  searchInput: '',
  errors: [],
  startDate: {
    selected: false,
    value: dayjs(currentDateAsString()),
    isCheckbox: true
  },
  endDate: {
    selected: false,
    value: dayjs(currentDateAsString()),
    isCheckbox: true
  },
  userName: {
    selected: true,
    radioGroup: EntityType.User,
    isCheckbox: false
  },
  userEmail: {
    selected: false,
    radioGroup: EntityType.User,
    isCheckbox: false
  },
  userNone: {
    selected: false,
    radioGroup: EntityType.User,
    isCheckbox: false
  },
  foodName: {
    selected: true,
    radioGroup: EntityType.FoodItem,
    isCheckbox: false
  },
  foodOrigin: {
    selected: false,
    radioGroup: EntityType.FoodItem,
    isCheckbox: false
  },
  foodNone: {
    selected: false,
    radioGroup: EntityType.FoodItem,
    isCheckbox: false
  },
};

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <SearchProvider>.');
};

const initFilters: FiltersContextInterface = {
  filters: defaultFilters,
  filtersDispatch: stub,
  search: stub
};

const initSearchState: SearchStateContextInterface = {
  searchFilters: defaultFilters
}

export const FiltersContext = createContext(initFilters);
export const SearchStateContext = createContext(initSearchState);