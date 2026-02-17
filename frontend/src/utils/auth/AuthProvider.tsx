import { Context, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { EntityType, User, userSchema } from "@lunch-box-reviews/shared-types";
import axios, { AxiosResponse } from "axios";
import AuthContext, { AuthContextInterface } from "./AuthContext";
import { AUTH0_AUDIENCE, AUTH0_CLAIM_NAMESPACE, AUTH_ENABLED } from "../../constants";


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
      getIdTokenClaims: stub,
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
    getIdTokenClaims,
    loginWithRedirect,
    logout: auth0Logout
  } = getAuth(AUTH_ENABLED)

  const [user, setUser] = useState<User | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);


  useEffect(() => {
    (async () => {
      // If authentication is disabled we will provide a fake user to test with.
      if (!AUTH_ENABLED) {
        const fakeUser: User = {
          entityId: '',
          entityType: EntityType.User,
          userName: 'User Name',
          userEmail: 'user.email@gmail.com',
          userPicture: '/logo192.png',
          created: '02/07/2026'
        };
        setUser(fakeUser);
        setIsAdmin(true);
      }
      else if (AUTH_ENABLED && isAuthenticated) {
        const claims = await getIdTokenClaims();
        const roles = claims?.[`${AUTH0_CLAIM_NAMESPACE}/roles`] || [];
        setIsAdmin(roles.includes('Admin'));
        
        const token = await getAccessTokenSilently();
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        const body = {
          userName: `${auth0User!.username}`,
          userEmail: `${auth0User!.email}`,
          userPicture: `${auth0User!.picture}`
        }
        const url = `${AUTH0_AUDIENCE}users`;

        try {
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
    await auth0Logout({ logoutParams: { returnTo: `${window.location.origin}/authError` } });
  }, [auth0Logout]);

  const isAuthorized = useCallback((): boolean => {
    if (!AUTH_ENABLED) return true;
    else return user !== undefined;
  }, [user]);

  const contextValue = useMemo<AuthContextInterface>(() => {
    return {
      isEnabled,
      isAuthenticated,
      isLoading,
      isAdmin,
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
    isAdmin,
    getAccessTokenSilently,
    user,
    login,
    logout,
    isAuthorized
  ]);

  return <context.Provider value={contextValue}>{children}</context.Provider>
}

export default AuthProvider;