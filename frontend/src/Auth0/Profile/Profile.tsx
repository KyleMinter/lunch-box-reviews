import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function Profile() {

    useEffect(() => {
        async function token() {
            setToken(await getAccessTokenSilently());
        }

        if (isAuthenticated)
            token();
    })
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState('');

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    if (isAuthenticated) {
        return (
            <div>
                <img src={user!.picture} alt={user!.name} />
                <h2>{user!.name}</h2>
                <p>{user!.email}</p>
                <p>{token}</p>
            </div>
        );
    }

    return (
        <div></div>
    )
};

export default Profile;