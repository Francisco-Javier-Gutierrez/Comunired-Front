import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../../utils/UserStore";

export type AuthContext = {
    isAuthenticated: boolean;
    isGoogleUser: boolean;
    email: string | null;
    name: string | null;
    picture: string | null;
};

export default function LoggedLayout() {
    const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
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

                const username = payload["cognito:username"] as string | undefined;

                type CognitoIdentity = {
                    providerName?: string;
                };

                const identities = payload.identities as CognitoIdentity[] | undefined;

                const isGoogleUserCheck =
                    identities?.[0]?.providerName === "Google" ||
                    (username?.startsWith("google_") ?? false);

                setName((payload.name as string) ?? null);
                setEmail((payload.email as string) ?? null);
                setProfilePictureUrl((payload.picture as string) ?? null);
                setIsAuthenticated(true);
                setIsGoogleUser(isGoogleUserCheck);
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
        isGoogleUser,
        email,
        name,
        picture: profilePictureUrl,
    };

    return isAuthenticated ? <Outlet context={authContext} /> : <Navigate to="/login" replace />;
}
