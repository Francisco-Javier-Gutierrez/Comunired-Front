import { useState, useEffect } from "react";
import { setUpTOTP, verifyTOTPSetup, updateMFAPreference } from "aws-amplify/auth";

type TOTPSetupDetails = Awaited<ReturnType<typeof setUpTOTP>>;
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../utils/UserStore";
import { Box, Flex, Heading, Text, Input, Button, Spinner, Code } from "@chakra-ui/react";

function SetupMFA() {
    const navigate = useNavigate();
    const { email } = useUserData();
    const [totpCode, setTotpCode] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [accountName, setAccountName] = useState(email ?? "Usuario");
    const [setupDetails, setSetupDetails] = useState<TOTPSetupDetails | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const setupTOTPAsync = async () => {
            try {
                const totpSetupDetails = await setUpTOTP();
                setSetupDetails(totpSetupDetails);
                setSecretKey(totpSetupDetails.sharedSecret);
                setIsLoading(false);
            } catch {
                setError("Error al configurar MFA. Por favor, intenta de nuevo.");
                setIsLoading(false);
            }
        };

        setupTOTPAsync();
    }, []);

    useEffect(() => {
        if (!setupDetails) return;
        const appName = "ComuniRed";
        const nameToUse = accountName.trim() || "Usuario";
        const url = setupDetails.getSetupUri(appName, nameToUse);
        setQrCodeUrl(url.href);
    }, [accountName, setupDetails]);

    const handleVerifyCode = async () => {
        if (!totpCode.trim() || totpCode.length !== 6) {
            setError("Por favor, ingresa un código válido de 6 dígitos");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            await verifyTOTPSetup({ code: totpCode });
            await updateMFAPreference({ totp: "PREFERRED" });

            setIsSuccess(true);
            setTimeout(() => {
                navigate("/my-profile");
            }, 2000);
        } catch {
            setError("Código inválido. Por favor, verifica e intenta de nuevo.");
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <Flex direction="column" align="center" justify="center" minH="100vh">
                <Spinner size="xl" color="white" boxSize="15rem" borderWidth="8px" mb={4} />
                <Heading as="h3" color="white" mt={4}>Configurando MFA...</Heading>
            </Flex>
        );
    }

    return (
        <Box
            className={isVerifying ? "disabled-form" : ""}
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
                    onClick={() => navigate("/my-profile")}
                    _hover={{ color: "white" }}
                    transition="color 0.2s"
                >
                    ← Volver a mi perfil
                </Text>
            </Flex>

            <Heading as="h1" size="4xl" textAlign="center" color="white" mb={4}>Configurar Autenticación de Dos Factores (MFA)</Heading>

            <Box w={{ base: "90%", md: "50%" }} mx="auto" px={4}>
                <Box mb={4}>
                    <Heading as="h4" color="white" mb={3} size="md">Paso 1: Configura el identificador (Opcional)</Heading>
                    <Text color="white" mb={2}>Este nombre aparecerá en tu aplicación de autenticación:</Text>
                    <Input
                        bg="#454545"
                        color="white"
                        borderRadius="1rem"
                        _placeholder={{ color: "gray.400" }}
                        mb={3}
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Ej: juan@comunired.com"
                    />

                    <Heading as="h4" color="white" mb={3} size="md">Paso 2: Escanea el código QR</Heading>
                    <Text color="white" mb={3}>
                        Usa una aplicación de autenticación como Google Authenticator, Microsoft Authenticator o Authy
                        para escanear el siguiente código QR:
                    </Text>

                    {qrCodeUrl && (
                        <Flex justify="center" mb={3} bg="white" p={3} borderRadius="md">
                            <QRCodeSVG value={qrCodeUrl} size={200} />
                        </Flex>
                    )}
                </Box>

                <Box mb={4}>
                    <Heading as="h4" color="white" mb={3} size="md">Paso 3: Clave de configuración manual (opcional)</Heading>
                    <Text color="white" mb={2}>
                        Si no puedes escanear el código QR, ingresa esta clave manualmente en tu aplicación:
                    </Text>
                    <Box bg="gray.800" color="white" p={3} borderRadius="md" textAlign="center">
                        <Code fontSize="16px" wordBreak="break-word" letterSpacing="2px" bg="transparent" color="white" userSelect="text">{secretKey}</Code>
                    </Box>
                </Box>

                <Box mb={4}>
                    <Heading as="h4" color="white" mb={3} size="md">Paso 4: Verifica el código</Heading>
                    <Text color="white" mb={3}>
                        Ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación:
                    </Text>

                    {error && <Text color="red.500" mb={3}>{error}</Text>}
                    {isSuccess && <Text color="green.500" mb={3} textAlign="center" fontWeight="bold">¡MFA configurado exitosamente!</Text>}

                    <Input
                        bg="#454545"
                        color="white"
                        borderRadius="1rem"
                        _placeholder={{ color: "gray.400" }}
                        mb={3}
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
                    />
                </Box>

                <Button
                    bg="white"
                    color="black"
                    w="100%"
                    mb={3}
                    _hover={{ bg: "gray.200" }}
                    onClick={handleVerifyCode}
                    disabled={isVerifying || totpCode.length !== 6 || isSuccess}
                    borderRadius="1rem"
                >
                    {isSuccess ? (
                        "¡Éxito! Redirigiendo..."
                    ) : !isVerifying ? (
                        "Verificar y Activar MFA"
                    ) : (
                        <Flex justify="center" align="center">
                            <Text mr={3}>Verificando...</Text>
                            <Spinner size="sm" color="black" />
                        </Flex>
                    )}
                </Button>

                <Button
                    bg="white"
                    color="black"
                    w="100%"
                    _hover={{ bg: "gray.200" }}
                    onClick={() => navigate("/my-profile")}
                    borderRadius="1rem"
                >
                    Cancelar
                </Button>
            </Box>
        </Box>
    );
}

export default SetupMFA;
