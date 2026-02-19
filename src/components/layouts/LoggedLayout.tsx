import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../../utils/UserStore";

export type AuthContext = {
    isAuthenticated: boolean;
    email: string | null;
    name: string | null;
    picture: string | null;
};

export default function LoggedLayout() {
    const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { tokens } = await fetchAuthSession();
                const idToken = tokens?.idToken;

                if (!idToken) {
                    setIsAuthenticated(false);
                    return;
                }

                const payload = idToken.payload;

                setName((payload.name as string) ?? null);
                setEmail((payload.email as string) ?? null);
                setProfilePictureUrl((payload.picture as string) ?? null);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) return null;

    const authContext: AuthContext = {
        isAuthenticated,
        email,
        name,
        picture: profilePictureUrl,
    };

    return isAuthenticated ? <Outlet context={authContext} /> : <Navigate to="/login" replace />;
}
