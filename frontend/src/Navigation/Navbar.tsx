import { useNavigate } from "react-router-dom";
import AuthenticationButton from "../Auth0/AuthenticationButton";

const Navbar = () => {
    const navigate = useNavigate();

    const onHomeClick = () => {
        navigate('/');
    }

    return (
        <div>
            <button onClick={onHomeClick}>Home</button>
            <AuthenticationButton />
        </div>
    );
}

export default Navbar;