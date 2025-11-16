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
                            <SearchFilterCriteria
                                name="Start Date"
                                group="reviewCriteria"
                                selected={filters.startDate.selected}
                                selectionType="checkbox"
                                inputType='date'
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_TOGGLE', filter: 'startDate', value: value})}
                            />
                            <SearchFilterCriteria
                                name="End Date"
                                group="reviewCriteria"
                                selected={filters.endDate.selected}
                                selectionType="checkbox"
                                inputType='date'
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_TOGGLE', filter: 'endDate', value: value })}
                            />
                        </div>
                    </Tab>
                    <Tab id={EntityType.User} header="User">
                        <div className="search-filter-content">
                            <SearchFilterCriteria
                                name="Name"
                                group="userCriteria"
                                selected={filters.userName.selected}
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_SELECT', filter: 'userName', value: value })}
                            />
                            <SearchFilterCriteria
                                name="Email"
                                group="userCriteria"
                                selected={filters.userEmail.selected}
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_SELECT', filter: 'userEmail', value: value })}
                            />
                        </div>
                    </Tab>
                    <Tab id={EntityType.FoodItem} header="Food">
                        <div className="search-filter-content">
                            <SearchFilterCriteria
                                name="Name"
                                group="foodCriteria"
                                selected={filters.foodName.selected}
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_SELECT', filter: 'foodName', value: value })}
                            />
                            <SearchFilterCriteria
                                name="Origin"
                                group="foodCriteria"
                                selected={filters.foodOrigin.selected}
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_SELECT', filter: 'foodOrigin', value: value })}
                            />
                            <SearchFilterCriteria
                                name="Average Rating"
                                group="foodCriteria"
                                selected={filters.averageRating.selected}
                                onInteract={(value?: string) => filtersDispatch({ type: 'FILTER_SELECT', filter: 'averageRating', value: value })}
                            />
                        </div>
                    </Tab>
                </Tabs>

            </div>
        </Dropdown>
    );
}

export default SearchFilterDropdown;