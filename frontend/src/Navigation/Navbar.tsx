import { Link } from "react-router-dom";
import AuthenticationButton from "../Auth0/AuthenticationButton";
import './Navbar.css'

const Navbar = () => {
    return (
        <header className="navbar">
            <img src="logo192.png" />
            <nav className="navbar-buttons">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/">Home</Link></li>
                </ul>
            </nav>
            <div className="menu-button">
                <AuthenticationButton />
            </div>
        </header>
    );
}

export default Navbar;