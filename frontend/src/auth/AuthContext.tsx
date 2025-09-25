import { GetTokenSilentlyOptions } from "@auth0/auth0-react";
import { User, UserPermission } from "@lunch-box-reviews/shared-types";
import { createContext } from "react";


export interface AuthContextInterface {
    isEnabled: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    getAccessTokenSilently: (options?: GetTokenSilentlyOptions | undefined) => Promise<string>;
    user?: User;
    login: () => Promise<void>;
    logout: () => Promise<void>
    isAuthorized: (permission?: UserPermission | undefined) => boolean;
};

const stub = (): never => {
    throw new Error('You forgot to wrap your component in <AuthProvider>.');
};

const init: AuthContextInterface = {
    isEnabled: true,
    isAuthenticated: false,
    isLoading: true,
    getAccessTokenSilently: stub,
    user: undefined,
    login: stub,
    logout: stub,
    isAuthorized: stub
};

const AuthContext = createContext(init);

export default AuthContext;