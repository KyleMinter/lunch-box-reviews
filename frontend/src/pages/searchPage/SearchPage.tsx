import { EntityType, FoodItem, Review, User } from '@lunch-box-reviews/shared-types';
import UsersTable from '../../components/table/UsersTable';
import ReviewsTable from '../../components/table/ReviewsTable';
import FoodTable from '../../components/table/FoodTable';
import './searchPage.css';
import useSearchResults from '../../hooks/useSearchResults';


const SearchPage = () => {
        const { searchResults } = useSearchResults();
        
        let table;
        if (searchResults && searchResults.length > 0) {
            switch (searchResults[0].entityType) {
                case EntityType.Review:
                    table = <ReviewsTable reviews={searchResults as Review[]} />;
                    break;
                case EntityType.User:
                    table = <UsersTable users={searchResults as User[]} />;
                    break;
                case EntityType.FoodItem:
                    table = <FoodTable foodItems={searchResults as FoodItem[]}/>;
                    break;
            }
        }
        else {
            table = <div>no results</div>;
        }

        return (
            <div className="page-layout">
                <div className="search-results-title">
                    <h1>Search Results</h1>
                </div>
                { table }
            </div>
    )
}

export default SearchPage;