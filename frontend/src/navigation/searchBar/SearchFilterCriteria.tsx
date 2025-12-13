import { useRef, useState } from 'react';
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
        value,
        selected,
        touched,
        errors,
        group
    } = filter;

    const { filtersDispatch } = useSearchFilters();
    const errorsClassName = (errors.length > 0 && touched) ? 'search-input-error' : undefined;

    return (
            <div className="search-filter-criteria">
                <input
                    type={selectionType}
                    name={group}
                    checked={selected}
                    className={errorsClassName}
                    onChange={() => {
                        filtersDispatch({ type: 'FILTER_SELECT', filter: key })
                    }}
                />
                <div>
                    <label>{name}</label>
                    <input
                        type={inputType}
                        value={inputType === 'date' ? value : undefined}
                        className={errorsClassName}
                        onChange={(e) => {
                            filtersDispatch({ type: 'FILTER_UPDATE', filter: key, value: e.target.value })
                        }}
                    />
                    <div className="search-filter-errors">
                        {touched && errors.map((error, idx) => {
                            return (<span key={idx}>{error}</span>)
                        })}
                    </div>
                </div>
            </div>
    )
}

export default SearchFilterCriteria;