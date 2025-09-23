import useAuth from './useAuth';

const AuthenticationButton = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <LogoutButton /> : <LoginButton />;
};

const LoginButton = () => {
    const { login } = useAuth();

    return (
        <button onClick={() => login()}>
            Log In
        </button>
    );
};

const LogoutButton = () => {
    const { logout } = useAuth();

    return (
        <button onClick={() => logout()}>
            Log Out
        </button>
    );
};

export default AuthenticationButton;