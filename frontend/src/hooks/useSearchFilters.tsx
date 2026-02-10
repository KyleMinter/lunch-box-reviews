import { useContext } from "react";
import { FiltersContext, FiltersContextInterface } from "../utils/search/SearchContext";



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
const useSearchFilters = (context = FiltersContext): FiltersContextInterface => {
    return useContext(context) as FiltersContextInterface
}

export default useSearchFilters;