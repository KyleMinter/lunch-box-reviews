import { useContext } from "react";
import { ResultsContext, ResultsContextInterface } from "../utils/search/SearchContext";



/**
 * ```js
 * const = {
 *      searchResults,
 *      isLoading,
 * } = useSearchFilters();
 * ```
 * Used to access search results states.
 */
const useSearchResults = (context = ResultsContext): ResultsContextInterface => {
    return useContext(context) as ResultsContextInterface
}

export default useSearchResults;