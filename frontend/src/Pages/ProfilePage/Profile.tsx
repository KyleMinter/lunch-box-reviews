import { useEffect, useState } from "react";
import useAuth from "../../Auth/useAuth";

function Profile() {
    const { isEnabled, user, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth();
    const [token, setToken] = useState<string>('');
    
    useEffect(() => {
        (async () => {
            if (isEnabled)
                setToken(await getAccessTokenSilently());
        })();
    }, [getAccessTokenSilently, isEnabled]);

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    if (isAuthenticated) {
        return (
            <div>
                <h2>{user?.userName}</h2>
                <p>{user?.userEmail}</p>
                <p>{token}</p>
            </div>
        );
    }

    return (
        <div></div>
    )
};

export default Profile;