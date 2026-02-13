import { useState } from "react";
import { confirmSignIn, fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";

function VerifyMFA() {
    const navigate = useNavigate();
    const [totpCode, setTotpCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const {
        setEmail: setGlobalEmail,
        setName: setGlobalName,
        setProfilePictureUrl,
    } = useUserData();

    const handleVerifyCode = async () => {
        if (!totpCode.trim() || totpCode.length !== 6) {
            setError("Por favor, ingresa un código válido de 6 dígitos");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            await confirmSignIn({ challengeResponse: totpCode });

            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken;

            if (idToken) {
                const claims = idToken.payload;
                setGlobalEmail(claims.email as string);
                setGlobalName((claims.name as string) ?? "");
                setProfilePictureUrl(null);
            }

            navigate("/");
        } catch (err: any) {
            if (err.name === "CodeMismatchException") {
                setError("Código inválido. Por favor, verifica e intenta de nuevo.");
            } else if (err.name === "NotAuthorizedException") {
                setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError("Error al verificar el código. Intenta de nuevo.");
            }

            setIsVerifying(false);
        }
    };

    return (
        <div className={`${isVerifying ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Verificación de Dos Factores</h1>

            <div className="login-container w-50 mx-auto">
                <p className="text-white mb-4">
                    Abre tu aplicación de autenticación (Google Authenticator, Microsoft Authenticator, o Authy)
                    e ingresa el código de 6 dígitos que aparece.
                </p>

                {error && <p className="text-error mb-3">{error}</p>}

                <p className="text-white mb-2">Código de verificación</p>

                <input
                    className="text-input w-100 mb-4"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setTotpCode(value);
                        if (error) setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && totpCode.length === 6) {
                            handleVerifyCode();
                        }
                    }}
                    style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
                />

                <button
                    className="white-button w-100 mb-3"
                    onClick={handleVerifyCode}
                    disabled={isVerifying || totpCode.length !== 6}
                >
                    {!isVerifying ? (
                        "Verificar"
                    ) : (
                        <div className="d-flex justify-content-center">
                            <span>Verificando...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <button
                    className="white-button w-100"
                    onClick={() => navigate("/login")}
                >
                    Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
}

export default VerifyMFA;
