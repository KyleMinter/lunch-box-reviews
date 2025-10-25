import { EntityType } from "@lunch-box-reviews/shared-types"
import Dropdown from "../../components/dropdown/Dropdown"
import useSearchFilters from "../../hooks/useSearchFilters"


const SearchFilterButton = () => {
    return (
        <button className="search-filter-button">filter</button>
    )
}

const SearchFilterContent = () => {
    const { filters, setFilters } = useSearchFilters();
    
    return (
        <div className="search-filter-content">
            <p>review</p>
            <input 
                type="radio"
                name="balls"
                value="review"
                checked={filters.entityType === EntityType.Review}
                onChange={() => setFilters({
                    ...filters,
                    entityType: EntityType.Review
                })}
            />
            <br />
            <p>user</p>
            <input 
                type="radio"
                name="balls"
                value="user"
                checked={filters.entityType === EntityType.User}
                onChange={() => setFilters({
                    ...filters,
                    entityType: EntityType.User
                })}
            />
            <br />
            <p>food item</p>
            <input 
                type="radio"
                name="balls"
                value="foodItem"
                checked={filters.entityType === EntityType.FoodItem}
                onChange={() => setFilters({
                    ...filters,
                    entityType: EntityType.FoodItem
                })}
            />
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