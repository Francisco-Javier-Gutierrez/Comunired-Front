import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isUserAuthenticated } from "../utils/globalVariables";

export default function LoggedLayout() {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const auth = await isUserAuthenticated();
                setIsAuth(auth);
            } catch (err) {
                console.error("Error verificando autenticación:", err);
                setIsAuth(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuth === null) return null;

    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
