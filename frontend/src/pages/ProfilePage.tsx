import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import UserPage from "./userPage/UserPage";

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
            <p>{token}</p>
        </>
    );
}

export default ProfilePage;