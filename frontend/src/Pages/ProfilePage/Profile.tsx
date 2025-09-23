import { useEffect, useState } from "react";
import useAuth from "../../Auth0/useAuth";

function Profile() {
    const { user, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth();
    const [token, setToken] = useState<string>('');
    
    useEffect(() => {
        (async () => {
            setToken(await getAccessTokenSilently());
        })();
    }, [getAccessTokenSilently]);

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    if (isAuthenticated) {
        return (
            <div>
                <h2>{user!.userName}</h2>
                <p>{user!.userEmail}</p>
                <p>{token}</p>
            </div>
        );
    }

    return (
        <div></div>
    )
};

export default Profile;