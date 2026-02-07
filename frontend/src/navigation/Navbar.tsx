import { useNavigate } from 'react-router-dom';
import './navbar.css'
import NavbarMenu from './NavbarMenu';
import Search from '../components/search/Search';


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
      <Search />
      <NavbarMenu />
    </header>
  );
}

export default Navbar;