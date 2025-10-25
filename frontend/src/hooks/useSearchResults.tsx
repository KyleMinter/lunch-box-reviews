import { useContext } from "react";
import { ResultsContext, ResultsContextInterface } from "../utils/search/SearchContext";



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
const useSearchResults = (context = ResultsContext): ResultsContextInterface => {
    return useContext(context) as ResultsContextInterface
}

export default useSearchResults;