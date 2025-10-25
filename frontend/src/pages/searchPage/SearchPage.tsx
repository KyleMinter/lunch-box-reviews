import { EntityType, FoodItem, Review, User } from '@lunch-box-reviews/shared-types';
import UsersTable from '../../components/table/UsersTable';
import ReviewsTable from '../../components/table/ReviewsTable';
import FoodTable from '../../components/table/FoodTable';
import useSearchResults from '../../hooks/useSearchResults';
import './searchPage.css';


const SearchPage = () => {
        const { searchResults } = useSearchResults();
        
        const Table = () => {
            switch (searchResults && searchResults[0].entityType) {
                case EntityType.Review:
                    return <ReviewsTable reviews={searchResults as Review[]} />;
                case EntityType.User:
                    return  <UsersTable users={searchResults as User[]} />;
                case EntityType.FoodItem:
                    return <FoodTable foodItems={searchResults as FoodItem[]}/>;
            }

            return <div>no results</div>;
        };

        return (
            <div className="page-layout">
                <div className="search-results-title">
                    <h1>Search Results</h1>
                </div>
                <Table />
            </div>
    )
}

export default SearchPage;