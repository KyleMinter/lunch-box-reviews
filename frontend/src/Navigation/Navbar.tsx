import { Link } from "react-router-dom";
import './Navbar.css'
import ProfileDropdown from "../Dropdowns/ProfileDropdown";
import SearchBar from "./SearchBar/SearchBar";

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