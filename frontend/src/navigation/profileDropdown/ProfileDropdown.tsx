import { Link } from "react-router-dom"
import './profileDropdown.css';
import Dropdown from "../../components/dropdown/Dropdown";
import AuthButton from "./AuthButton";


const ProfileDropdown = () => {
    return (
        <Dropdown
            alignment='right'
            parent={<ProfileDropdownParent />}
        >
            <ProfileDropdownItem link="/profile">Profile</ProfileDropdownItem>
            <ProfileDropdownItem link="/"><AuthButton /></ProfileDropdownItem>
        </Dropdown>
    );
}

const ProfileDropdownParent = () => {
    return (
        <img style={{height: "50px", margin: "5px"}} src="logo192.png" alt=""/>
    )
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