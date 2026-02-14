import { EntityType } from "@lunch-box-reviews/shared-types";
import dayjs, { Dayjs } from "dayjs";
import { defaultFilters } from "./SearchContext";


export interface SearchFilter {
  readonly isCheckbox: boolean;
  readonly radioGroup?: EntityType;
  selected: boolean;
  value?: Dayjs | null;
}

export interface SearchFilters {
  entityType: EntityType;
  searchInput: string;
  errors: string[];
  startDate: SearchFilter;
  endDate: SearchFilter;
  userName: SearchFilter;
  userEmail: SearchFilter;
  userNone: SearchFilter;
  foodName: SearchFilter;
  foodOrigin: SearchFilter;
  foodNone: SearchFilter;
}

function isSearchFilter(obj: any): obj is SearchFilter {
  return typeof obj === 'object' && obj !== null &&
    'isCheckbox' in obj && typeof obj.isCheckbox === 'boolean' &&
    (!('radioGroup' in obj) || ('radioGroup' in obj &&
      (obj.radioGroup === 'review' || obj.radioGroup === 'user' || obj.radioGroup === 'foodItem'))) &&
    'selected' in obj && typeof obj.selected === 'boolean' &&
    (!('value' in obj) || ('value' in obj &&
      (typeof obj.value === 'string' || isDateValue(obj.value))));
}

function isDateValue(value: any): boolean {
  return (value === null || dayjs.isDayjs(value));
}

export type FiltersAction =
  | { type: 'ENTITY_TYPE'; selected: EntityType }
  | { type: 'FILTER_SELECT'; filter: keyof SearchFilters }
  | { type: 'FILTER_UPDATE'; filter?: keyof SearchFilters, value: Dayjs | null | string }
  | { type: 'FILTERS_ERRORS'; errors: string[] }
  | { type: 'FILTERS_RESET'; };

export const filtersReducer = (state: SearchFilters, action: FiltersAction): SearchFilters => {
  switch (action.type) {
    case 'ENTITY_TYPE': {
      return {
        ...state,
        entityType: action.selected,
        errors: []
      };
    }
    case 'FILTER_SELECT': {
      const selectedFilter = state[action.filter];
      if (isSearchFilter(selectedFilter)) {
        let filters = { ...state };

        // If the filter is in a radio group, we will disable all of the filters in that group.
        if (selectedFilter.radioGroup) {
          const filterKeys = Object.keys(state) as (keyof SearchFilters)[];
          filterKeys.forEach((filterKey) => {
            const filter = state[filterKey];
            if (isSearchFilter(filter) && filter.radioGroup === selectedFilter.radioGroup) {
              const disabledFilter: SearchFilter = {
                ...filter,
                selected: false
              };

              filters = {
                ...filters,
                [filterKey]: disabledFilter
              };
            }
          })
        }

        const enabledFilter: SearchFilter = {
          ...selectedFilter,
          selected: selectedFilter.isCheckbox ? !selectedFilter.selected : true,
        };
        return {
          ...filters,
          [action.filter]: enabledFilter
        };
      }
      break;
    }
    case 'FILTER_UPDATE': {
      let filters = { ...state };

      if (action.filter) {
        const filter = state[action.filter];
        if (
          isSearchFilter(filter)
          && isDateValue(action.value)
          && typeof action.value !== 'string'
        ) {
          const updatedFilter: SearchFilter = {
            ...filter,
            value: action.value
          };

          return {
            ...filters,
            [action.filter]: updatedFilter
          };
        }
      } else if (typeof action.value === 'string') {
        return {
          ...filters,
          searchInput: action.value
        };
      }
      break;
    }
    case 'FILTERS_ERRORS':
      return {
        ...state,
        errors: action.errors
      };
    case 'FILTERS_RESET':
      return defaultFilters;
  }
  return state;
}

export default SearchFilters;