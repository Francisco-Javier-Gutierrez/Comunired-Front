import axios from "axios";
import { useState, useEffect } from "react";
import { BackendApi } from "../utils/globalVariables";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { Correo_electronico } = location.state || {};

    const [email, setEmail] = useState(() => Correo_electronico || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [passwordMessage, setPasswordMessage] = useState("Ingrese su nueva contraseña");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
        if (password.length < 6) {
            setPasswordMessage("La contraseña debe tener al menos 6 caracteres");
            setIsValidPassword(false);
            return false;
        }
        setIsValidPassword(true);
        return true;
    };

    const handleTogglePassword = () => setShowPassword(prev => !prev);
    const handleToggleConfirm = () => setShowConfirm(prev => !prev);

    const resetPassword = () => {
        if (!validatePasswords()) return;
        if (!email) return setRequestMessage("No se recibió el correo correctamente.");

        setIsSendingForm(true);
        setRequestMessage("");

        axios.post(BackendApi.reset_password_url, { Correo_electronico: email, Nueva_contrasena: password })
            .then(() => {
                setRequestMessage("Contraseña restablecida correctamente");
                setPassword("");
                setConfirmPassword("");
                setIsValidPassword(null);
                navigate("/login");
            })
            .catch(error => {
                const backendError = error.response?.data?.error;
                if (backendError) {
                    setRequestMessage(backendError);
                } else {
                    setRequestMessage("Ocurrió un error al restablecer la contraseña");
                }
                setIsValidPassword(false);
            })
            .finally(() => setIsSendingForm(false));
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Restablecer contraseña</h1>
            <h3 className="text-warning text-center mb-4">{requestMessage}</h3>

            <div className="login-container w-50 mx-auto">
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

                <button className="white-button w-100 my-4" onClick={resetPassword}>
                    {!isSendingForm ? "Restablecer contraseña" : (
                        <div className="d-flex justify-content-center">
                            <span>Procesando...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

export default ResetPassword;
