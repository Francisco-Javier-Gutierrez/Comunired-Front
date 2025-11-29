import { useState, useEffect } from "react";
import { goTo } from "../utils/globalVariables";
import { BackendApi } from "../utils/globalVariables";
import axios from "axios";

function EditPassword() {

    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url, {}, { withCredentials: true })
            .catch(() => {
                goTo("/login");
            });
    }, []);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState<boolean | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const [isValidNewPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [currentPasswordMessage, setCurrentPasswordMessage] = useState("Ingrese su contraseña actual");
    const [newPasswordMessage, setNewPasswordMessage] = useState("Ingrese su nueva contraseña");
    const [isValidCurrentPassword, setIsValidCurrentPassword] = useState<boolean | null>(null);

    const validateNewPassword = (): boolean => {
        if (!newPassword.trim()) {
            setNewPasswordMessage("No ha ingresado su contraseña");
            setIsValidPassword(false);
            return false;
        }
        setNewPasswordMessage("Enviando contraseña...");
        setIsValidPassword(true);
        return true;
    };

    const validateCurrentPassword = (): boolean => {
        if (!currentPassword.trim()) {
            setCurrentPasswordMessage("No ha ingresado su contraseña");
            setIsValidPassword(false);
            return false;
        }
        setCurrentPasswordMessage("Enviando contraseña...");
        setIsValidPassword(true);
        return true;
    };

    const handleToggleCurrentPassword = () => {
        setShowCurrentPassword(prev => !prev);
    };

    const handleToggleNewPassword = () => {
        setShowNewPassword(prev => !prev);
    };

    const editPassword = async () => {
        const user = {
            Contrasena_actual: currentPassword,
            Contrasena_nueva: newPassword
        }
        setIsSendingForm(true);
        await axios.post(BackendApi.edit_password_url, user, {
            withCredentials: true
        })
            .then(() => {
                setIsValidCurrentPassword(null);
                setIsValidPassword(null);
                setCurrentPassword("Ingrese su contraseña actual");
                setNewPassword("Ingrese su nueva contraseña");
                setCurrentPassword("");
                setNewPassword("");
                goTo("/my-profile");
            }).finally(() => {
                setIsSendingForm(false);
            });
    };

    const handleValidateForm = () => {
        const newPasswordIsValid = validateNewPassword();
        const currentPasswordIsValid = validateCurrentPassword();
        newPasswordIsValid && currentPasswordIsValid && editPassword();
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <div className="w-75 mx-auto d-flex flex-column min-vh-100">
                <img className="footer-image d-md-none cursor-pointer my-4"
                    src="Back.svg" alt="Regresar"
                    onClick={() => goTo("/home")}
                />

                <h1 className="text-white text-center mb-4">Actualizar mis datos</h1>

                <p className={`text-white ${isValidCurrentPassword === false ? "text-error" : ""}`}>{currentPasswordMessage}</p>
                <div className="position-relative d-flex align-items-center mb-4">
                    <input className={`text-input w-100 ${isValidCurrentPassword === false ? "input-error" : ""}`}
                        type={showCurrentPassword ? "text" : "password"} value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); if (isValidCurrentPassword === false) { setIsValidCurrentPassword(null); setCurrentPasswordMessage("Ingrese su contraseña actual"); } }} />

                    <img className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer" src={!showCurrentPassword ? "Text.svg" : "Password.svg"} alt="Mostrar u ocultar contraseña" onClick={handleToggleCurrentPassword} />
                </div>

                <p className={`text-white ${isValidNewPassword === false ? "text-error" : ""}`}>{newPasswordMessage}</p>
                <div className="position-relative mb-4">
                    <input className={`text-input w-100 ${isValidNewPassword === false ? "input-error" : ""}`}
                        type={showNewPassword ? "text" : "password"} value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); if (isValidNewPassword === false) { setIsValidPassword(null); setNewPasswordMessage("Ingrese su nueva contraseña"); } }} />
                    <img className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer" src={!showNewPassword ? "Text.svg" : "Password.svg"} alt="Mostrar u ocultar contraseña" onClick={handleToggleNewPassword} />
                </div>

                <div className="publication-actions nav-bar w-100 d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                    </div>
                    <div className="w-50 text-end">
                        <button className="white-button w-100 my-4" onClick={handleValidateForm}>
                            {!isSendingForm ? "Actualizar contraseña" : (<div className="d-flex justify-content-center"><span>Actualizando...</span><div className="loader ms-3"></div></div>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditPassword;
