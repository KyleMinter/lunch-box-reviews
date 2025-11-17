import { EntityType } from "@lunch-box-reviews/shared-types"
import Dropdown from "../../components/dropdown/Dropdown"
import useSearchFilters from "../../hooks/useSearchFilters"
import Tabs, { Tab } from "../../components/tabs/Tabs";
import SearchFilterCriteria from "./SearchFilterCriteria";


const SearchFilterDropdown = () => {
    const { filters, filtersDispatch } = useSearchFilters();

    const setEntityFilter = (id: string) => {
        const entityType = id as EntityType;
        if (filters.entityType !== entityType)
            filtersDispatch({ type: 'ENTITY_TYPE', selected: entityType });
    }

    return (
        <Dropdown
            marginTop="15px"
            alignment="right"
            parent={<button className="search-filter-button">filter</button>}
        >
            <div className="search-filter-container">
                <Tabs defaultSelected={filters.entityType} onTabSelect={setEntityFilter}>
                    <Tab id={EntityType.Review} header="Review">
                        <div className="search-filter-content">
                            <SearchFilterCriteria filter={filters.startDate}/>
                            <SearchFilterCriteria filter={filters.endDate}/>
                        </div>
                    </Tab>
                    <Tab id={EntityType.User} header="User">
                        <div className="search-filter-content">
                            <SearchFilterCriteria filter={filters.userName}/>
                            <SearchFilterCriteria filter={filters.userEmail}/>
                        </div>
                    </Tab>
                    <Tab id={EntityType.FoodItem} header="Food">
                        <div className="search-filter-content">
                            <SearchFilterCriteria filter={filters.foodName}/>
                            <SearchFilterCriteria filter={filters.foodOrigin}/>
                            <SearchFilterCriteria filter={filters.averageRating}/>
                        </div>
                    </Tab>
                </Tabs>

            </div>
        </Dropdown>
    );
}

export default SearchFilterDropdown;