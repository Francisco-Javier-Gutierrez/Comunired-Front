import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "aws-amplify/auth";
import { Box, Flex, Heading, Text, Input, Button, Spinner, Image, Alert } from "@chakra-ui/react";

function EditPassword() {
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleToggleCurrentPassword = () => setShowCurrentPassword(prev => !prev);
    const handleToggleNewPassword = () => setShowNewPassword(prev => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

    const validateForm = (): boolean => {
        if (!currentPassword.trim()) {
            setErrorMessage("Ingresa tu contraseña actual");
            return false;
        }

        if (!newPassword.trim()) {
            setErrorMessage("Ingresa tu nueva contraseña");
            return false;
        }

        if (newPassword.length < 8) {
            setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres");
            return false;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return false;
        }

        if (currentPassword === newPassword) {
            setErrorMessage("La nueva contraseña debe ser diferente a la actual");
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!validateForm()) return;

        setIsSendingForm(true);

        try {
            await updatePassword({
                oldPassword: currentPassword,
                newPassword: newPassword,
            });

            setSuccessMessage("¡Contraseña actualizada correctamente!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/my-profile"), 1500);
        } catch (err: any) {

            if (err.name === "NotAuthorizedException") {
                setErrorMessage("La contraseña actual es incorrecta");
            } else if (err.name === "InvalidPasswordException") {
                setErrorMessage("La nueva contraseña no cumple los requisitos de seguridad");
            } else if (err.name === "LimitExceededException") {
                setErrorMessage("Demasiados intentos. Intenta más tarde");
            } else {
                setErrorMessage(err.message || "Error al cambiar la contraseña");
            }
        } finally {
            setIsSendingForm(false);
        }
    };



    return (
        <Box className={`${isSendingForm ? "disabled-form" : ""}`} userSelect="none">
            <Flex direction="column" minH="100vh" w={["90%", "75%"]} mx="auto">
                <Flex w="100%" mt={4} mb={2}>
                    <Text
                        color="#aaa"
                        cursor="pointer"
                        fontWeight="600"
                        onClick={() => navigate("/edit-profile")}
                        _hover={{ color: "white" }}
                        transition="color 0.2s"
                    >
                        ← Volver a editar datos
                    </Text>
                </Flex>

                <Heading as="h1" textAlign="center" size="4xl" color="white" mb={4}>Cambiar mi contraseña</Heading>

                {errorMessage && (
                    <Alert.Root status="error" mb={4} borderRadius="md">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>{errorMessage}</Alert.Title>
                        </Alert.Content>
                    </Alert.Root>
                )}

                {successMessage && (
                    <Alert.Root status="success" mb={4} borderRadius="md">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>{successMessage}</Alert.Title>
                        </Alert.Content>
                    </Alert.Root>
                )}

                <Text color="white">Contraseña actual</Text>
                <Box pos="relative" display="flex" alignItems="center" mb={4}>
                    <Input
                        w="100%"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        bg="#454545"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                        borderColor="white"
                        borderRadius="1rem"
                        _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                    />
                    <Image
                        position="absolute"
                        right="1rem"
                        top="50%"
                        transform="translateY(-50%)"
                        width="1.5rem"
                        cursor="pointer"
                        src={!showCurrentPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleCurrentPassword}
                        filter="none"
                    />
                </Box>

                <Text color="white">Nueva contraseña</Text>
                <Box pos="relative" display="flex" alignItems="center" mb={4}>
                    <Input
                        w="100%"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        bg="#454545"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                        borderColor="white"
                        borderRadius="1rem"
                        _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                    />
                    <Image
                        position="absolute"
                        right="1rem"
                        top="50%"
                        transform="translateY(-50%)"
                        width="1.5rem"
                        cursor="pointer"
                        src={!showNewPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleNewPassword}
                        filter="none"
                    />
                </Box>

                <Text color="white">Confirmar nueva contraseña</Text>
                <Box pos="relative" display="flex" alignItems="center" mb={4}>
                    <Input
                        w="100%"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        bg="#454545"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                        borderColor="white"
                        borderRadius="1rem"
                        _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                    />
                    <Image
                        position="absolute"
                        right="1rem"
                        top="50%"
                        transform="translateY(-50%)"
                        width="1.5rem"
                        cursor="pointer"
                        src={!showConfirmPassword ? "Text.svg" : "Password.svg"}
                        alt="Mostrar u ocultar contraseña"
                        onClick={handleToggleConfirmPassword}
                        filter="none"
                    />
                </Box>

                <Flex w="100%" justify="end">
                    <Button
                        bg="white"
                        color="black"
                        _hover={{ bg: "gray.200" }}
                        my={4}
                        onClick={handleChangePassword}
                        disabled={isSendingForm}
                        borderRadius="1rem"
                    >
                        {!isSendingForm ? (
                            "Actualizar contraseña"
                        ) : (
                            <Flex justify="center" align="center">
                                <Text mr={3}>Actualizando...</Text>
                                <Spinner size="sm" color="black" />
                            </Flex>
                        )}
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
}

export default EditPassword;
