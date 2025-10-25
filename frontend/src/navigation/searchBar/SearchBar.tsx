import { useLocation, useNavigate } from "react-router-dom";
import SearchFilterDropdown from "./SearchFilterDropdown";
import './searchBar.css';
import useSearchResults from "../../hooks/useSearchResults";


const SearchBar = () => {
    return (
        <div className="searchbar">
            <SearchButton />
            <SearchTextField />
            <SearchFilterDropdown />
        </div>
    );
};

const SearchButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { search } = useSearchResults();

    const onSearchButtonClick = async () => {
        await search();
        if (location.pathname !== '/search')
            navigate('/search');
    }

    return (
        <button className="search-button" onClick={onSearchButtonClick}>search</button>
    )
}

const SearchTextField = () => {
    return (
        <input className="search-text-field" type="text" />
    )
};

export default SearchBar;