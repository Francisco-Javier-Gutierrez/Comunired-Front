import { useState } from "react";
import { confirmSignIn, fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Text, Input, Button, Flex, Spinner, Link } from "@chakra-ui/react";

function VerifyMFA() {
    const navigate = useNavigate();
    const [totpCode, setTotpCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const {
        setEmail: setGlobalEmail,
        setName: setGlobalName,
        setProfilePictureUrl,
    } = useUserData();

    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!totpCode.trim() || totpCode.length !== 6) {
            setError("Por favor, ingresa un código válido de 6 dígitos");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            await confirmSignIn({ challengeResponse: totpCode });

            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken;

            if (idToken) {
                const claims = idToken.payload;
                setGlobalEmail(claims.email as string);
                setGlobalName((claims.name as string) ?? "");
                setProfilePictureUrl(null);
            }

            navigate("/");
        } catch (err: any) {
            if (err.name === "CodeMismatchException") {
                setError("Código inválido. Por favor, verifica e intenta de nuevo.");
            } else if (err.name === "NotAuthorizedException") {
                setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError("Error al verificar el código. Intenta de nuevo.");
            }

            setIsVerifying(false);
        }
    };

    return (
        <form onSubmit={handleVerifyCode}>
            <Box
                className={`${isVerifying ? "disabled-form no-select" : ""}`}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                mt={10}
            >
                <Heading as="h1" size="4xl" textAlign="center" color="white" mb={4}>Verificación de Dos Factores</Heading>

                <Box w={{ base: "90%", md: "50%" }} mx="auto" px={4}>
                    <Text color="white" mb={4}>
                        Abre tu aplicación de autenticación (Google Authenticator, Microsoft Authenticator, o Authy)
                        e ingresa el código de 6 dígitos que aparece.
                    </Text>

                    {error && <Text color="red.500" mb={3}>{error}</Text>}

                    <Text color="white" mb={2}>Código de verificación</Text>

                    <Input
                        w="100%"
                        mb={4}
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setTotpCode(value);
                            if (error) setError("");
                        }}
                        textAlign="center"
                        fontSize="24px"
                        letterSpacing="8px"
                        bg="#454545"
                        color="white"
                        borderRadius="1rem"
                        borderColor="white"
                        _placeholder={{ color: "gray.400" }}
                    />

                    <Button
                        bg="white"
                        color="black"
                        w="100%"
                        mb={3}
                        type="submit"
                        disabled={isVerifying || totpCode.length !== 6}
                        _hover={{ bg: "gray.200" }}
                        borderRadius="1rem"
                    >
                        {!isVerifying ? (
                            "Verificar"
                        ) : (
                            <Flex justify="center" align="center">
                                <Text mr={3}>Verificando...</Text>
                                <Spinner size="sm" color="black" />
                            </Flex>
                        )}
                    </Button>

                    <Text textAlign="center" mt={4} color="white">
                        <Link as="span" cursor="pointer" color="white" textDecoration="underline" onClick={() => navigate("/login")}>
                            Volver al inicio de sesión
                        </Link>
                    </Text>
                </Box>
            </Box>
        </form>
    );
}

export default VerifyMFA;
