import useSearchFilters from '../../hooks/useSearchFilters';
import { SearchFilter } from '../../utils/search/searchFilters';
import './searchBar.css';


interface SearchFilterCriteriaProps {
    filter: SearchFilter;
}

const SearchFilterCriteria: React.FC<SearchFilterCriteriaProps> = ({ filter }) => {
    const {
        name,
        key,
        selectionType,
        inputType,
        selected,
        errors,
        group
    } = filter;

    const { filtersDispatch } = useSearchFilters();

    return (
            <div className="search-filter-criteria">
                <input
                    type={selectionType}
                    name={group}
                    checked={selected}
                    onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: key })}
                />
                <div>
                    <label>{name}</label>
                    <input
                        type={inputType}
                        className={errors.length > 0 ? 'error' : undefined}
                        onChange={(e) => filtersDispatch({ type: 'FILTER_UPDATE', filter: key, value: e.target.value })}
                    />
                    <div>

                    </div>
                </div>
            </div>
    )
}

export default SearchFilterCriteria;