import './searchPage.css';
import SearchResult from './SearchResult';


const SearchPage = () => {
    return (
        <div className="page-layout">
            <div className="search-results-title">
                <h1>Search Results</h1>
            </div>
            <div className="search-results-headers">
                <h4>Food</h4>
                <h4>User</h4>
                <h4>Rating</h4>
                <h4>Quality</h4>
                <h4>Quantity</h4>
                <h4>Date</h4>
            </div>
            <div className="search-results">
                <SearchResult content='one' />
                <SearchResult content='two'/>
                <SearchResult content='three'/>
            </div>
        </div>
    )
}

export default SearchPage;