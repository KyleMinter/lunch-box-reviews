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
    return (
        <button className="search-button">search</button>
    )
}

const SearchTextField = () => {
    return (
        <input className="search-text-field" type="text" />
    )
};

export default SearchBar;