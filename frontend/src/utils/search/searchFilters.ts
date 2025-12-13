import { EntityType } from "@lunch-box-reviews/shared-types";
import { sprintf } from "sprintf-js";
import Validator, { dateSequenceValidator } from "../validators/validators";


export interface SearchFilter {
    readonly name: string;
    readonly key: keyof SearchFilters;
    readonly group: string;
    readonly selectionType: 'radio' | 'checkbox';
    readonly inputType: 'text' | 'date';
    value: string;
    selected: boolean;
    touched: boolean;
    errors: string[];
    readonly validators?: Validator[]
}

export interface SearchFilters {
    entityType: EntityType;
    startDate: SearchFilter;
    endDate: SearchFilter;
    userName: SearchFilter;
    userEmail: SearchFilter;
    foodName: SearchFilter;
    foodOrigin: SearchFilter;
    averageRating: SearchFilter;
}

function isSearchFilter(obj: any): obj is SearchFilter {
    return typeof obj === 'object' && obj !== null &&
        'name' in obj && typeof obj.name === 'string' &&
        'group' in obj && typeof obj.group === 'string' &&
        'selectionType' in obj && (obj.selectionType === 'radio' || obj.selectionType === 'checkbox') &&
        'inputType' in obj && (obj.inputType === 'text' || obj.inputType === 'date') &&
        'value' in obj && typeof obj.value === 'string' &&
        'selected' in obj && typeof obj.selected === 'boolean' &&
        'errors' in obj && Array.isArray(obj.errors);
}

function validateFilters(filters: SearchFilters) {
    const filterKeys = Object.keys(filters) as (keyof SearchFilters)[];
    filterKeys.forEach((filterKey) => {
        const filter = filters[filterKey]
        if (isSearchFilter(filter)) {
            filter.errors = [];
            if (filter.selected && filter.validators) {
                filter.validators.forEach((validator) => {
                    if (!validator.validate(filter.value)) {
                        const errorMessage = sprintf(validator.errorMessage, filter.name);
                        filter.errors = [...filter.errors, errorMessage];
                    }
                });
            }
        }
    });

    if (filters.startDate.selected && filters.endDate.selected &&
        !dateSequenceValidator.validate(filters.startDate.value, filters.endDate.value)
    ) {
        const startErrorMessage = sprintf(dateSequenceValidator.startErrorMessage, filters.startDate.name);
        filters.startDate.errors = [...filters.startDate.errors, startErrorMessage];
        const endErrorMessage = sprintf(dateSequenceValidator.endErrorMessage, filters.endDate.name);
        filters.endDate.errors = [...filters.endDate.errors, endErrorMessage];
    }

    return filters
}

export type FiltersAction =
    | { type: 'ENTITY_TYPE'; selected: EntityType }
    | { type: 'FILTER_SELECT'; filter: keyof SearchFilters}
    | { type: 'FILTER_UPDATE'; filter: keyof SearchFilters, value: string };

export const filtersReducer = (state: SearchFilters, action: FiltersAction): SearchFilters => {
    switch (action.type) {
        case 'ENTITY_TYPE': {
            state.entityType = action.selected;
            break;
        }
        case 'FILTER_SELECT': {
            const selectedFilter = state[action.filter];
            if (isSearchFilter(selectedFilter)) {
                let filters = { ...state };

                // If the filter is in a radio group, we will disable all of the filters in that group.
                if (selectedFilter.selectionType === 'radio') {
                    const filterKeys = Object.keys(state) as (keyof SearchFilters)[];
                    filterKeys.forEach((filterKey) => {
                        const filter = state[filterKey]
                        if (isSearchFilter(filter) && filter.group === selectedFilter.group) {
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
                    value: selectedFilter.value,
                    selected: selectedFilter.selectionType === 'radio' ? true : !selectedFilter.selected,
                    touched: true
                };
                filters = {
                    ...filters,
                    [action.filter]: enabledFilter
                };

                filters = validateFilters(filters);
                return {
                    ...filters
                };
            }
            break;
        }
        case 'FILTER_UPDATE': {
            const filter = state[action.filter];
            if (isSearchFilter(filter)) {
                const enabledFilter: SearchFilter = {
                    ...filter,
                    value: action.value,
                    touched: true
                };
                
                let filters = {
                    ...state,
                    [action.filter]: enabledFilter
                };

                filters = validateFilters(filters);

                return {
                    ...filters
                };
            }
            break;
        }
    }
    return state;
}

export default SearchFilters;