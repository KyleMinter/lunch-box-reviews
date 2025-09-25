import { useNavigate } from "react-router-dom";
import SearchFilterDropdown from "./SearchFilterDropdown";
import './searchBar.css';


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

    const onSearchButtonClick = () => {
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