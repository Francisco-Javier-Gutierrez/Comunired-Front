import { useState, useEffect } from "react";
import { setUpTOTP, verifyTOTPSetup, updateMFAPreference } from "aws-amplify/auth";

type TOTPSetupDetails = Awaited<ReturnType<typeof setUpTOTP>>;
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../utils/UserStore";

function SetupMFA() {
    const navigate = useNavigate();
    const { email } = useUserData();
    const [totpCode, setTotpCode] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [accountName, setAccountName] = useState(email ?? "Usuario");
    const [setupDetails, setSetupDetails] = useState<TOTPSetupDetails | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const setupTOTPAsync = async () => {
            try {
                const totpSetupDetails = await setUpTOTP();
                setSetupDetails(totpSetupDetails);
                setSecretKey(totpSetupDetails.sharedSecret);
                setIsLoading(false);
            } catch (err: any) {
                console.error("Error setting up TOTP:", err);
                setError("Error al configurar MFA. Por favor, intenta de nuevo.");
                setIsLoading(false);
            }
        };

        setupTOTPAsync();
    }, []);

    useEffect(() => {
        if (!setupDetails) return;
        const appName = "ComuniRed";
        const nameToUse = accountName.trim() || "Usuario";
        const url = setupDetails.getSetupUri(appName, nameToUse);
        setQrCodeUrl(url.href);
    }, [accountName, setupDetails]);

    const handleVerifyCode = async () => {
        if (!totpCode.trim() || totpCode.length !== 6) {
            setError("Por favor, ingresa un código válido de 6 dígitos");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            await verifyTOTPSetup({ code: totpCode });
            await updateMFAPreference({ totp: "PREFERRED" });

            setIsSuccess(true);
            setTimeout(() => {
                navigate("/my-profile");
            }, 2000);
        } catch (err: any) {
            console.error("Error verifying TOTP:", err);
            setError("Código inválido. Por favor, verifica e intenta de nuevo.");
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="home-container d-flex flex-column align-items-center justify-content-center">
                <div className="big-loader"></div>
                <h3 className="text-white mt-4">Configurando MFA...</h3>
            </div>
        );
    }

    return (
        <div className={`${isVerifying ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Configurar Autenticación de Dos Factores (MFA)</h1>

            <div className="login-container w-50 mx-auto">
                <div className="mb-4">
                    <h4 className="text-white mb-3">Paso 1: Configura el identificador (Opcional)</h4>
                    <p className="text-white mb-2">Este nombre aparecerá en tu aplicación de autenticación:</p>
                    <input
                        className="text-input w-100 mb-3"
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Ej: juan@comunired.com"
                    />

                    <h4 className="text-white mb-3">Paso 2: Escanea el código QR</h4>
                    <p className="text-white mb-3">
                        Usa una aplicación de autenticación como Google Authenticator, Microsoft Authenticator o Authy
                        para escanear el siguiente código QR:
                    </p>

                    {qrCodeUrl && (
                        <div className="d-flex justify-content-center mb-3 bg-white p-3 rounded">
                            <QRCodeSVG value={qrCodeUrl} size={200} />
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <h4 className="text-white mb-3">Paso 3: Clave de configuración manual (opcional)</h4>
                    <p className="text-white mb-2">
                        Si no puedes escanear el código QR, ingresa esta clave manualmente en tu aplicación:
                    </p>
                    <div className="bg-dark text-white p-3 rounded text-center">
                        <code style={{ fontSize: "16px", letterSpacing: "2px" }}>{secretKey}</code>
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-white mb-3">Paso 4: Verifica el código</h4>
                    <p className="text-white mb-3">
                        Ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación:
                    </p>

                    {error && <p className="text-error mb-3">{error}</p>}
                    {isSuccess && <p className="text-success mb-3 text-center fw-bold">¡MFA configurado exitosamente!</p>}

                    <input
                        className="text-input w-100 mb-3"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setTotpCode(value);
                            if (error) setError("");
                        }}
                        style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }}
                    />
                </div>

                <button
                    className="white-button w-100 mb-3"
                    onClick={handleVerifyCode}
                    disabled={isVerifying || totpCode.length !== 6 || isSuccess}
                >
                    {isSuccess ? (
                        "¡Éxito! Redirigiendo..."
                    ) : !isVerifying ? (
                        "Verificar y Activar MFA"
                    ) : (
                        <div className="d-flex justify-content-center">
                            <span>Verificando...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <button
                    className="white-button w-100"
                    onClick={() => navigate("/my-profile")}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default SetupMFA;
