import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState<boolean | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [passwordMessage, setPasswordMessage] = useState("Ingrese su contraseña");
    const [emailMessage, setEmailMessage] = useState("Ingrese su correo electrónico");

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

    const validatePassword = (): boolean => {
        if (!password.trim()) {
            setPasswordMessage("No ha ingresado su contraseña");
            setIsValidPassword(false);
            return false;
        }
        setPasswordMessage("Enviando contraseña...");
        setIsValidPassword(true);
        return true;
    };

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const signUp = () => {
        console.log("Registrado mi pana");
        setIsSendingForm(true);
        setTimeout(() => {
            setIsSendingForm(false);
            setIsValidEmail(null);
            setIsValidPassword(null);
            setEmailMessage("Ingrese su correo electrónico");
            setPasswordMessage("Ingrese su contraseña");
            setEmail("");
            setPassword("");
            window.location.href = "/";
        }, 1500);
    };

    const handleValidateForm = () => {
        const emailIsValid = validateEmail();
        const passwordIsValid = validatePassword();
        if (emailIsValid && passwordIsValid) signUp();
    };

    return (
        <>
            <h1 className="text-white text-center mb-5">Iniciar sesión</h1>
            <div className="login-container w-50 mx-auto">
                <p className={`text-white ${isValidEmail === false ? "text-error" : ""}`}>{emailMessage}</p>
                <input className={`text-input w-100 mb-4 ${isValidEmail === false ? "input-error" : ""}`} type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (isValidEmail === false) { setIsValidEmail(null); setEmailMessage("Ingrese su correo electrónico"); } }} />

                <p className={`text-white ${isValidPassword === false ? "text-error" : ""}`}>{passwordMessage}</p>
                <div className="position-relative mb-3">
                    <input className={`text-input w-100 ${isValidPassword === false ? "input-error" : ""}`}
                        type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => { setPassword(e.target.value); if (isValidPassword === false) { setIsValidPassword(null); setPasswordMessage("Ingrese su contraseña"); } }} />
                    <img className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer" src={!showPassword ? "Text.svg" : "Password.svg"} alt="Mostrar u ocultar contraseña" onClick={handleTogglePassword} />
                </div>

                <span className="text-white">¿Todavía no tienes una cuenta? <a className="text-white" href="signUp">Regístrate aquí</a></span>

                <button className="white-button w-100 my-4" onClick={handleValidateForm}>
                    {!isSendingForm ? "Iniciar sesión" : (<><span>Autenticando...</span><img className="loading ms-3" src="Loading.gif" alt="Cargando ..." /></>)}
                </button>
            </div>
        </>
    );
}

export default Login;
