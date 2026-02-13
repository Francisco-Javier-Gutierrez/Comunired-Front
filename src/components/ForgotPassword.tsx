import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "aws-amplify/auth";

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

    const sendRecoveryEmail = async () => {
        setIsSendingForm(true);
        setRequestMessage("");

        try {
            await resetPassword({ username: email });
            const savedEmail = email;
            setIsValidEmail(null);
            setEmailMessage("Ingrese su correo electrónico");
            setEmail("");
            navigate("/reset-password", { state: { Correo_electronico: savedEmail } });
        } catch (error: any) {
            console.error(error);
            if (error.name === "UserNotFoundException") {
                setRequestMessage("No existe una cuenta con este correo.");
                setIsValidEmail(false);
                setEmailMessage("El correo no existe");
            } else if (error.name === "LimitExceededException") {
                setRequestMessage("Demasiados intentos. Por favor intente más tarde.");
            } else {
                setRequestMessage("Ocurrió un error al enviar el correo.");
            }
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleValidateForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateEmail()) sendRecoveryEmail();
    };

    return (
        <form onSubmit={handleValidateForm} className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
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

                <button className="white-button w-100 my-4" type="submit">
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
        </form>
    );
}

export default ForgotPassword;
