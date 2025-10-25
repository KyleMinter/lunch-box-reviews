import { Context, useCallback, useMemo, useState } from "react";
import SearchFilters from "./searchFilters";
import { defaultFilters, FiltersContext, FiltersContextInterface, ResultsContext, ResultsContextInterface } from "./SearchContext";
import { EntityType, FoodItem, Review, User } from "@lunch-box-reviews/shared-types";



interface SearchProviderOptions {
    children: React.ReactNode;
    context?: Context<any>;
}

const SearchProvider = (opts: SearchProviderOptions) => {
    const {
        children
    } = opts;

    const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

    const [searchResults, setSearchResults] = useState<Review[] | User[] | FoodItem[] | undefined>(undefined);
    
        const search = useCallback(async () => {
            const users: User[] = [
                {userName: 'name', userEmail: 'email', entityID: 'uid1', entityType: EntityType.User, userPermissions: []},
                {userName: 'name', userEmail: 'email', entityID: 'uid2', entityType: EntityType.User, userPermissions: []}
            ];
    
            const reviews: Review[] = [
                {entityID: 'rid1', foodID: 'food', menuID: '01/01/2025', userID: 'user', quality: 5.55, quantity: 3, rating: 8, reviewDate: '01/01/2025', entityType: EntityType.Review},
                {entityID: 'rid2', foodID: 'food', menuID: '01/01/2025', userID: 'user', quality: 5.55, quantity: 3, rating: 8, reviewDate: '01/01/2025', entityType: EntityType.Review}
            ];
    
            const foods: FoodItem[] = [
                {entityID: 'fid1', foodName: 'name', foodOrigin: 'origin', foodAttributes: {nutrition: 'nutrition', description: 'description'}, totalRating: 20, numReviews: 2, entityType: EntityType.FoodItem},
                {entityID: 'fid1', foodName: 'name', foodOrigin: 'origin', foodAttributes: {}, totalRating: 15, numReviews: 3, entityType: EntityType.FoodItem}
            ];
    
            switch (filters.entityType) {
                case EntityType.Review:
                    setSearchResults(reviews);
                    break;
                case EntityType.User:
                    setSearchResults(users);
                    break;
                case EntityType.FoodItem:
                    setSearchResults(foods);
                    break;
            }
        }, [filters]);

    const filtersValue = useMemo<FiltersContextInterface>(() => ({
        filters,
        setFilters
    }), [filters]);

    const resultsValue = useMemo<ResultsContextInterface>(() => ({
        searchResults,
        search
    }), [searchResults]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <FiltersContext.Provider value={filtersValue}>
            <ResultsContext.Provider value={resultsValue}>
                {children}
            </ResultsContext.Provider>
        </FiltersContext.Provider>
    )
}

export default SearchProvider;