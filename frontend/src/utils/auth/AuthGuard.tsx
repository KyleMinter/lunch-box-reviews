import { withAuthenticationRequired } from "@auth0/auth0-react"
import { ComponentType } from "react";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";


interface AuthGuardProps {
  Component: ComponentType<object>;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ Component, requireAdmin }) => {
  const {
    isEnabled,
    user,
    isAuthenticated,
    isAdmin,
    isAuthorized
  } = useAuth();
  const navigate = useNavigate();

  // If authentication is disabled we will simply permit navigation to the provided component.
  if (!isEnabled)
    return (<Component />);

  const Page = withAuthenticationRequired(Component, {
    onRedirecting: () => (
      <Box sx={{ mt: 5 }}>
        <LoadingSpinner />
      </Box>
    )
  });

  // Yes, I know this is a bit weird, but it works so who cares.
  // First check if user is authenticated with Auth0, becuase if they are not routing them to the provided route component will redirect them to the login page.
  if (!isAuthenticated)
    return <Page />;
  else if (!user)
    return (
      <Box sx={{ mt: 5 }}>
        <LoadingSpinner />
      </Box>
    );
  // Now that we know the user is authenticated, we can ensure they have the valid permissions for the provided route.
  else if (!isAuthorized() || (requireAdmin && !isAdmin))
    return (
      <Box sx={{ pt: 2, textAlign: 'center' }}>
        <Typography variant="h6">
          You are not authorized to view this page
        </Typography>
        <Typography variant="subtitle1">
          Click the button below to navigate back to the home page
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Box>
    );
  else
    return <Page />;
}

export default AuthGuard;