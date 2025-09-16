import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { Auth0Provider, AppState } from '@auth0/auth0-react';

interface Auth0ProviderWithNavigateProps {
    children: React.ReactNode;
}

const Auth0ProviderWithNavigate: React.FC<Auth0ProviderWithNavigateProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

    const onRedirectCallback = (appState?: AppState) => {
        navigate(appState?.returnTo || window.location.pathname);
    }

    if (!(domain && clientId))
        return null;

    return (
        <Auth0Provider
            domain={domain!}
            clientId={clientId!}
            authorizationParams={{
                redirect_uri: window.location.origin,
                acr_values: `${window.location.origin}${location.pathname}`
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};

export default Auth0ProviderWithNavigate;