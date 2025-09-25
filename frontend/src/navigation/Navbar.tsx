import { Link } from "react-router-dom";
import './navbar.css'
import ProfileDropdown from "./profileDropdown/ProfileDropdown";
import SearchBar from "./searchBar/SearchBar";

const Navbar = () => {
    return (
        <header className="navbar">
            <img src="logo192.png" alt=""/>
            <nav className="navbar-buttons">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/">Home</Link></li>
                </ul>
            </nav>
            <SearchBar />
            <ProfileDropdown />
        </header>
    );
}

export default Navbar;