import { useState } from "react";

function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isValidName, setIsValidName] = useState<boolean | null>(null);
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [nameMessage, setNameMessage] = useState("Ingrese un nombre de usuario");
    const [passwordMessage, setPasswordMessage] = useState("Ingrese una contraseña");
    const [emailMessage, setEmailMessage] = useState("Ingrese su correo electrónico");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const require = {
        length: password.length >= 8,
        mayuscula: /[A-Z]/.test(password),
        minuscula: /[a-z]/.test(password),
        numero: /\d/.test(password),
        especial: /[@$!%*?&._-]/.test(password),
    };

    const validateEmail = (): boolean => {
        if (!emailRegex.test(email ?? "")) {
            setEmailMessage("El correo no es válido");
            setIsValidEmail(false);
            return false;
        }
        setEmailMessage("Correo válido");
        setIsValidEmail(true);
        return true;
    };

    const validateName = (): boolean => {
        if (!username.trim()) {
            setNameMessage("No ha colocado un nombre de usuario");
            setIsValidName(false);
            return false;
        }
        setNameMessage("Nombre de usuario válido");
        setIsValidName(true);
        return true;
    };

    const validatePassword = (): boolean => {
        if (!Object.values(require).every(Boolean)) {
            setPasswordMessage("La contraseña no cumple los requisitos");
            setIsValidPassword(false);
            return false;
        }
        setPasswordMessage("Contraseña válida");
        setIsValidPassword(true);
        return true;
    };

    const signUp = () => {
        console.log("Registrado mi pana");
        setIsSendingForm(true);
        setTimeout(() => {
            setIsSendingForm(false);
            setIsValidName(null)
            setIsValidEmail(null);
            setIsValidPassword(null);
            setPasswordMessage("Ingrese una contraseña");
            setNameMessage("Ingrese un nombre de usuario");
            setEmailMessage("Ingrese su correo electrónico");
            setEmail("");
            setUsername("");
            setPassword("");
            window.location.href = "/profile";
        }, 1500);
    };

    const handleValidateForm = () => {
        const emailIsValid = validateEmail();
        const nameIsValid = validateName();
        const passwordIsValid = validatePassword();
        if (emailIsValid && nameIsValid && passwordIsValid) {
            signUp();
        }
    };

    return (
        <>
            <h1 className="text-white text-center m-5">Registrarse</h1>
            <div className="signUp-container w-50 mx-auto">
                <p className={`text-white ${isValidName === false ? "text-error" : ""}`}>{nameMessage}</p>
                <input className={`text-input w-100 mb-4 ${isValidName === false ? "input-error" : ""}`} type="text" value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (isValidName === false) {
                            setIsValidName(null);
                            setNameMessage("Ingrese un nombre de usuario");
                        }
                    }}
                />

                <p className={`text-white ${isValidEmail === false ? "text-error" : ""}`}>{emailMessage}</p>
                <input className={`text-input w-100 mb-4 ${isValidEmail === false ? "input-error" : ""}`} type="email" value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (isValidEmail === false) {
                            setIsValidEmail(null);
                            setEmailMessage("Ingrese su correo electrónico");
                        }
                    }}
                />

                <p className={`text-white ${isValidPassword === false ? "text-error" : ""}`}>{passwordMessage}</p>
                <input className={`text-input w-100 mb-3 ${isValidPassword === false ? "input-error" : ""}`} type="password" value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (isValidPassword === false) {
                            setIsValidPassword(null);
                            setPasswordMessage("Ingrese una contraseña");
                        }
                    }}
                />

                <div className="px-2 pb-2 mb-4 rounded no-select-no-click bg-dark text-white">
                    <p className="mb-2">La contraseña debe contener:</p>
                    <div className="d-flex flex-column">
                        <span className="form-check-span">
                            <input type="checkbox" className="form-check-input me-2" checked={require.length} readOnly />
                            Al menos 8 caracteres
                        </span>
                        <span className="form-check-span">
                            <input type="checkbox" className="form-check-input me-2" checked={require.mayuscula} readOnly />
                            Al menos una letra mayúscula
                        </span>
                        <span className="form-check-span">
                            <input type="checkbox" className="form-check-input me-2" checked={require.minuscula} readOnly />
                            Al menos una letra minúscula
                        </span>
                        <span className="form-check-span">
                            <input type="checkbox" className="form-check-input me-2" checked={require.numero} readOnly />
                            Al menos un número
                        </span>
                        <span className="form-check-span">
                            <input type="checkbox" className="form-check-input me-2" checked={require.especial} readOnly />
                            Al menos un carácter especial (@$!%*?&._-)
                        </span>
                    </div>
                </div>

                <span><a className="text-white" href="login">¿Ya tienes una cuenta?</a></span>

                <button className="white-button w-100 my-4" onClick={handleValidateForm}>
                    {!isSendingForm ? (
                        "Registrarse"
                    ) : (
                        <>
                            <span>Registrandote...</span>
                            <img className="loading ms-3" src="Loading.gif" alt="Cargando ..." />
                        </>
                    )}
                </button>
            </div>
        </>
    );
}

export default SignUp;
