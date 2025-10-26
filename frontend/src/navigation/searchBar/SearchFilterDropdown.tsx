import { EntityType } from "@lunch-box-reviews/shared-types"
import Dropdown from "../../components/dropdown/Dropdown"
import useSearchFilters from "../../hooks/useSearchFilters"
import Tabs, { TabOption } from "../../components/tabs/Tabs";



interface SearchFilterContentProps {
    selected: EntityType
}

const SearchFilterContent: React.FC<SearchFilterContentProps> = ({ selected }) => {
    switch (selected) {
        case EntityType.Review:
            return (
                <div className="search-filter-content">
                    review specific filters
                </div>
            );
        case EntityType.User:
            return (
                <div className="search-filter-content">
                    user specific filters
                </div>
            );
        case EntityType.FoodItem:
            return (
                <div className="search-filter-content">
                    food specific filters
                </div>
            );
        default:
            return (
                <div className="search-filter-content">
                    empty
                </div>
            );
    }
}

const SearchFilterDropdown = () => {
    const { filters, setFilters } = useSearchFilters();

    const setEntityFilter = (option: TabOption) => {
        if (filters.entityType !== option.key as EntityType)
            setFilters({
                ...filters,
                entityType: option.key as EntityType
            })
    }

    return (
        <Dropdown
            marginTop="15px"
            alignment="right"
            parent={<button className="search-filter-button">filter</button>}
        >
            <div className="search-filter-container">
                <div>
                    <Tabs
                        options={[
                            { name: 'Review', key: EntityType.Review, selected: filters.entityType === EntityType.Review },
                            { name: 'User', key: EntityType.User, selected: filters.entityType === EntityType.User },
                            { name: 'Food', key: EntityType.FoodItem, selected: filters.entityType === EntityType.FoodItem }
                        ]}
                        onOptionSelect={setEntityFilter}
                    >
                        <SearchFilterContent selected={filters.entityType} />
                    </Tabs>
                </div>
            </div>
        </Dropdown>
    );
}

export default SearchFilterDropdown;