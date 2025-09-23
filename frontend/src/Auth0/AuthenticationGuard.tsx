import { withAuthenticationRequired } from "@auth0/auth0-react"
import { ComponentType } from "react";
import LoadingPage from "../Pages/LoadingPage/LoadingPage";
import { UserPermission } from '@lunch-box-reviews/shared-types';
import UnauthorizedPage from "../Pages/UnauthorizedPage/UnauthorizedPage";
import useAuth from "./useAuth";


interface AuthenticationGuardProps {
    component: ComponentType<object>;
    permission?: UserPermission;
}

const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({ component, permission }) => {
    const { user, isAuthenticated, isAuthorized } = useAuth();

    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => (
            <LoadingPage />
        )
    });

    // Yes, I know this is a bit weird, but it works so who cares.
    // First check if user is authenticated with Auth0, becuase if they are not routing them to the provided route component will redirect them to the login page.
    if (!isAuthenticated)
        return <Component />;
    else if (!user)
        return <LoadingPage />;
    // Now that we know the user is authenticated, we can ensure they have the valid permissions for the provided route.
    else if (!isAuthorized(permission))
        return <UnauthorizedPage />;
    else
        return <Component />;
}

export default AuthenticationGuard;