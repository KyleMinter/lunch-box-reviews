import './App.css';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import Profile from './Auth0/Profile/Profile';
import { useEffect } from 'react';
import AuthenticationButton from './Auth0/AuthenticationButton/AuthenticationButton';




function App() {
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
    console.log(domain);
    console.log(clientId);
    console.log(audience);

    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        async function validateUserInDatabase() {
            console.log('2');
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: audience
                    }
                });
                const response = await fetch(`${audience}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: `${user!.name}`,
                        email: `${user!.email}`
                    })
                });
                console.log(response.json());
            }
            catch (error) {
                console.log(error);
            }
        }
        console.log('0');

        if (isAuthenticated) {
            console.log('1');
            validateUserInDatabase();
        }
    }, [isAuthenticated, getAccessTokenSilently, user, audience]);

    return (
        <Auth0Provider
            domain={domain!}
            clientId={clientId!}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: audience,
            }}
        >
            <div className="App">
                <AuthenticationButton />
                <Profile />
            </div>
        </Auth0Provider>
    );
}

export default App;
