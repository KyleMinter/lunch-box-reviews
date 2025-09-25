import useAuth from "../../auth/useAuth";


const AuthButton = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <LogoutButton /> : <LoginButton />;
};

const LoginButton = () => {
    const { login } = useAuth();

    return (
        <div onClick={() => login()}>
            Log In
        </div>
    );
};

const LogoutButton = () => {
    const { logout } = useAuth();

    return (
        <div onClick={() => logout()}>
            Log Out
        </div>
    );
};

export default AuthButton;