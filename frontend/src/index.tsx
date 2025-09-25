import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import Auth0ProviderWithNavigate from './auth/Auth0ProviderWithNavigate';
import AuthProvider from './auth/AuthProvider';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const authParams = {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
};
const authEnabled = (process.env.REACT_APP_AUTH_ENABLE === 'TRUE');

const Application = (
    <AuthProvider authEnabled={authEnabled} audience={authParams.audience}>
        <App />
    </AuthProvider>
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            {
                authEnabled ?
                <Auth0ProviderWithNavigate authParams={authParams}>
                        {Application}
                </Auth0ProviderWithNavigate>
                : Application
            }
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
