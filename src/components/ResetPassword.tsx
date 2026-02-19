import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmResetPassword, resetPassword } from "aws-amplify/auth";
import { Box, Flex, Heading, Text, Input, Button, Spinner, Link, Checkbox, Image } from "@chakra-ui/react";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { Correo_electronico } = location.state || {};

    const [email, setEmail] = useState(() => Correo_electronico || "");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [passwordMessage, setPasswordMessage] = useState("Ingrese su nueva contraseña");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const require = {
        length: password.length >= 8,
        mayuscula: /[A-Z]/.test(password),
        minuscula: /[a-z]/.test(password),
        numero: /\d/.test(password),
        especial: /[@$!%*?&._-]/.test(password),
    };

    useEffect(() => {
        if (!Correo_electronico) {
            setRequestMessage("No se encontró información válida. Intenta de nuevo.");
        } else {
            setEmail(Correo_electronico);
        }
    }, [Correo_electronico]);

    const validatePasswords = (): boolean => {
        if (!password.trim() || !confirmPassword.trim()) {
            setPasswordMessage("Debe ingresar ambas contraseñas");
            setIsValidPassword(false);
            return false;
        }
        if (password !== confirmPassword) {
            setPasswordMessage("Las contraseñas no coinciden");
            setIsValidPassword(false);
            return false;
        }
        if (!Object.values(require).every(Boolean)) {
            setPasswordMessage("La contraseña no cumple los requisitos");
            setIsValidPassword(false);
            return false;
        }
        setIsValidPassword(true);
        return true;
    };

    const handleTogglePassword = () => setShowPassword(prev => !prev);
    const handleToggleConfirm = () => setShowConfirm(prev => !prev);

    const handleResetPassword = async () => {
        if (!validatePasswords()) return;
        if (!email) return setRequestMessage("No se recibió el correo correctamente.");
        if (!confirmationCode) return setRequestMessage("Ingrese el código de verificación.");

        setIsSendingForm(true);
        setRequestMessage("");

        try {
            await confirmResetPassword({
                username: email,
                confirmationCode,
                newPassword: password
            });
            setRequestMessage("Contraseña restablecida correctamente");
            setPassword("");
            setConfirmPassword("");
            setConfirmationCode("");
            setIsValidPassword(null);
            navigate("/login");
        } catch (error: any) {
            console.error(error);
            if (error.name === "CodeMismatchException") {
                setRequestMessage("El código ingresado es incorrecto.");
            } else if (error.name === "ExpiredCodeException") {
                setRequestMessage("El código ha expirado. Solicite uno nuevo.");
            } else if (error.name === "LimitExceededException") {
                setRequestMessage("Demasiados intentos. Intente más tarde.");
            } else {
                setRequestMessage("Ocurrió un error al restablecer la contraseña.");
            }
            setIsValidPassword(false);
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) return setRequestMessage("No se encontró el correo para reenviar el código.");

        setRequestMessage("Reenviando código...");
        try {
            await resetPassword({ username: email });
            setRequestMessage("Código reenviado correctamente. Revisa tu correo.");
        } catch (error: any) {
            console.error(error);
            if (error.name === "LimitExceededException") {
                setRequestMessage("Demasiados intentos. Intente más tarde.");
            } else {
                setRequestMessage("Error al reenviar el código.");
            }
        }
    };

    return (
        <Box
            className={isSendingForm ? "disabled-form" : ""}
            userSelect="none"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mt={10}
        >
            <Heading as="h1" textAlign="center" size="4xl" color="white" mb={4}>Restablecer contraseña</Heading>
            <Heading as="h3" size="md" color="yellow.400" textAlign="center" mb={4}>{requestMessage}</Heading>

            <Box w={{ base: "90%", md: "50%" }} mx="auto" px={4}>
                <Input
                    placeholder="Código de verificación"
                    value={confirmationCode}
                    onChange={e => setConfirmationCode(e.target.value)}
                    bg="#454545"
                    color="white"
                    borderRadius="1rem"
                    _placeholder={{ color: "gray.400" }}
                    mb={4}
                />

                <Text color={isValidPassword === false ? "red.500" : "white"} mb={2}>{passwordMessage}</Text>

                <Box pos="relative" display="flex" alignItems="center" mb={4}>
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Nueva contraseña"
                        onChange={e => setPassword(e.target.value)}
                        bg="#454545"
                        color="white"
                        borderColor={isValidPassword === false ? "red.500" : "inherit"}
                        borderRadius="1rem"
                        _placeholder={{ color: "gray.400" }}
                    />
                    <Image
                        position="absolute"
                        right="1rem"
                        top="50%"
                        transform="translateY(-50%)"
                        width="1.5rem"
                        cursor="pointer"
                        src={!showPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleTogglePassword}
                    />
                </Box>

                <Box pos="relative" display="flex" alignItems="center" mb={4}>
                    <Input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        placeholder="Confirmar nueva contraseña"
                        onChange={e => setConfirmPassword(e.target.value)}
                        bg="#454545"
                        color="white"
                        borderColor={isValidPassword === false ? "red.500" : "inherit"}
                        borderRadius="1rem"
                        _placeholder={{ color: "gray.400" }}
                    />
                    <Image
                        position="absolute"
                        right="1rem"
                        top="50%"
                        transform="translateY(-50%)"
                        width="1.5rem"
                        cursor="pointer"
                        src={!showConfirm ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleConfirm}
                    />
                </Box>

                <Box p={2} mb={4} borderRadius="md" className="no-select-no-click" bg="gray.800" color="white">
                    <Text mb={2}>La contraseña debe contener:</Text>

                    <Flex direction="column" gap={1}>
                        <Checkbox.Root disabled checked={require.length} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>Al menos 8 caracteres</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={require.mayuscula} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>Al menos una letra mayúscula</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={require.minuscula} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>Al menos una letra minúscula</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={require.numero} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>Al menos un número</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={require.especial} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>Al menos un carácter especial (@$!%*?&._-)</Checkbox.Label>
                        </Checkbox.Root>
                    </Flex>
                </Box>

                <Button
                    bg="white"
                    color="black"
                    w="100%"
                    my={4}
                    _hover={{ bg: "gray.200" }}
                    onClick={handleResetPassword}
                    borderRadius="1rem"
                >
                    {!isSendingForm ? "Restablecer contraseña" : (
                        <Flex justify="center" align="center">
                            <Text mr={3}>Procesando...</Text>
                            <Spinner size="sm" color="black" />
                        </Flex>
                    )}
                </Button>

                <Flex justify="space-between">
                    <Link
                        color="white"
                        textDecoration="underline"
                        cursor="pointer"
                        onClick={() => navigate("/forgot-password")}
                    >
                        Volver
                    </Link>

                    <Link
                        color="white"
                        textDecoration="underline"
                        cursor="pointer"
                        onClick={handleResendCode}
                    >
                        Reenviar código
                    </Link>
                </Flex>
            </Box>
        </Box>
    );
}

export default ResetPassword;
