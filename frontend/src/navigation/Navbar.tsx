import './navbar.css'
import ProfileDropdown from "./profileDropdown/ProfileDropdown";
import SearchBar from "./searchBar/SearchBar";

const Navbar = () => {
    return (
        <header className="navbar">
            <img src="logo192.png" alt=""/>
            <h2>Lunch Box Reviews</h2>
            <SearchBar />
            <ProfileDropdown />
        </header>
    );
}

export default Navbar;