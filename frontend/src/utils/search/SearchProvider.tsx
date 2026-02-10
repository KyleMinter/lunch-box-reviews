import { useCallback, useMemo, useReducer } from "react";
import SearchFilters, { FiltersAction, filtersReducer } from "./searchFilters";
import { defaultFilters, FiltersContext, FiltersContextInterface, ResultsContext, ResultsContextInterface } from "./SearchContext";
import { EntityType, FoodItem, Review, User } from "@lunch-box-reviews/shared-types";
import { initialSearchState, searchReducer } from "./searchState";


interface SearchProviderProps {
    children: React.ReactNode;
}

const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [filters, filtersDispatch] = useReducer<SearchFilters, [action: FiltersAction]>(filtersReducer, defaultFilters);

    const [searchState, searchDispatch] = useReducer(searchReducer, initialSearchState);
    
    const search = useCallback(async () => {
        const users: User[] = [
            {userName: 'name', userEmail: 'email', created: '02/07/2026', entityId: 'uid1', entityType: EntityType.User},
            {userName: 'name', userEmail: 'email', created: '02/07/2026', entityId: 'uid2', entityType: EntityType.User}
        ];

        const foods: FoodItem[] = [
            {entityId: 'fid1', foodName: 'name', foodOrigin: 'origin', foodAttributes: {nutrition: 'nutrition', description: 'description'}, totalRating: 20, numReviews: 2, entityType: EntityType.FoodItem},
            {entityId: 'fid1', foodName: 'name', foodOrigin: 'origin', foodAttributes: {}, totalRating: 15, numReviews: 3, entityType: EntityType.FoodItem}
        ];

        const reviews: Review[] = [
            {entityId: 'rid1', food: foods[0],  user: users[0], quality: 5.55, quantity: 3, rating: 8, reviewDate: '01/01/2025', entityType: EntityType.Review},
            {entityId: 'rid2', food: foods[1],  user: users[1], quality: 5.55, quantity: 3, rating: 8, reviewDate: '01/01/2025', entityType: EntityType.Review}
        ];

        searchDispatch({ type: 'SEARCH_START' });

        switch (filters.entityType) {
            case EntityType.Review:
                searchDispatch({ type: 'SEARCH_SUCCESS', payload: reviews });
                break;
            case EntityType.User:
                searchDispatch({ type: 'SEARCH_SUCCESS', payload: users });
                break;
            case EntityType.FoodItem:
                searchDispatch({ type: 'SEARCH_SUCCESS', payload: foods });
                break;
        }
    }, [filters]);

    const filtersValue = useMemo<FiltersContextInterface>(() => ({
        filters,
        filtersDispatch,
        search
    }), [filters, search]);

    const resultsValue = useMemo<ResultsContextInterface>(() => ({
        searchResults: searchState.results,
        isLoading: searchState.isLoading,
    }), [searchState]);

    return (
        <FiltersContext.Provider value={filtersValue}>
            <ResultsContext.Provider value={resultsValue}>
                {children}
            </ResultsContext.Provider>
        </FiltersContext.Provider>
    )
}

export default SearchProvider;