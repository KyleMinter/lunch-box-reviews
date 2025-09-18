import { Link } from "react-router-dom";
import './Navbar.css'
import ProfileDropdown from "../Dropdowns/ProfileDropdown";

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
            <ProfileDropdown />
        </header>
    );
}

export default Navbar;