import './App.css';
import { Auth0Provider } from '@auth0/auth0-react';
import Profile from './Auth0/Profile/Profile';
import AuthenticationButton from './Auth0/AuthenticationButton/AuthenticationButton';




function App() {
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
    console.log(domain);
    console.log(clientId);
    console.log(audience);

    return (
        <Auth0Provider
            domain={domain!}
            clientId={clientId!}
            authorizationParams={{
                redirect_uri: window.location.origin,
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
