import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmResetPassword, resetPassword } from "aws-amplify/auth";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { Correo_electronico } = location.state || {};

    const [email, setEmail] = useState(() => Correo_electronico || "");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [passwordMessage, setPasswordMessage] = useState("Ingrese su nueva contraseña");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const require = {
        length: password.length >= 8,
        mayuscula: /[A-Z]/.test(password),
        minuscula: /[a-z]/.test(password),
        numero: /\d/.test(password),
        especial: /[@$!%*?&._-]/.test(password),
    };

    useEffect(() => {
        if (!Correo_electronico) {
            setRequestMessage("No se encontró información válida. Intenta de nuevo.");
        } else {
            setEmail(Correo_electronico);
        }
    }, [Correo_electronico]);

    const validatePasswords = (): boolean => {
        if (!password.trim() || !confirmPassword.trim()) {
            setPasswordMessage("Debe ingresar ambas contraseñas");
            setIsValidPassword(false);
            return false;
        }
        if (password !== confirmPassword) {
            setPasswordMessage("Las contraseñas no coinciden");
            setIsValidPassword(false);
            return false;
        }
        if (!Object.values(require).every(Boolean)) {
            setPasswordMessage("La contraseña no cumple los requisitos");
            setIsValidPassword(false);
            return false;
        }
        setIsValidPassword(true);
        return true;
    };

    const handleTogglePassword = () => setShowPassword(prev => !prev);
    const handleToggleConfirm = () => setShowConfirm(prev => !prev);

    const handleResetPassword = async () => {
        if (!validatePasswords()) return;
        if (!email) return setRequestMessage("No se recibió el correo correctamente.");
        if (!confirmationCode) return setRequestMessage("Ingrese el código de verificación.");

        setIsSendingForm(true);
        setRequestMessage("");

        try {
            await confirmResetPassword({
                username: email,
                confirmationCode,
                newPassword: password
            });
            setRequestMessage("Contraseña restablecida correctamente");
            setPassword("");
            setConfirmPassword("");
            setConfirmationCode("");
            setIsValidPassword(null);
            navigate("/login");
        } catch (error: any) {
            console.error(error);
            if (error.name === "CodeMismatchException") {
                setRequestMessage("El código ingresado es incorrecto.");
            } else if (error.name === "ExpiredCodeException") {
                setRequestMessage("El código ha expirado. Solicite uno nuevo.");
            } else if (error.name === "LimitExceededException") {
                setRequestMessage("Demasiados intentos. Intente más tarde.");
            } else {
                setRequestMessage("Ocurrió un error al restablecer la contraseña.");
            }
            setIsValidPassword(false);
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) return setRequestMessage("No se encontró el correo para reenviar el código.");

        setRequestMessage("Reenviando código...");
        try {
            await resetPassword({ username: email });
            setRequestMessage("Código reenviado correctamente. Revisa tu correo.");
        } catch (error: any) {
            console.error(error);
            if (error.name === "LimitExceededException") {
                setRequestMessage("Demasiados intentos. Intente más tarde.");
            } else {
                setRequestMessage("Error al reenviar el código.");
            }
        }
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Restablecer contraseña</h1>
            <h3 className="text-warning text-center mb-4">{requestMessage}</h3>

            <div className="login-container w-50 mx-auto">
                <input
                    className="text-input w-100 mb-4"
                    type="text"
                    value={confirmationCode}
                    placeholder="Código de verificación"
                    onChange={e => setConfirmationCode(e.target.value)}
                />

                <p className={`text-white ${isValidPassword === false ? "text-error" : ""}`}>{passwordMessage}</p>

                <div className="position-relative mb-4">
                    <input
                        className={`text-input w-100 ${isValidPassword === false ? "input-error" : ""}`}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Nueva contraseña"
                        onChange={e => setPassword(e.target.value)}
                    />
                    <img
                        className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer"
                        src={!showPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleTogglePassword}
                    />
                </div>

                <div className="position-relative mb-4">
                    <input
                        className={`text-input w-100 ${isValidPassword === false ? "input-error" : ""}`}
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        placeholder="Confirmar nueva contraseña"
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <img
                        className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer"
                        src={!showConfirm ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleConfirm}
                    />
                </div>

                <div className="px-2 pb-2 mb-4 rounded no-select-no-click bg-dark text-white">
                    <p className="mb-2">La contraseña debe contener:</p>

                    <div className="d-flex flex-column">
                        <span>
                            <input type="checkbox" className="form-check-input me-2" checked={require.length} readOnly /> Al menos 8 caracteres
                        </span>
                        <span>
                            <input type="checkbox" className="form-check-input me-2" checked={require.mayuscula} readOnly /> Al menos una letra mayúscula
                        </span>
                        <span>
                            <input type="checkbox" className="form-check-input me-2" checked={require.minuscula} readOnly /> Al menos una letra minúscula
                        </span>
                        <span>
                            <input type="checkbox" className="form-check-input me-2" checked={require.numero} readOnly /> Al menos un número
                        </span>
                        <span>
                            <input type="checkbox" className="form-check-input me-2" checked={require.especial} readOnly /> Al menos un carácter especial (@$!%*?&._-)
                        </span>
                    </div>
                </div>

                <button className="white-button w-100 my-4" onClick={handleResetPassword}>
                    {!isSendingForm ? "Restablecer contraseña" : (
                        <div className="d-flex justify-content-center">
                            <span>Procesando...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <div className="d-flex justify-content-between">
                    <span
                        className="text-white cursor-pointer text-decoration-underline"
                        onClick={() => navigate("/forgot-password")}
                    >
                        Volver
                    </span>

                    <span
                        className="text-white cursor-pointer text-decoration-underline"
                        onClick={handleResendCode}
                    >
                        Reenviar código
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
