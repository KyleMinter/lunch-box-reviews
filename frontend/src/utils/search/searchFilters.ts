import { EntityType } from "@lunch-box-reviews/shared-types";


export interface SearchFilter {
    readonly name: string;
    readonly key: keyof SearchFilters;
    readonly group: string;
    readonly selectionType: 'radio' | 'checkbox';
    readonly inputType: 'text' | 'date';
    value: string;
    selected: boolean;
    errors: string[];
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
                    selected: selectedFilter.selectionType === 'radio' ? true : !selectedFilter.selected
                };
                return {
                    ...filters,
                    [action.filter]: enabledFilter
                };
            }
            break;
        }
        case 'FILTER_UPDATE': {
            const filter = state[action.filter];
            if (isSearchFilter(filter)) {
                const enabledFilter: SearchFilter = {
                    ...filter,
                    value: action.value
                };
                return {
                    ...state,
                    [action.filter]: enabledFilter
                };
            }
            break;
        }
    }
    return state;
}

export default SearchFilters;