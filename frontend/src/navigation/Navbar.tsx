import { useNavigate } from 'react-router-dom';
import './navbar.css'
import NavbarDropdown from './navbarDropdown/navbarDropdown';
import SearchBar from "./searchBar/SearchBar";

const Navbar = () => {
    const navigate = useNavigate();

    const navigateToHome = () => {
        navigate('/');
    }

    return (
        <header className="navbar">
            <div className="navbar-home">
                <img
                    onClick={navigateToHome}
                    src="logo192.png" alt=""
                />
                <h2 onClick={navigateToHome}>Lunch Box Reviews</h2>
            </div>
            <SearchBar />
            <NavbarDropdown />
        </header>
    );
}

export default Navbar;