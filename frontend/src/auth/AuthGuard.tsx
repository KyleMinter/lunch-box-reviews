import { withAuthenticationRequired } from "@auth0/auth0-react"
import { ComponentType } from "react";
import LoadingPage from "../pages/LoadingPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import useAuth from "./useAuth";


interface AuthGuardProps {
  Component: ComponentType<object>;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ Component }) => {
  const { isEnabled, user, isAuthenticated, isAuthorized } = useAuth();

  // If authentication is disabled we will simply permit navigation to the provided component.
  if (!isEnabled)
    return (<Component />);

  const Page = withAuthenticationRequired(Component, {
    onRedirecting: () => (
      <LoadingPage />
    )
  });

  // Yes, I know this is a bit weird, but it works so who cares.
  // First check if user is authenticated with Auth0, becuase if they are not routing them to the provided route component will redirect them to the login page.
  if (!isAuthenticated)
    return <Page />;
  else if (!user)
    return <LoadingPage />;
  // Now that we know the user is authenticated, we can ensure they have the valid permissions for the provided route.
  else if (!isAuthorized())
    return <UnauthorizedPage />;
  else
    return <Page />;
}

export default AuthGuard;