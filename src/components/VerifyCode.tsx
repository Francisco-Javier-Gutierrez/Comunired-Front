import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackendApi } from "../utils/globalVariables";

function VerifyCode() {
    const [code, setCode] = useState("");
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [isValidCode, setIsValidCode] = useState<boolean | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { hash, Correo_electronico } = location.state || {};

    const validateCode = (): boolean => {
        if (!/^\d{6}$/.test(code)) {
            setRequestMessage("El código debe tener 6 dígitos");
            setIsValidCode(false);
            return false;
        }
        setIsValidCode(true);
        return true;
    };

    const sendCode = () => {
        if (!validateCode()) return;
        if (!hash) {
            setRequestMessage("No se encontró el hash. Intenta de nuevo.");
            return;
        }

        setIsSendingForm(true);
        setRequestMessage("");

        axios.post(BackendApi.verify_code_url, { codigo: code, hash: hash })
            .then(() => {
                setRequestMessage("Código verificado correctamente");
                navigate("/reset-password", { state: { Correo_electronico } });
            })
            .catch(error => {
                const backendError = error.response?.data?.error;
                if (backendError === "Código incorrecto") {
                    setRequestMessage("El código ingresado es incorrecto");
                    setIsValidCode(false);
                } else {
                    setRequestMessage("Ocurrió un error al verificar el código");
                }
            })
            .finally(() => {
                setIsSendingForm(false);
            });
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Verificar código</h1>

            <h3 className="text-warning text-center mb-4">{requestMessage}</h3>

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
                    <a className="text-white" onClick={() => navigate("/forgot-password")}>
                        Reenviar
                    </a>
                </span>
            </div>
        </div>
    );
}

export default VerifyCode;
