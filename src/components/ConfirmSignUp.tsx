import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../utils/UserStore";
import { confirmSignUp } from "aws-amplify/auth";

function ConfirmSignUp() {
    const [code, setCode] = useState("");
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [isValidCode, setIsValidCode] = useState<boolean | null>(null);

    const navigate = useNavigate();

    const Correo_electronico = useUserData.getState().email;

    const validateCode = (): boolean => {
        if (!/^\d{6}$/.test(code)) {
            setRequestMessage("El código debe tener 6 dígitos");
            setIsValidCode(false);
            return false;
        }
        setIsValidCode(true);
        return true;
    };

    const sendCode = async () => {
        if (!validateCode()) return;

        if (!Correo_electronico) {
            setRequestMessage("No se encontró el correo. Regístrate de nuevo.");
            return;
        }

        setIsSendingForm(true);
        setRequestMessage("");

        try {
            await confirmSignUp({
                username: Correo_electronico,
                confirmationCode: code,
            });

            setRequestMessage("Cuenta confirmada correctamente");
            navigate("/login");
        } catch (error: any) {
            switch (error.name) {
                case "CodeMismatchException":
                    setRequestMessage("El código ingresado es incorrecto");
                    setIsValidCode(false);
                    break;
                case "ExpiredCodeException":
                    setRequestMessage("El código ha expirado");
                    break;
                case "UserNotFoundException":
                    setRequestMessage("Usuario no encontrado");
                    break;
                default:
                    console.error(error);
                    setRequestMessage("Ocurrió un error al verificar el código");
            }
        } finally {
            setIsSendingForm(false);
        }
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Verificar código</h1>

            {requestMessage && (
                <h3 className={`text-center mb-4 ${isValidCode === false ? "text-error" : "text-warning"}`}>
                    {requestMessage}
                </h3>
            )}

            <div className="login-container w-50 mx-auto">
                <input
                    className={`text-input w-100 mb-4 ${isValidCode === false ? "input-error" : ""}`}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ingresa tu código de 6 dígitos"
                />

                <button className="white-button w-100 my-4" onClick={sendCode}>
                    {!isSendingForm ? "Verificar código" : (
                        <div className="d-flex justify-content-center">
                            <span>Verificando...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <span className="text-white d-block mt-3 cursor-pointer">
                    ¿No recibiste el código?{" "}
                    <a className="text-white" onClick={() => navigate("/signUp")}>
                        Volver a registrarse
                    </a>
                </span>
            </div>
        </div>
    );
}

export default ConfirmSignUp;
