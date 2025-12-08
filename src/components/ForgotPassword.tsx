import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackendApi } from "../utils/globalVariables";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [emailMessage, setEmailMessage] = useState("Ingrese su correo electrónico");
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const [requestMessage, setRequestMessage] = useState("");

    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = (): boolean => {
        if (!emailRegex.test(email ?? "")) {
            setEmailMessage("El correo no es válido");
            setIsValidEmail(false);
            return false;
        }
        setEmailMessage("Enviando correo...");
        setIsValidEmail(true);
        return true;
    };

    const sendRecoveryEmail = () => {
        setIsSendingForm(true);
        setRequestMessage("");

        axios.post(BackendApi.forgot_password_url, { Correo_electronico: email})
            .then(res => {
                setIsValidEmail(null);
                setEmailMessage("Ingrese su correo electrónico");
                setEmail("");
                navigate("/verify-code", { state: { hash: res.data.hash, Correo_electronico: email } });
            })
            .catch(error => {
                const backendError = error.response?.data?.error;

                if (backendError === "El usuario no existe") {
                    setRequestMessage("No existe una cuenta con este correo.");
                    setIsValidEmail(false);
                    setEmailMessage("El correo no existe");
                } else {
                    setRequestMessage("Ocurrió un error al enviar el correo.");
                }
            })
            .finally(() => {
                setIsSendingForm(false);
            });
    };

    const handleValidateForm = () => {
        if (validateEmail()) sendRecoveryEmail();
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Recuperar contraseña</h1>

            <h3 className="text-warning text-center mb-4">{requestMessage}</h3>

            <div className="login-container w-50 mx-auto">

                <p className={`text-white ${isValidEmail === false ? "text-error" : ""}`}>
                    {emailMessage}
                </p>

                <input
                    className={`text-input w-100 mb-4 ${isValidEmail === false ? "input-error" : ""}`}
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);

                        if (isValidEmail === false) {
                            setIsValidEmail(null);
                            setEmailMessage("Ingrese su correo electrónico");
                        }
                    }}
                />

                <button className="white-button w-100 my-4" onClick={handleValidateForm}>
                    {!isSendingForm ? "Enviar código" : (
                        <div className="d-flex justify-content-center">
                            <span>Enviando correo...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <span className="text-white d-block mt-3 cursor-pointer">
                    ¿Recordaste tu contraseña?{" "}
                    <a className="text-white" onClick={() => navigate("/login")}>
                        Volver al inicio de sesión
                    </a>
                </span>
            </div>
        </div>
    );
}

export default ForgotPassword;
