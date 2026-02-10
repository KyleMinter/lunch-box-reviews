import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { Auth0Provider, AppState } from '@auth0/auth0-react';
import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH_ENABLED } from '../constants';

interface Auth0ProviderWithNavigateProps {
  children: React.ReactNode;
}

const Auth0ProviderWithNavigate: React.FC<Auth0ProviderWithNavigateProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || window.location.pathname);
  }

  if (AUTH_ENABLED && !(AUTH0_DOMAIN && AUTH0_CLIENT_ID)) {
    return null;
  }

  if (AUTH_ENABLED) {
    return (
      <Auth0Provider
        domain={AUTH0_DOMAIN!}
        clientId={AUTH0_CLIENT_ID!}
        authorizationParams={{
          redirect_uri: window.location.origin,
          acr_values: `${window.location.origin}${location.pathname}`,
          audience: AUTH0_AUDIENCE
        }}
        onRedirectCallback={onRedirectCallback}
      >
        {children}
      </Auth0Provider>
    );
  } else {
    return (<>{children}</>);
  }
};

export default Auth0ProviderWithNavigate;