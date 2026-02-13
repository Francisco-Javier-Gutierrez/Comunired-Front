import { useState } from "react";
import { signIn, fetchAuthSession, signInWithRedirect } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailedMessage, setLoginFailedMessage] = useState("");
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState<boolean | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [passwordMessage, setPasswordMessage] = useState("Ingrese su contraseña");
    const [emailMessage, setEmailMessage] = useState("Ingrese su correo electrónico");

    const {
        setEmail: setGlobalEmail,
        setName: setGlobalName,
        setProfilePictureUrl,
    } = useUserData();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = (): boolean => {
        if (!emailRegex.test(email)) {
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

    const login = async () => {
        setIsSendingForm(true);

        try {
            const signInOutput = await signIn({
                username: email,
                password: password,
            });

            if (signInOutput.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
                navigate("/verify-mfa");
                return;
            }

            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken;
            const accessToken = session.tokens?.accessToken;

            if (!idToken || !accessToken) {
                throw new Error("No se pudieron obtener los tokens");
            }

            const claims = idToken.payload;

            setGlobalEmail(claims.email as string);
            setGlobalName((claims.name as string) ?? "");

            setProfilePictureUrl(null);

            setIsSendingForm(false);
            setIsValidEmail(null);
            setIsValidPassword(null);
            setPasswordMessage("Ingrese una contraseña");
            setEmailMessage("Ingrese su correo electrónico");
            setLoginFailedMessage("");
            setEmail("");
            setPassword("");

            navigate("/");

        } catch (error: any) {
            setIsSendingForm(false);

            switch (error.name) {
                case "NotAuthorizedException":
                    setLoginFailedMessage("Correo o contraseña incorrectos");
                    break;

                case "UserNotConfirmedException":
                    setLoginFailedMessage("Debes confirmar tu correo");
                    break;

                case "PasswordResetRequiredException":
                    setLoginFailedMessage("Debes restablecer tu contraseña");
                    break;

                default:
                    setLoginFailedMessage("Error al iniciar sesión");
                    console.error(error);
            }
        }
    };

    const loginWithGoogle = async () => {
        try {
            await signInWithRedirect({ provider: "Google" });
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
            setLoginFailedMessage("Error al iniciar sesión con Google");
        }
    };

    const handleValidateForm = () => {
        const emailIsValid = validateEmail();
        const passwordIsValid = validatePassword();
        if (emailIsValid && passwordIsValid) login();
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <h1 className="text-white text-center mb-5">Iniciar sesión</h1>
            <h3 className="text-error text-center mb-5">{loginFailedMessage}</h3>

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

                <p className={`text-white ${isValidPassword === false ? "text-error" : ""}`}>
                    {passwordMessage}
                </p>

                <div className="position-relative mb-4">
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

                <span className="text-white d-block mb-3">
                    ¿Olvidaste tu contraseña?{" "}
                    <a className="text-white cursor-pointer" onClick={() => navigate("/forgot-password")}>
                        ¡Recupérala!
                    </a>
                </span>

                <span className="text-white">
                    ¿Todavía no tienes una cuenta?{" "}
                    <a className="text-white cursor-pointer" onClick={() => navigate("/signUp")}>
                        Regístrate aquí
                    </a>
                </span>

                <button className="white-button w-100 my-4" onClick={handleValidateForm}>
                    {!isSendingForm ? (
                        "Iniciar sesión"
                    ) : (
                        <div className="d-flex justify-content-center">
                            <span>Autenticándote...</span>
                            <div className="loader ms-3"></div>
                        </div>
                    )}
                </button>

                <button className="white-button w-100 d-flex align-items-center justify-content-center" onClick={loginWithGoogle}>
                    <img src="Google.svg" alt="Google" className="me-2" style={{ width: "20px" }} />
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    );
}

export default Login;
