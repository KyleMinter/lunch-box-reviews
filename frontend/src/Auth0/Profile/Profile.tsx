import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function Profile() {

    const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

    useEffect(() => {
        async function validateUserInDatabase() {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: audience
                    }
                });
                setToken(token);
                await fetch(`${audience}users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userName: `${user!.username}`,
                        userEmail: `${user!.email}`
                    })
                });
            }
            catch (error) {
                console.log(error);
            }
        }

        if (isAuthenticated)
            validateUserInDatabase();
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
                <h2>{user!.username}</h2>
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