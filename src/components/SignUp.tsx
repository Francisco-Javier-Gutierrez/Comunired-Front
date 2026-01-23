import { useState } from "react";
import { signUp, signInWithRedirect } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { goTo } from "../utils/globalVariables";

function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const setGlobalEmail = useUserData((state) => state.setEmail);
    const setGlobalName = useUserData((state) => state.setName);

    const [focusLogin, setFocusLogin] = useState<boolean | null>(null);
    const [isValidName, setIsValidName] = useState<boolean | null>(null);
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState<boolean | null>(null);
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

    const handleTogglePassword = () => setShowPassword(prev => !prev);

    const validateEmail = (): boolean => {
        if (!emailRegex.test(email)) {
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

    const signUpUser = async () => {
        setIsSendingForm(true);

        try {
            await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        name: username,
                    },
                },
            });

            setGlobalEmail(email);
            setGlobalName(username);

            setIsSendingForm(false);
            setIsValidName(null);
            setIsValidEmail(null);
            setIsValidPassword(null);
            setFocusLogin(false);

            setPasswordMessage("Ingrese una contraseña");
            setNameMessage("Ingrese un nombre de usuario");
            setEmailMessage("Ingrese su correo electrónico");

            setEmail("");
            setUsername("");
            setPassword("");

            goTo("/confirm-signup");
        } catch (error: any) {
            setIsSendingForm(false);

            switch (error.name) {
                case "UsernameExistsException":
                    setEmailMessage("Este usuario ya existe, prueba iniciar sesión");
                    setIsValidEmail(false);
                    setFocusLogin(true);
                    break;
                case "InvalidPasswordException":
                    setPasswordMessage("La contraseña no cumple la política de seguridad");
                    setIsValidPassword(false);
                    break;
                default:
                    console.error(error);
                    setEmailMessage("Error al registrar el usuario");
            }
        }
    };

    const signUpWithGoogle = async () => {
        try {
            await signInWithRedirect({ provider: "Google" });
        } catch (error) {
            console.error("Error al registrarse con Google:", error);
        }
    };

    const handleValidateForm = () => {
        const emailIsValid = validateEmail();
        const nameIsValid = validateName();
        const passwordIsValid = validatePassword();

        if (emailIsValid && nameIsValid && passwordIsValid) {
            signUpUser();
        }
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center m-5">Registrarse</h1>

            <div className="signUp-container w-50 mx-auto">
                <p className={`text-white ${isValidName === false ? "text-error" : ""}`}>
                    {nameMessage}
                </p>

                <input
                    className={`text-input w-100 mb-4 ${isValidName === false ? "input-error" : ""}`}
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (isValidName === false) {
                            setIsValidName(null);
                            setNameMessage("Ingrese un nombre de usuario");
                        }
                    }}
                />

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
                            setFocusLogin(false);
                            setEmailMessage("Ingrese su correo electrónico");
                        }
                    }}
                />

                <p className={`text-white ${isValidPassword === false ? "text-error" : ""}`}>
                    {passwordMessage}
                </p>

                <div className="position-relative mb-3">
                    <input
                        className={`text-input w-100 ${isValidPassword === false ? "input-error" : ""}`}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (isValidPassword === false) {
                                setIsValidPassword(null);
                                setPasswordMessage("Ingrese su contraseña");
                            }
                        }}
                    />

                    <img
                        className="position-absolute end-0 top-50 input-change-image translate-middle-y me-3 cursor-pointer"
                        src={!showPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleTogglePassword}
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

                <span>
                    <a
                        className={`text-white cursor-pointer ${focusLogin === true ? "text-error" : ""}`}
                        onClick={() => goTo("/login")}
                    >
                        ¿Ya tienes una cuenta?
                    </a>
                </span>

                <button className="white-button w-100 my-4" onClick={handleValidateForm}>
                    {!isSendingForm ? (
                        "Registrarse"
                    ) : (
                        <div className="d-flex justify-content-center">
                            <span>Registrándote...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <button className="white-button w-100 d-flex align-items-center justify-content-center" onClick={signUpWithGoogle}>
                    <img src="Google.svg" alt="Google" className="me-2" style={{ width: "20px" }} />
                    Registrarse con Google
                </button>
            </div>
        </div>
    );
}

export default SignUp;
