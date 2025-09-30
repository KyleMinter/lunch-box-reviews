import { EntityType, FoodItem, Review, User } from '@lunch-box-reviews/shared-types';
import UsersTable from '../../components/table/UsersTable';
import ReviewsTable from '../../components/table/ReviewsTable';
import FoodTable from '../../components/table/FoodTable';
import './searchPage.css';


const SearchPage = () => {
        const users: User[] = [
            {userName: 'name', userEmail: 'email', entityID: 'uid1', entityType: EntityType.User, userPermissions: []},
            {userName: 'name', userEmail: 'email', entityID: 'uid2', entityType: EntityType.User, userPermissions: []}
        ];

        const reviews: Review[] = [
            {entityID: 'rid1', foodID: 'food', menuID: '01/01/2025', userID: 'user', quality: 5.55, quantity: 3, rating: 8, reviewDate: '01/01/2025', entityType: EntityType.Review},
            {entityID: 'rid2', foodID: 'food', menuID: '01/01/2025', userID: 'user', quality: 5.55, quantity: 3, rating: 8, reviewDate: '01/01/2025', entityType: EntityType.Review}
        ];

        const foods: FoodItem[] = [
            {entityID: 'fid1', foodName: 'name', foodOrigin: 'origin', foodAttributes: {nutrition: 'nutrition', description: 'description'}, totalRating: 20, numReviews: 2, entityType: EntityType.FoodItem},
            {entityID: 'fid1', foodName: 'name', foodOrigin: 'origin', foodAttributes: {}, totalRating: 15, numReviews: 3, entityType: EntityType.FoodItem}
        ];

        return (
        <div className="page-layout">
            <div className="search-results-title">
                <h1>Search Results</h1>
            </div>
            <UsersTable users={users} />
            <ReviewsTable reviews={reviews} />
            <FoodTable foodItems={foods}/>
        </div>
    )
}

export default SearchPage;