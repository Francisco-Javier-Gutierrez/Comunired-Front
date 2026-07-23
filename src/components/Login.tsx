import { useState } from "react";
import { signIn, fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Flex, Heading, Input, Spinner, Text, Link } from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import ConfirmModal from "./modals/ConfirmModal";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginFailedMessage, setLoginFailedMessage] = useState("");
    const [noticeMessage, setNoticeMessage] = useState((location.state as { notice?: string } | null)?.notice || "");
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [showUnconfirmedModal, setShowUnconfirmedModal] = useState(false);

    const {
        setEmail: setGlobalEmail,
        setName: setGlobalName,
        setRole: setGlobalRole,
        setProfilePictureUrl,
        resetUser,
    } = useUserData();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateForm = () => {
        const normalizedEmail = email.trim().toLowerCase();
        const emailIsValid = emailRegex.test(normalizedEmail);
        const passwordIsValid = password.trim().length > 0;

        setIsValidEmail(emailIsValid);
        setIsValidPassword(passwordIsValid);

        if (!emailIsValid) {
            setLoginFailedMessage("Ingresa un correo valido.");
            return false;
        }

        if (!passwordIsValid) {
            setLoginFailedMessage("Ingresa tu contrasena.");
            return false;
        }

        return true;
    };

    const login = async () => {
        if (!validateForm()) return;

        const normalizedEmail = email.trim().toLowerCase();
        setIsSendingForm(true);
        setLoginFailedMessage("");
        setNoticeMessage("");
        resetUser();

        try {
            const signInOutput = await signIn({
                username: normalizedEmail,
                password,
            });

            if (signInOutput.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
                navigate("/verify-mfa");
                return;
            }

            if (signInOutput.nextStep.signInStep === "CONFIRM_SIGN_UP") {
                setGlobalEmail(normalizedEmail);
                setShowUnconfirmedModal(true);
                setLoginFailedMessage("Confirma tu correo antes de iniciar sesion.");
                setIsSendingForm(false);
                return;
            }

            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken;
            const accessToken = session.tokens?.accessToken;

            if (!idToken || !accessToken) {
                throw new Error("No se pudieron obtener los tokens");
            }

            const claims = idToken.payload;
            const groups = claims["cognito:groups"] as string[] | undefined;
            const primaryRole = groups && groups.length > 0 ? groups[0] : "user";

            setGlobalEmail((claims.email as string) || normalizedEmail);
            setGlobalName((claims.name as string) ?? "");
            setGlobalRole(primaryRole === "moderators" ? "moderator" : primaryRole);
            setProfilePictureUrl(null);

            setEmail("");
            setPassword("");
            setIsValidEmail(null);
            setIsValidPassword(null);
            navigate("/");
        } catch (error: any) {
            switch (error.name) {
                case "NotAuthorizedException":
                    setLoginFailedMessage("Correo o contrasena incorrectos.");
                    break;
                case "PasswordResetRequiredException":
                    setLoginFailedMessage("Debes restablecer tu contrasena.");
                    break;
                case "UserNotConfirmedException":
                    setGlobalEmail(normalizedEmail);
                    setShowUnconfirmedModal(true);
                    setLoginFailedMessage("Confirma tu correo antes de iniciar sesion.");
                    break;
                default:
                    setLoginFailedMessage("No pudimos iniciar sesion. Intenta de nuevo.");
            }
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login();
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Box
                    className={`${isSendingForm ? "disabled-form no-select" : ""}`}
                    w={{ base: "90%", sm: "26rem" }}
                    mx="auto"
                    mt={{ base: 6, md: 10 }}
                    color="var(--text-color)"
                >
                    <Flex direction="column" gap={4}>
                        <Box textAlign="center">
                            <Heading as="h1" size="3xl" color="var(--text-color)">Iniciar sesion</Heading>
                            <Text mt={2} color="var(--muted-text)">Entra con tu cuenta de ComuniRed.</Text>
                        </Box>

                    {noticeMessage && (
                        <Box bg="rgba(34, 197, 94, 0.12)" border="1px solid rgba(34, 197, 94, 0.35)" color="var(--text-color)" borderRadius="0.75rem" px={4} py={3}>
                            {noticeMessage}
                        </Box>
                    )}

                    {loginFailedMessage && (
                        <Box bg="rgba(239, 68, 68, 0.12)" border="1px solid rgba(239, 68, 68, 0.35)" color="red.400" borderRadius="0.75rem" px={4} py={3}>
                            {loginFailedMessage}
                        </Box>
                    )}

                    <Box>
                        <Text mb={2} fontWeight="600" color={isValidEmail === false ? "red.400" : "var(--text-color)"}>
                            Correo electronico
                        </Text>
                        <Input
                            bg="var(--input-bg)"
                            border="solid 0.05rem"
                            borderColor={isValidEmail === false ? "red.500" : "var(--input-border)"}
                            borderRadius="1rem"
                            color="var(--text-color)"
                            _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (isValidEmail === false) setIsValidEmail(null);
                                if (loginFailedMessage) setLoginFailedMessage("");
                            }}
                        />
                    </Box>

                    <Box>
                        <Text mb={2} fontWeight="600" color={isValidPassword === false ? "red.400" : "var(--text-color)"}>
                            Contrasena
                        </Text>
                        <Box position="relative">
                            <Input
                                bg="var(--input-bg)"
                                border="solid 0.05rem"
                                borderColor={isValidPassword === false ? "red.500" : "var(--input-border)"}
                                borderRadius="1rem"
                                color="var(--text-color)"
                                pr="3rem"
                                _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (isValidPassword === false) setIsValidPassword(null);
                                    if (loginFailedMessage) setLoginFailedMessage("");
                                }}
                            />
                            <Button
                                type="button"
                                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                                position="absolute"
                                right="0.35rem"
                                top="50%"
                                transform="translateY(-50%)"
                                minW="2.25rem"
                                h="2.25rem"
                                p={0}
                                bg="transparent"
                                color="var(--text-color)"
                                _hover={{ bg: "var(--hover-bg)" }}
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </Button>
                        </Box>
                    </Box>

                    <Flex justify="space-between" gap={4} flexWrap="wrap" fontSize="sm">
                        <Link as="button" type="button" color="var(--text-color)" textDecoration="underline" onClick={() => navigate("/forgot-password")}>
                            Olvide mi contrasena
                        </Link>
                        <Link as="button" type="button" color="var(--text-color)" textDecoration="underline" onClick={() => navigate("/signUp")}>
                            Crear cuenta
                        </Link>
                    </Flex>

                    <Button
                        w="100%"
                        bg="var(--button-bg)"
                        color="var(--button-text)"
                        type="submit"
                        borderRadius="1rem"
                        disabled={isSendingForm}
                        _hover={{ bg: "var(--button-hover-bg)" }}
                    >
                        {!isSendingForm ? "Iniciar sesion" : (
                            <Flex justify="center" align="center">
                                <Text mr={3}>Autenticando...</Text>
                                <Spinner size="sm" />
                            </Flex>
                        )}
                    </Button>
                    </Flex>
                </Box>
            </form>

            <ConfirmModal
                isOpen={showUnconfirmedModal}
                title="Cuenta pendiente de verificacion"
                description="Te enviaremos un codigo para confirmar tu correo y activar tu cuenta."
                onConfirm={() => navigate("/confirm-signup", { state: { autoResend: true, email: email.trim().toLowerCase() } })}
                onCancel={() => setShowUnconfirmedModal(false)}
            />
        </>
    );
}

export default Login;
