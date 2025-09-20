import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import { ComponentType, useEffect, useState } from "react";
import LoadingPage from "../Pages/LoadingPage/LoadingPage";
import { User, UserPermission } from '@lunch-box-reviews/shared-types';
import axios, { AxiosResponse } from "axios";
import UnauthorizedPage from "../Pages/UnauthorizedPage/UnauthorizedPage";


interface AuthenticationGuardProps {
    component: ComponentType<object>;
    permission?: UserPermission;
}

const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({ component, permission }) => {
    const { user, isAuthenticated } = useAuth0();
    const [isAuthorized, setAuthorized] = useState(false)

    useEffect(() => {
        async function validateUserPermissions() {
            try {
                const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
                const response: AxiosResponse<User> = await axios.get(`${audience}users/${user?.sub}`);
                
                if (response.data.userPermissions.includes(permission!))
                    setAuthorized(true);
            }
            catch (error) {
                console.error(error);
            }
        }

        if (isAuthenticated) {
            if (permission)
                validateUserPermissions();
            else
                setAuthorized(true);
        }
    }, [isAuthenticated, user, permission])

    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => (
            <LoadingPage />
        )
    });

    // Yes, I know this is a bit weird, but it works so who cares.
    // First check if user is authenticated with Auth0, becuase if they are not routing them to the provided route component will redirect them to the login page.
    if (!isAuthenticated)
        return <Component />;
    // Now that we know the user is authenticated, we can ensure they have the valid permissions for the provided route.
    else if (!isAuthorized)
        return <UnauthorizedPage />;
    else
        return <Component />;
}

export default AuthenticationGuard;