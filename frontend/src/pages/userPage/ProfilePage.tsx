import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import UserPage from "./UserPage";
import { Box } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { isEnabled, user, getAccessTokenSilently } = useAuth();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (isEnabled)
        setToken(await getAccessTokenSilently());
        queryClient.setQueryData(
          ['user', user?.entityId],
          user
        );
    })();
  }, [getAccessTokenSilently, isEnabled, user, queryClient]);

  return (
    <>
      <UserPage userId={user?.entityId} />
      <Box sx={{
        overflow: 'hidden'
      }}>
        {token}
      </Box>
    </>
  );
}

export default ProfilePage;