import { EntityType } from "@lunch-box-reviews/shared-types";


interface SearchFilter {
    value: string;
    selected: boolean;
    group?: string;
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
        'value' in obj && typeof obj.value === 'string' &&
        'selected' in obj && typeof obj.selected === 'boolean';
}

export type FiltersAction =
    | { type: 'ENTITY_TYPE'; selected: EntityType }
    | { type: 'FILTER_TOGGLE'; filter: keyof SearchFilters, value?: string }
    | { type: 'FILTER_SELECT'; filter: keyof SearchFilters, value?: string }
    | { type: 'FILTER_SET_VALUE'; filter: { name: keyof SearchFilters, value: string }}

export const filtersReducer = (state: SearchFilters, action: FiltersAction): SearchFilters => {
    switch (action.type) {
        case 'ENTITY_TYPE': {
            state.entityType = action.selected;
            break;
        }
        case 'FILTER_TOGGLE': {
            const filter = state[action.filter];
            if (isSearchFilter(filter)) {
                const toggledFilter: SearchFilter = {
                    value: action.value ?? filter.value,
                    selected: !filter.selected,
                    group: filter.group
                };
                return {
                    ...state,
                    [action.filter]: toggledFilter
                };
            }
            break;
        }
        case 'FILTER_SELECT': {
            const selectedFilter = state[action.filter];
            // If the selected filter is in a group, we will disable all of the filters in that group.
            if (isSearchFilter(selectedFilter) && selectedFilter.group) {
                let filters = { ...state };
                const filterKeys = Object.keys(state) as (keyof SearchFilters)[];
                filterKeys.forEach((filterKey) => {
                    const filter = state[filterKey]
                    if (isSearchFilter(filter) && filter.group === selectedFilter.group) {
                        const disabledFilter: SearchFilter = {
                            value: filter.value,
                            selected: false,
                            group: filter.group
                        };
                        filters = {
                            ...filters,
                            [filterKey]: disabledFilter
                        };
                    }
                })
                
                // Enable the selected filter.
                const enabledFilter: SearchFilter = {
                    value: action.value ?? selectedFilter.value,
                    selected: true,
                    group: selectedFilter.group
                };
                return {
                    ...filters,
                    [action.filter]: enabledFilter
                };
            }
            break;
        }
    }
    return state;
}

export default SearchFilters;