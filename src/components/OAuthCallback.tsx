import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";

function OAuthCallback() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { setEmail, setName, setProfilePictureUrl } = useUserData();

    useEffect(() => {
        let finished = false;

        const hydrateSession = async () => {
            try {
                const session = await fetchAuthSession({ forceRefresh: true });
                const idToken = session.tokens?.idToken;

                if (!idToken) throw new Error("No ID token");

                const claims = idToken.payload;

                const email = claims.email as string;
                const name =
                    (claims.name as string) ||
                    (claims.preferred_username as string) ||
                    "Usuario";

                const picture = (claims.picture as string) || null;

                setEmail(email);
                setName(name);
                setProfilePictureUrl(picture);

                try {
                    await axios.post(apiRoutes.create_user_url, {
                        Correo_electronico: email,
                        Nombre_usuario: name
                    });
                } catch (backendError: any) {
                    if (backendError?.response?.status !== 409) {
                        throw backendError;
                    }
                }

                finished = true;
                navigate("/");
            } catch (err) {
                console.error("OAuth hydration error:", err);
                setError("Error al iniciar sesión con Google. Por favor, intenta de nuevo.");
                setTimeout(() => navigate("/login"), 3000);
            }
        };

        hydrateSession();

        const unsubscribe = Hub.listen("auth", ({ payload }) => {
            if (payload.event === "signedIn" && !finished) {
                hydrateSession();
            }
        });

        return () => unsubscribe();
    }, [navigate, setEmail, setName, setProfilePictureUrl]);

    if (error) {
        return (
            <div className="home-container d-flex flex-column align-items-center justify-content-center">
                <h3 className="text-error text-center">{error}</h3>
                <p className="text-white">Redirigiendo a inicio de sesión...</p>
            </div>
        );
    }

    return (
        <div className="home-container d-flex flex-column align-items-center justify-content-center">
            <div className="big-loader"></div>
            <h3 className="text-white mt-4">Procesando inicio de sesión con Google...</h3>
        </div>
    );
}

export default OAuthCallback;
