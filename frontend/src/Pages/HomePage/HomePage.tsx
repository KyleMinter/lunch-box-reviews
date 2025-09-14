import AuthenticationButton from "../../Auth0/AuthenticationButton";
import Profile from "../../Auth0/Profile";

const HomePage = () => {
    return (
        <div>
            home page
            <AuthenticationButton />
            <Profile />
        </div>
    )
}

export default HomePage;