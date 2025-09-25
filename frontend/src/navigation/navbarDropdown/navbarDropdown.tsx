import { Link } from "react-router-dom"
import './navbarDropdown.css';
import Dropdown from "../../components/dropdown/Dropdown";
import AuthButton from "./AuthButton";


const NavbarDropdown = () => {
    return (
        <Dropdown
            alignment='right'
            parent={<img style={{height: "50px", margin: "5px"}} src="logo192.png" alt=""/>}
        >
            <ProfileDropdownItem>Home</ProfileDropdownItem>
            <ProfileDropdownItem link='/profile'>Profile</ProfileDropdownItem>
            <ProfileDropdownItem><AuthButton /></ProfileDropdownItem>
        </Dropdown>
    );
}

interface NavbarDropdownItemProps {
    link?: string;
    children: React.ReactNode;
}

const ProfileDropdownItem: React.FC<NavbarDropdownItemProps> = ({ link = '/', children }) => {
    return (
        <Link to={link} className="navbar-dropdown-item">
            {children}
        </Link>
    );
}

export default NavbarDropdown;