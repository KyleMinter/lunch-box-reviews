import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import UserPage from "./userPage/UserPage";
import { Box } from "@mui/material";

const ProfilePage = () => {
    const { isEnabled, user, getAccessTokenSilently } = useAuth();
    const [token, setToken] = useState<string>('');
    
    useEffect(() => {
        (async () => {
            if (isEnabled)
                setToken(await getAccessTokenSilently());
        })();
    }, [getAccessTokenSilently, isEnabled]);

    return (
        <>
            <UserPage user={user!}/>
            <Box sx={{
              overflow: 'hidden'
            }}>
              {token}
            </Box>
        </>
    );
}

export default ProfilePage;