import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import SearchFilters, { FiltersAction, filtersReducer } from "./searchFilters";
import { defaultFilters, FiltersContext, FiltersContextInterface, SearchStateContext, SearchStateContextInterface } from "./SearchContext";
import validateFilters from "../validators/filterValidation";
import { useLocation, useNavigate } from "react-router-dom";


interface SearchProviderProps {
  children: React.ReactNode;
}

const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, filtersDispatch] = useReducer<SearchFilters, [action: FiltersAction]>(filtersReducer, defaultFilters);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultFilters);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const search = useCallback((): boolean => {
    const errors = validateFilters(filters);
    filtersDispatch({ type: 'FILTERS_ERRORS', errors: errors });

    if (errors.length === 0) {
      if (location.pathname !== '/search') {
        navigate('/search');
      }
      setSearchFilters(filtersRef.current);
      return true;
    }

    return false;
  }, [filters, location, navigate]);

  const filtersValue = useMemo<FiltersContextInterface>(() => ({
    filters,
    filtersDispatch,
    search
  }), [filters, filtersDispatch, search]);

  const searchStateValue = useMemo<SearchStateContextInterface>(() => ({
    searchFilters
  }), [searchFilters])

  return (
    <FiltersContext.Provider value={filtersValue}>
      <SearchStateContext.Provider value={searchStateValue}>
        {children}
      </SearchStateContext.Provider>
    </FiltersContext.Provider>
  )
}

export default SearchProvider;