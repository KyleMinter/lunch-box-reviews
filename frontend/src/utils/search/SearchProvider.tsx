import { useCallback, useMemo, useReducer, useState } from "react";
import SearchFilters, { FiltersAction, filtersReducer } from "./searchFilters";
import { defaultFilters, FiltersContext, FiltersContextInterface } from "./SearchContext";

interface SearchProviderProps {
  children: React.ReactNode;
}

const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [filters, filtersDispatch] = useReducer<SearchFilters, [action: FiltersAction]>(filtersReducer, defaultFilters);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultFilters);

  const search = useCallback(() => {
    setSearchFilters(filters);
  }, [filters]);

  const filtersValue = useMemo<FiltersContextInterface>(() => ({
    searchFilters,
    filters,
    filtersDispatch,
    search
  }), [searchFilters, filters, search]);

  return (
    <FiltersContext.Provider value={filtersValue}>
      {children}
    </FiltersContext.Provider>
  )
}

export default SearchProvider;