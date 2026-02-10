import { Context, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { EntityType, User, userSchema } from "@lunch-box-reviews/shared-types";
import axios, { AxiosResponse } from "axios";
import AuthContext, { AuthContextInterface } from "./AuthContext";
import { AUTH0_AUDIENCE, AUTH_ENABLED } from "../constants";


// Returns auth values based on whether or not authenticaion is enabled/disabled
// eslint-disable-next-line react-hooks/rules-of-hooks
const getAuth = (authEnabled: boolean) => {
  if (authEnabled) {
    return {
      isEnabled: authEnabled,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ...useAuth0()
    };
  }
  else {
    // Return values which will allow for testing while authentication is disabled.
    const stub = (): never => {
      throw new Error('Authentication is disabled!');
    };

    return {
      isEnabled: authEnabled,
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
      getAccessTokenSilently: stub,
      loginWithRedirect: stub,
      logout: stub,
    };
  }
}

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
    isEnabled,
    isAuthenticated,
    isLoading,
    user: auth0User,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout
  } = getAuth(AUTH_ENABLED)

  const [user, setUser] = useState<User | undefined>(undefined);


  useEffect(() => {
    (async () => {
      // If authentication is disabled we will provide a fake user to test with.
      if (!AUTH_ENABLED) {
        const fakeUser: User = {
          entityId: '',
          entityType: EntityType.User,
          userName: 'User Name',
          userEmail: 'user.email@gmail.com',
          created: '02/07/2026'
        };
        setUser(fakeUser);
      }
      else if (AUTH_ENABLED && isAuthenticated) {
        const token = await getAccessTokenSilently();

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const body = {
          userName: `${auth0User!.username}`,
          userEmail: `${auth0User!.email}`
        }

        const url = `${AUTH0_AUDIENCE}users`;

        try {
          /*  TODO: it may be worth investigating using auth0's user for everything and then just grabbing user perms from this API call.
              the result of this is that it will be faster to fetch user info for profile, and we won't mind waiting a hot sec for perm checks.
              this all might be a mute point tho since becayse once we've grabbed the user info from the DB for the first time, we won't have to fetch it again.
          */

          const response: AxiosResponse<User> = await axios.post(url, body, { headers: headers });
          const user = userSchema.parse(response.data);
          setUser(user);
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
    await auth0Logout!({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

  const logoutWithError = useCallback(async () => {
    setUser(undefined);
    await auth0Logout({ logoutParams: { returnTo: '/?authError' } });
  }, [auth0Logout]);

  const isAuthorized = useCallback((): boolean => {
    if (!AUTH_ENABLED) return true;
    else return user !== undefined;
  }, [user, AUTH_ENABLED]);

  const contextValue = useMemo<AuthContextInterface>(() => {
    return {
      isEnabled,
      isAuthenticated,
      isLoading,
      getAccessTokenSilently,
      user,
      login,
      logout,
      isAuthorized
    }
  }, [
    isEnabled,
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