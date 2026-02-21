import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "aws-amplify/auth";
import { Flex, Heading, Text, Input, Button, Spinner, Box } from "@chakra-ui/react";

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
        <form onSubmit={handleValidateForm}>
            <Box
                className={`${isSendingForm ? "disabled-form" : ""}`}
                userSelect="none"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
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

                <Heading as="h1" size="4xl" color="white" mb={4}>Recuperar contraseña</Heading>

                {requestMessage && (
                    <Heading as="h3" size="md" color="yellow.400" textAlign="center" mb={4}>
                        {requestMessage}
                    </Heading>
                )}

                <Box w={{ base: "90%", md: "50%" }} mx="auto" px={4}>
                    <Text color={isValidEmail === false ? "red.500" : "white"} mb={2}>
                        {emailMessage}
                    </Text>

                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);

                            if (isValidEmail === false) {
                                setIsValidEmail(null);
                                setEmailMessage("Ingrese su correo electrónico");
                            }
                        }}
                        w="100%"
                        bg="#454545"
                        color="white"
                        borderColor={isValidEmail === false ? "red.500" : "inherit"}
                        borderRadius="1rem"
                        _placeholder={{ color: "gray.400" }}
                        mb={4}
                    />

                    <Button
                        type="submit"
                        bg="white"
                        color="black"
                        w="100%"
                        my={4}
                        _hover={{ bg: "gray.200" }}
                        borderRadius="1rem"
                    >
                        {!isSendingForm ? "Enviar código" : (
                            <Flex justify="center" align="center">
                                <Text mr={3}>Enviando correo...</Text>
                                <Spinner size="sm" color="black" />
                            </Flex>
                        )}
                    </Button>
                </Box>
            </Box>
        </form>
    );
}

export default ForgotPassword;
