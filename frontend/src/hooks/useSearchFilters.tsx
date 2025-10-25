import { useContext } from "react";
import { FiltersContext, FiltersContextInterface } from "../utils/search/SearchContext";



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
const useSearchFilters = (context = FiltersContext): FiltersContextInterface => {
    return useContext(context) as FiltersContextInterface
}

export default useSearchFilters;