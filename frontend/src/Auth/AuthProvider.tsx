import { Context, useCallback, useEffect, useMemo, useState } from "react";
import AuthContext, { AuthContextInterface } from "./AuthContext";
import { useAuth0 } from "@auth0/auth0-react";
import { User, UserPermission } from "@lunch-box-reviews/shared-types";
import axios, { AxiosResponse } from "axios";


interface AuthProviderOptions {
    children: React.ReactNode;
    context?: Context<AuthContextInterface>;
}

const AuthProvider = (opts: AuthProviderOptions) => {
    const {
        children,
        context = AuthContext
    } = opts;

    const {
        isAuthenticated,
        isLoading,
        user: auth0User,
        getAccessTokenSilently,
        loginWithRedirect,
        logout: auth0Logout
    } = useAuth0();

    const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
    
    const [user, setUser] = useState<User | undefined>(undefined);

    
    useEffect(() => {
        (async () => {
            if (isAuthenticated) {
                const token = await getAccessTokenSilently();

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };

                const body = {
                    userName: `${auth0User!.username}`,
                    userEmail: `${auth0User!.email}`
                }

                const url = `${audience}users`;

                try {
                    /*  TODO: it may be worth investigating using auth0's user for everything and then just grabbing user perms from this API call.
                        the result of this is that it will be faster to fetch user info for profile, and we won't mind waiting a hot sec for perm checks.
                        this all might be a mute point tho since becayse once we've grabbed the user info from the DB for the first time, we won't have to fetch it again.
                    */

                    const response: AxiosResponse<User> = await axios.post(url, body, { headers: headers });
                    setUser(response.data);
                }
                catch (err) {
                    logoutWithError();
                }
            }
            

        })()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated]);


    const login = useCallback(async () => {
        await loginWithRedirect();
    }, [loginWithRedirect]);

    const logout = useCallback(async () => {
        await auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }, [auth0Logout]);

    const logoutWithError = useCallback(async () => {
        setUser(undefined);
        await auth0Logout({ logoutParams: { returnTo: '/?authError' } });
    }, [auth0Logout]);

    const isAuthorized = useCallback((permission?: UserPermission): boolean => {
        if (!user)
            return false;
        else {
            if (!permission)
                return true;
            else
                return user.userPermissions.includes(permission);
        }
    }, [user]);

    const contextValue = useMemo<AuthContextInterface>(() => {

        return {
            isAuthenticated,
            isLoading,
            getAccessTokenSilently,
            user,
            login,
            logout,
            isAuthorized
        }
    }, [
        isAuthenticated,
        isLoading,
        getAccessTokenSilently,
        user,
        login,
        logout,
        isAuthorized
    ]);

    return <context.Provider value={contextValue}>{children}</context.Provider>
}

export default AuthProvider;