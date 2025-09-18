import { Link } from "react-router-dom"
import AuthenticationButton from "../Auth0/AuthenticationButton"
import Dropdown from "./Dropdowns"
import './ProfileDropdown.css';


const ProfileDropdown = () => {
    return (
        <Dropdown
            alignment='right'
            parent={<img style={{height: "50px", margin: "5px"}}src="logo192.png" />}
        >
            <ProfileDropdownItem link="/">Profile</ProfileDropdownItem>
            <ProfileDropdownItem link="/"><AuthenticationButton /></ProfileDropdownItem>
        </Dropdown>
    );
}

interface ProfileDropdownItemProps {
    link: string;
    children: React.ReactNode;
}

const ProfileDropdownItem: React.FC<ProfileDropdownItemProps> = ({ link, children }) => {
    return (
        <Link to={link} className="profile-dropdown-item">{children}</Link>
    );
}

export default ProfileDropdown;