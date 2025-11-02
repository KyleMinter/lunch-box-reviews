import { EntityType } from "@lunch-box-reviews/shared-types"
import Dropdown from "../../components/dropdown/Dropdown"
import useSearchFilters from "../../hooks/useSearchFilters"
import Tabs, { Tab } from "../../components/tabs/Tabs";
import SearchFilterCriteria from "./SearchFilterCriteria";


const SearchFilterDropdown = () => {
    const { filters, setFilters } = useSearchFilters();

    const setEntityFilter = (id: string) => {
        const entityType = id as EntityType;
        if (filters.entityType !== entityType)
            setFilters({
                ...filters,
                entityType: entityType
            })
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
                                id="startDate"
                                categoryName="reviewCriteria"
                                selected={filters.selectedReviewCriteria === 'START_DATE'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedReviewCriteria: 'START_DATE'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedReviewCriteria: 'START_DATE',
                                        startDate: value
                                    })
                                }}
                            />
                            <SearchFilterCriteria
                                name="End Date"
                                id="endDate"
                                categoryName="reviewCriteria"
                                selected={filters.selectedReviewCriteria === 'END_DATE'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedReviewCriteria: 'END_DATE'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedReviewCriteria: 'END_DATE',
                                        endDate: value
                                    })
                                }}
                            />
                        </div>
                    </Tab>
                    <Tab id={EntityType.User} header="User">
                        <div className="search-filter-content">
                            <SearchFilterCriteria
                                name="Name"
                                id="userName"
                                categoryName="userCriteria"
                                selected={filters.selectedUserCriteria === 'NAME'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedUserCriteria: 'NAME'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedUserCriteria: 'NAME',
                                        userName: value
                                    })
                                }}
                            />
                            <SearchFilterCriteria
                                name="Email"
                                id="userEmail"
                                categoryName="userCriteria"
                                selected={filters.selectedUserCriteria === 'EMAIL'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedUserCriteria: 'EMAIL'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedUserCriteria: 'EMAIL',
                                        userEmail: value
                                    })
                                }}
                            />
                        </div>
                    </Tab>
                    <Tab id={EntityType.FoodItem} header="Food">
                        <div className="search-filter-content">
                            <SearchFilterCriteria
                                name="Name"
                                id="foodName"
                                categoryName="foodCriteria"
                                selected={filters.selectedFoodCriteria === 'NAME'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedFoodCriteria: 'NAME'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedFoodCriteria: 'NAME',
                                        foodName: value
                                    })
                                }}
                            />
                            <SearchFilterCriteria
                                name="Origin"
                                id="foodOrigin"
                                categoryName="foodCriteria"
                                selected={filters.selectedFoodCriteria === 'ORIGIN'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedFoodCriteria: 'ORIGIN'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedFoodCriteria: 'ORIGIN',
                                        foodOrigin: value
                                    })
                                }}
                            />
                            <SearchFilterCriteria
                                name="Average Rating"
                                id="averageRating"
                                categoryName="foodCriteria"
                                selected={filters.selectedFoodCriteria === 'RATING'}
                                onSelect={() => {
                                    setFilters({
                                        ...filters,
                                        selectedFoodCriteria: 'RATING'
                                    })
                                }}
                                onEdit={(value: string) => {
                                    setFilters({
                                        ...filters,
                                        selectedFoodCriteria: 'RATING',
                                        averageRating: value
                                    })
                                }}
                            />
                        </div>
                    </Tab>
                </Tabs>

            </div>
        </Dropdown>
    );
}

export default SearchFilterDropdown;