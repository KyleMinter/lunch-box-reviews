import { useContext } from "react";
import AuthContext, { AuthContextInterface } from "./AuthContext";


/**
 *  ```js
 *  const = {
 *    isAuthenticated,
 *    isLoading,
 *    getAccessTokenSilently,
 *    user,
 *    login,
 *    logout,
 *    isAuthorized
 *  } = useAuth();
 * ```
 * Used to access auth state and methods.
 */
const useAuth = (context = AuthContext): AuthContextInterface => {
  return useContext(context) as AuthContextInterface
}

export default useAuth;