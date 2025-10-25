import { useContext } from "react";
import useSearchFilters from "./useSearchFilters";
import useSearchResults from "./useSearchResults";
import { FiltersContext } from "../utils/search/SearchContext";


/**
 * ```js
 * const = {
 *      isAuthenticated,
 *      isLoading,
 *      getAccessTokenSilently,
 *      user,
 *      login,
 *      logout,
 *      isAuthorized
 * } = useAuth();
 * ```
 * Used to access auth state and methods.
 */
const useSearch = () => {
    const { filters, setFilters } = useSearchFilters();
    const { searchResults, search } = useSearchResults();
    
    return {
        filters,
        setFilters,
        searchResults,
        search
    }
}

export default useSearch;