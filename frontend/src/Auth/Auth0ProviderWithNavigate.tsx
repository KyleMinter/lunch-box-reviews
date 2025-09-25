import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { Auth0Provider, AppState } from '@auth0/auth0-react';

interface Auth0ProviderWithNavigateProps {
    children: React.ReactNode;
    authParams: {
        domain?: string;
        clientId?: string;
        audience?: string;
    }
    
}

const Auth0ProviderWithNavigate: React.FC<Auth0ProviderWithNavigateProps> = ({ children, authParams }) => {
    const {
        domain,
        clientId,
        audience
    } = authParams;

    const navigate = useNavigate();
    const location = useLocation();

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
                acr_values: `${window.location.origin}${location.pathname}`,
                audience: audience
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};

export default Auth0ProviderWithNavigate;