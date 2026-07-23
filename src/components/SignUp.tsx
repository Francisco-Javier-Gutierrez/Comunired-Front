import { useState } from "react";
import { signUp } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Input, Button, Spinner, Checkbox } from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

function SignUp() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isValidName, setIsValidName] = useState<boolean | null>(null);
    const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
    const [formMessage, setFormMessage] = useState("");

    const setGlobalEmail = useUserData((state) => state.setEmail);
    const setGlobalName = useUserData((state) => state.setName);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&._-]/.test(password),
    };

    const validateForm = () => {
        const normalizedEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        const nameIsValid = cleanUsername.length >= 2;
        const emailIsValid = emailRegex.test(normalizedEmail);
        const passwordIsValid = Object.values(passwordRules).every(Boolean);

        setIsValidName(nameIsValid);
        setIsValidEmail(emailIsValid);
        setIsValidPassword(passwordIsValid);

        if (!nameIsValid) {
            setFormMessage("El nombre debe tener al menos 2 caracteres.");
            return false;
        }

        if (!emailIsValid) {
            setFormMessage("Ingresa un correo valido.");
            return false;
        }

        if (!passwordIsValid) {
            setFormMessage("La contrasena no cumple los requisitos.");
            return false;
        }

        return true;
    };

    const signUpUser = async () => {
        if (!validateForm()) return;

        const normalizedEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();
        setIsSendingForm(true);
        setFormMessage("");

        try {
            await signUp({
                username: normalizedEmail,
                password,
                options: {
                    userAttributes: {
                        email: normalizedEmail,
                        name: cleanUsername,
                    },
                },
            });

            setGlobalEmail(normalizedEmail);
            setGlobalName(cleanUsername);
            setEmail("");
            setUsername("");
            setPassword("");
            setIsValidName(null);
            setIsValidEmail(null);
            setIsValidPassword(null);

            navigate("/confirm-signup", {
                state: { email: normalizedEmail }
            });
        } catch (error: any) {
            switch (error.name) {
                case "UsernameExistsException":
                    setFormMessage("Este correo ya esta registrado. Inicia sesion o recupera tu contrasena.");
                    setIsValidEmail(false);
                    break;
                case "InvalidPasswordException":
                    setFormMessage("La contrasena no cumple la politica de seguridad.");
                    setIsValidPassword(false);
                    break;
                default:
                    setFormMessage("No pudimos crear tu cuenta. Intenta de nuevo.");
            }
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signUpUser();
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box
                className={isSendingForm ? "disabled-form" : ""}
                userSelect="none"
                w={{ base: "90%", sm: "28rem" }}
                mx="auto"
                mt={{ base: 6, md: 10 }}
                color="var(--text-color)"
            >
                <Flex direction="column" gap={4}>
                <Box textAlign="center">
                    <Heading as="h1" size="3xl" color="var(--text-color)">Crear cuenta</Heading>
                    <Text mt={2} color="var(--muted-text)">Al confirmar tu correo, tu perfil se crea automaticamente.</Text>
                </Box>

                <Button
                    type="button"
                    alignSelf="flex-start"
                    bg="transparent"
                    color="var(--muted-text)"
                    px={0}
                    h="auto"
                    _hover={{ color: "var(--text-color)", bg: "transparent" }}
                    onClick={() => navigate("/login")}
                >
                    Volver al inicio de sesion
                </Button>

                {formMessage && (
                    <Box bg="rgba(239, 68, 68, 0.12)" border="1px solid rgba(239, 68, 68, 0.35)" color="red.400" borderRadius="0.75rem" px={4} py={3}>
                        {formMessage}
                    </Box>
                )}

                <Box>
                    <Text mb={2} fontWeight="600" color={isValidName === false ? "red.400" : "var(--text-color)"}>
                        Nombre de usuario
                    </Text>
                    <Input
                        type="text"
                        value={username}
                        autoComplete="name"
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (isValidName === false) setIsValidName(null);
                            if (formMessage) setFormMessage("");
                        }}
                        bg="var(--input-bg)"
                        color="var(--text-color)"
                        border="solid 0.05rem"
                        borderColor={isValidName === false ? "red.500" : "var(--input-border)"}
                        borderRadius="1rem"
                        _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                    />
                </Box>

                <Box>
                    <Text mb={2} fontWeight="600" color={isValidEmail === false ? "red.400" : "var(--text-color)"}>
                        Correo electronico
                    </Text>
                    <Input
                        type="email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (isValidEmail === false) setIsValidEmail(null);
                            if (formMessage) setFormMessage("");
                        }}
                        bg="var(--input-bg)"
                        color="var(--text-color)"
                        border="solid 0.05rem"
                        borderColor={isValidEmail === false ? "red.500" : "var(--input-border)"}
                        borderRadius="1rem"
                        _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                    />
                </Box>

                <Box>
                    <Text mb={2} fontWeight="600" color={isValidPassword === false ? "red.400" : "var(--text-color)"}>
                        Contrasena
                    </Text>
                    <Box pos="relative" display="flex" alignItems="center">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            autoComplete="new-password"
                            pr="3rem"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (isValidPassword === false) setIsValidPassword(null);
                                if (formMessage) setFormMessage("");
                            }}
                            bg="var(--input-bg)"
                            color="var(--text-color)"
                            border="solid 0.05rem"
                            borderColor={isValidPassword === false ? "red.500" : "var(--input-border)"}
                            borderRadius="1rem"
                            _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
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

                <Box p={3} borderRadius="0.75rem" className="no-select-no-click" bg="var(--card-bg)" color="var(--text-color)">
                    <Text mb={2} fontWeight="600">Requisitos de contrasena</Text>
                    <Flex direction="column" gap={1}>
                        <Checkbox.Root disabled checked={passwordRules.length} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Label>Al menos 8 caracteres</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={passwordRules.uppercase} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Label>Una letra mayuscula</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={passwordRules.lowercase} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Label>Una letra minuscula</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={passwordRules.number} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Label>Un numero</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root disabled checked={passwordRules.special} colorPalette="green">
                            <Checkbox.HiddenInput />
                            <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                            <Checkbox.Label>Un caracter especial (@$!%*?&._-)</Checkbox.Label>
                        </Checkbox.Root>
                    </Flex>
                </Box>

                <Button
                    bg="var(--button-bg)"
                    color="var(--button-text)"
                    w="100%"
                    type="submit"
                    disabled={isSendingForm}
                    _hover={{ bg: "var(--button-hover-bg)" }}
                    borderRadius="1rem"
                >
                    {!isSendingForm ? "Crear cuenta" : (
                        <Flex justify="center" align="center">
                            <Text mr={3}>Creando cuenta...</Text>
                            <Spinner size="sm" color="var(--button-text)" />
                        </Flex>
                    )}
                </Button>
                </Flex>
            </Box>
        </form>
    );
}

export default SignUp;
