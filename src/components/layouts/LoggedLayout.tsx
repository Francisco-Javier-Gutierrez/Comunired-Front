import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../../utils/UserStore";
import RequireAuthModal from "../modals/RequireAuthModal";

export type AuthContext = {
    isAuthenticated: boolean;
    email: string | null;
    name: string | null;
    picture: string | null;
};

export default function LoggedLayout() {
    const navigate = useNavigate();
    const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { tokens } = await fetchAuthSession();
                const idToken = tokens?.idToken;

                if (!idToken) {
                    setIsAuthenticated(false);
                    setShowModal(true);
                    return;
                }

                const payload = idToken.payload;

                setName((payload.name as string) ?? null);
                setEmail((payload.email as string) ?? null);
                setProfilePictureUrl((payload.picture as string) ?? null);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
                setShowModal(true);
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

    if (!isAuthenticated) {
        return (
            <RequireAuthModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    navigate("/");
                }}
                message="Esta página es exclusiva para usuarios registrados. Por favor inicia sesión para continuar."
            />
        );
    }

    return <Outlet context={authContext} />;
}
