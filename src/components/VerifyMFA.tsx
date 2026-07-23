import { useState } from "react";
import { confirmSignIn, fetchAuthSession, signOut } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Text, Input, Button, Flex, Spinner } from "@chakra-ui/react";

function VerifyMFA() {
    const navigate = useNavigate();
    const [totpCode, setTotpCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const {
        setEmail: setGlobalEmail,
        setName: setGlobalName,
        setRole: setGlobalRole,
        setProfilePictureUrl,
        resetUser,
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

            if (!idToken) throw new Error("No se pudo completar el inicio de sesion");

            const claims = idToken.payload;
            const groups = claims["cognito:groups"] as string[] | undefined;
            const primaryRole = groups && groups.length > 0 ? groups[0] : "user";
            setGlobalEmail(claims.email as string);
            setGlobalName((claims.name as string) ?? "");
            setGlobalRole(primaryRole === "moderators" ? "moderator" : primaryRole);
            setProfilePictureUrl((claims.picture as string) ?? null);

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

    const handleCancelLogin = async () => {
        try {
            await signOut();
        } catch {
        }
        resetUser();
        navigate("/login");
    };

    return (
        <form onSubmit={handleVerifyCode}>
            <Box
                className={`${isVerifying ? "disabled-form no-select" : ""}`}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                color="var(--text-color)"
                mt={10}
            >
                <Flex w={{ base: "90%", md: "50%" }} mb={2}>
                    <Text
                        color="#aaa"
                        cursor="pointer"
                        fontWeight="600"
                        onClick={handleCancelLogin}
                        _hover={{ color: "white" }}
                        transition="color 0.2s"
                    >
                        ← Cancelar inicio de sesión
                    </Text>
                </Flex>

                <Heading as="h1" size="4xl" color="var(--text-color)" mb={4}>Verificación de Dos Factores</Heading>

                <Box w={{ base: "90%", md: "50%" }} mx="auto" px={4}>
                    <Text color="var(--text-color)" mb={4}>
                        Abre tu aplicación de autenticación (Google Authenticator, Microsoft Authenticator, o Authy)
                        e ingresa el código de 6 dígitos que aparece.
                    </Text>

                    {error && <Text color="red.500" mb={3}>{error}</Text>}

                    <Text color="var(--text-color)" mb={2}>Código de verificación</Text>

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
                        bg="var(--input-bg)"
                        color="var(--text-color)"
                        borderRadius="1rem"
                        borderColor="var(--text-color)"
                        _placeholder={{ color: "gray.400" }}
                        _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                    />

                    <Button
                        bg="var(--button-bg)"
                        color="var(--button-text)"
                        w="100%"
                        mb={3}
                        type="submit"
                        disabled={isVerifying || totpCode.length !== 6}
                        _hover={{ bg: "var(--button-hover-bg)" }}
                        borderRadius="1rem"
                    >
                        {!isVerifying ? (
                            "Verificar"
                        ) : (
                            <Flex justify="center" align="center">
                                <Text mr={3}>Verificando...</Text>
                                <Spinner size="sm" color="var(--button-text)" />
                            </Flex>
                        )}
                    </Button>
                </Box>
            </Box>
        </form>
    );
}

export default VerifyMFA;
