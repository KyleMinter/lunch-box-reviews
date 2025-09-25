import './navbar.css'
import NavbarDropdown from './navbarDropdown/navbarDropdown';
import SearchBar from "./searchBar/SearchBar";

const Navbar = () => {
    return (
        <header className="navbar">
            <img src="logo192.png" alt=""/>
            <h2>Lunch Box Reviews</h2>
            <SearchBar />
            <NavbarDropdown />
        </header>
    );
}

export default Navbar;