import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { updatePassword } from "aws-amplify/auth";
import type { AuthContext } from "./layouts/LoggedLayout";

function EditPassword() {
    const navigate = useNavigate();
    const authContext = useOutletContext<AuthContext>();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleToggleCurrentPassword = () => setShowCurrentPassword(prev => !prev);
    const handleToggleNewPassword = () => setShowNewPassword(prev => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

    const validateForm = (): boolean => {
        if (!currentPassword.trim()) {
            setErrorMessage("Ingresa tu contraseña actual");
            return false;
        }

        if (!newPassword.trim()) {
            setErrorMessage("Ingresa tu nueva contraseña");
            return false;
        }

        if (newPassword.length < 8) {
            setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres");
            return false;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return false;
        }

        if (currentPassword === newPassword) {
            setErrorMessage("La nueva contraseña debe ser diferente a la actual");
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!validateForm()) return;

        setIsSendingForm(true);

        try {
            await updatePassword({
                oldPassword: currentPassword,
                newPassword: newPassword,
            });

            setSuccessMessage("¡Contraseña actualizada correctamente!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/my-profile"), 1500);
        } catch (err: any) {
            console.error("Error cambiando contraseña:", err);

            if (err.name === "NotAuthorizedException") {
                setErrorMessage("La contraseña actual es incorrecta");
            } else if (err.name === "InvalidPasswordException") {
                setErrorMessage("La nueva contraseña no cumple los requisitos de seguridad");
            } else if (err.name === "LimitExceededException") {
                setErrorMessage("Demasiados intentos. Intenta más tarde");
            } else {
                setErrorMessage(err.message || "Error al cambiar la contraseña");
            }
        } finally {
            setIsSendingForm(false);
        }
    };

    if (authContext.isGoogleUser) {
        return (
            <div className="w-75 mx-auto d-flex flex-column min-dvh-100">
                <img
                    className="footer-image d-md-none cursor-pointer my-4"
                    src="Back.svg"
                    alt="Regresar"
                    onClick={() => navigate("/my-profile")}
                />
                <h1 className="text-white text-center mb-4">Cambiar contraseña</h1>
                <div className="text-center mt-5">
                    <p className="text-white fs-5">
                        Tu cuenta está vinculada con Google.
                    </p>
                    <p className="text-white">
                        Para cambiar tu contraseña, debes hacerlo desde tu cuenta de Google.
                    </p>
                    <button
                        className="white-button mt-4"
                        onClick={() => navigate("/my-profile")}
                    >
                        Volver a mi perfil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <div className="w-75 mx-auto d-flex flex-column min-dvh-100">
                <img
                    className="footer-image d-md-none cursor-pointer my-4"
                    src="Back.svg"
                    alt="Regresar"
                    onClick={() => navigate("/my-profile")}
                />

                <h1 className="text-white text-center mb-4">Cambiar mi contraseña</h1>

                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                <p className="text-white">Contraseña actual</p>
                <div className="position-relative d-flex align-items-center mb-4">
                    <input
                        className="text-input w-100"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                    />
                    <img
                        className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer"
                        src={!showCurrentPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleCurrentPassword}
                    />
                </div>

                <p className="text-white">Nueva contraseña</p>
                <div className="position-relative d-flex align-items-center mb-4">
                    <input
                        className="text-input w-100"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                    />
                    <img
                        className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer"
                        src={!showNewPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleNewPassword}
                    />
                </div>

                <p className="text-white">Confirmar nueva contraseña</p>
                <div className="position-relative d-flex align-items-center mb-4">
                    <input
                        className="text-input w-100"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                    />
                    <img
                        className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer"
                        src={!showConfirmPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleConfirmPassword}
                    />
                </div>

                <div className="publication-actions w-100 d-flex justify-content-end">
                    <button
                        className="white-button my-4"
                        onClick={handleChangePassword}
                        disabled={isSendingForm}
                    >
                        {!isSendingForm ? (
                            "Actualizar contraseña"
                        ) : (
                            <div className="d-flex justify-content-center">
                                <span>Actualizando...</span>
                                <div className="loader ms-3"></div>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditPassword;
