import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../utils/UserStore";
import { confirmSignUp } from "aws-amplify/auth";
import { Box, Heading, Input, Button, Spinner, Text, Link, Flex } from "@chakra-ui/react";

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
        <Box
            className={`${isSendingForm ? "disabled-form" : ""}`}
            userSelect="none"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mt={10}
        >
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
                    borderColor={isValidCode === false ? "red.500" : "inherit"}
                    bg="#454545"
                    color="white"
                    _placeholder={{ color: "gray.400" }}
                    borderRadius="1rem"
                />

                <Button
                    bg="white"
                    color="black"
                    w="100%"
                    my={4}
                    onClick={sendCode}
                    disabled={isSendingForm}
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

                <Text color="white" display="block" mt={3} cursor="pointer">
                    ¿No recibiste el código?{" "}
                    <Link color="white" onClick={() => navigate("/signUp")} _hover={{ textDecoration: "underline" }}>
                        Volver a registrarse
                    </Link>
                </Text>
            </Box>
        </Box>
    );
}

export default ConfirmSignUp;
