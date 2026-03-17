import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "../utils/UserStore";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { Box, Heading, Input, Button, Spinner, Text, Flex } from "@chakra-ui/react";

function ConfirmSignUp() {
    const [code, setCode] = useState("");
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [isValidCode, setIsValidCode] = useState<boolean | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

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
                    setRequestMessage("Ocurrió un error al verificar el código");
            }
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleResendCode = useCallback(async () => {
        if (!Correo_electronico) {
            setRequestMessage("No se encontró el correo. Regístrate de nuevo.");
            return;
        }

        setIsResending(true);
        setRequestMessage("");

        try {
            await resendSignUpCode({ username: Correo_electronico });
            setRequestMessage("Se ha enviado un nuevo código a tu correo");
            setIsValidCode(null);
        } catch (error: any) {
            setRequestMessage("Error al reenviar el código. Inténtalo más tarde.");
        } finally {
            setIsResending(false);
        }
    }, [Correo_electronico]);

    useEffect(() => {
        if (location.state?.autoResend && Correo_electronico) {
            handleResendCode();
            window.history.replaceState({}, document.title);
        }
    }, [location.state, Correo_electronico, handleResendCode]);

    return (
        <Box
            className={`${isSendingForm ? "disabled-form" : ""}`}
            userSelect="none"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            color="white"
            mt={10}
        >

            <Flex w={{ base: "90%", md: "50%" }} mb={2}>
                <Text
                    color="#aaa"
                    cursor="pointer"
                    fontWeight="600"
                    onClick={() => navigate("/login")}
                    _hover={{ color: "white" }}
                    transition="color 0.2s"
                >
                    ← Volver al inicio de sesión
                </Text>
            </Flex>

            <Heading as="h1" size="4xl" color="white" mb={4}>Verificar código</Heading>

            {requestMessage && (
                <Heading as="h3" size="md" textAlign="center" mb={4} color={isValidCode === false ? "red.500" : "yellow.400"}>
                    {requestMessage}
                </Heading>
            )}

            <Box w={{ base: "90%", md: "50%" }} mx="auto" px={4}>
                <Input
                    className="text-input"
                    w="100%"
                    mb={4}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ingresa tu código de 6 dígitos"
                    borderColor={isValidCode === false ? "red.500" : { base: "gray.300", _dark: "inherit" }}
                    bg="#454545"
                    color="white"
                    _placeholder={{ color: "gray.400" }}
                    borderRadius="1rem"
                    _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                />

                <Button
                    bg="white"
                    color="black"
                    w="100%"
                    my={4}
                    onClick={sendCode}
                    disabled={isSendingForm || isResending}
                    _hover={{ bg: "gray.200" }}
                    borderRadius="1rem"
                >
                    {!isSendingForm ? "Verificar código" : (
                        <Flex justify="center" align="center">
                            <Text mr={3}>Verificando...</Text>
                            <Spinner size="sm" color="black" />
                        </Flex>
                    )}
                </Button>

                <Flex justify="center" mt={2}>
                    {isResending ? (
                        <Spinner size="sm" color="white" />
                    ) : (
                        <Text
                            color="gray.400"
                            fontSize="sm"
                            cursor="pointer"
                            _hover={{ color: "white", textDecoration: "underline" }}
                            onClick={handleResendCode}
                        >
                            ¿No recibiste el código? Reenviar código
                        </Text>
                    )}
                </Flex>
            </Box>
        </Box>
    );
}

export default ConfirmSignUp;
