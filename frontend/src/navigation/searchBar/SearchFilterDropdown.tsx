import Dropdown from "../../components/dropdown/Dropdown"


const SearchFilterButton = () => {
    return (
        <button className="search-filter-button">filter</button>
    )
}

const SearchFilterContent = () => {
    return (
        <div className="search-filter-content">
            content
        </div>
    )
}

const SearchFilterDropdown = () => {
    return (
        <Dropdown
            marginTop="15px"
            alignment="right"
            parent={<SearchFilterButton />}
        >
            <SearchFilterContent />
        </Dropdown>
    );
}

export default SearchFilterDropdown;