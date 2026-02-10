import { useContext } from "react";
import { SearchStateContext, SearchStateContextInterface } from "../utils/search/SearchContext";



/**
 * ```js
 *  const = {
 *    searchFilters,
 *    filters,
 *    filtersDispatch,
 *    search,
 *  } = useSearchFilters();
 * ```
 * Used to access search filters state and methods.
 */
const useSearchState = (context = SearchStateContext): SearchStateContextInterface => {
  return useContext(context) as SearchStateContextInterface
}

export default useSearchState;