import { useRef, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { uploadFile } from "../utils/UploadUtils";
import { updateUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import type { AuthContext } from "./layouts/LoggedLayout";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import { Box, Flex, Heading, Text, Input, Button, Spinner, Image } from "@chakra-ui/react";
import axios from "axios";

function EditProfile() {
    const navigate = useNavigate();
    const authContext = useOutletContext<AuthContext>();
    const { setName: setGlobalName, setProfilePictureUrl } = useUserData();

    const [name, setName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean>(false);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [imageError, setImageError] = useState<string>("");
    const [isValidImage, setIsValidImage] = useState<boolean>(true);

    const MAX_MB = 5;
    const MAX_BYTES = MAX_MB * 1024 * 1024;

    useEffect(() => {
        if (authContext.name) setName(authContext.name);
        if (authContext.picture) {
            setPreviewImage(authContext.picture);
            setProfileImage(authContext.picture);
        }
    }, [authContext]);


    const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await handleImage(file);
    };

    const handleImage = async (file: File) => {
        if (!file) return;

        if (file.size > MAX_BYTES) {
            setImageError(`La imagen supera ${MAX_MB}MB`);
            setIsValidImage(false);
            setPreviewImage(null);
            setProfileImage(null);
            return;
        }

        setIsValidImage(true);
        setImageError("");

        const blobUrl = URL.createObjectURL(file);
        setPreviewImage(blobUrl);

        setIsUploadingImage(true);
        try {
            const fileUrl = await uploadFile(file, "profile");
            if (fileUrl) {
                setPreviewImage(fileUrl);
                setProfileImage(fileUrl);
            }
        } catch (err) {
            console.error("Error subiendo imagen:", err);
            setImageError("Error subiendo imagen, intenta de nuevo");
            setIsValidImage(false);
            setPreviewImage(null);
            setProfileImage(null);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingImage(false);
        }
    };

    const openImageSelector = () => fileInputRef.current?.click();

    const handleDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        await handleImage(file);
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        const hasNameChange = trimmedName && trimmedName !== authContext.name;
        const hasPictureChange = profileImage && profileImage !== authContext.picture;

        if (!hasNameChange && !hasPictureChange) {
            setErrorMessage("Debes cambiar tu nombre o actualizar tu foto antes de guardar");
            return;
        }

        if (trimmedName.length > 0 && trimmedName.length < 3) {
            setErrorMessage("El nombre debe tener al menos 3 caracteres");
            return;
        }

        setErrorMessage("");
        setIsSendingForm(true);

        try {
            const userAttributes: Record<string, string> = {};

            if (hasNameChange) {
                userAttributes.name = trimmedName;
            }

            if (hasPictureChange && profileImage) {
                userAttributes.picture = profileImage;
            }

            const token = await getToken();

            await axios.post(
                apiRoutes.update_user_url,
                {
                    nombre_usuario: trimmedName,
                    foto_perfil: profileImage,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await updateUserAttributes({ userAttributes });

            await fetchAuthSession({ forceRefresh: true });
            if (hasNameChange) setGlobalName(trimmedName);
            if (hasPictureChange && profileImage) setProfilePictureUrl(profileImage);

            navigate("/my-profile");
        } catch (err: any) {
            console.error("Error actualizando perfil:", err);
            setErrorMessage(err.message || "Error al actualizar el perfil");
        } finally {
            setIsSendingForm(false);
        }
    };

    const isFormDisabled = isSendingForm || isUploadingImage;

    return (
        <Box className={`${isFormDisabled ? "disabled-form" : ""}`} userSelect="none">
            <Flex direction="column" minH="100vh" w={["90%", "75%"]} mx="auto">

                <Heading as="h1" textAlign="center" size="4xl" color="white" mb={4}>Actualizar mis datos</Heading>

                {errorMessage && <Heading as="h6" size="sm" color="red.500">{errorMessage}</Heading>}

                <Text color={!isValidImage ? "red.500" : "white"}>
                    {imageError || "Foto de perfil"}
                </Text>

                <Box
                    textAlign="center"
                    mb={4}
                    border="0.05rem solid #ffffff"
                    borderRadius="0.5rem"
                    w="100%"
                    cursor="pointer"
                    onClick={openImageSelector}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropImage}
                    bg={isDragging ? "rgba(255, 255, 255, 0.1)" : "#454545"}
                    borderColor={isDragging ? "white" : "white"}
                    borderStyle={isDragging ? "dashed" : "solid"}
                    borderWidth={isDragging ? "2px" : "0.05rem"}
                    transition="0.2s ease-in-out"
                >
                    {isUploadingImage ? (
                        <Flex direction="column" align="center" py={4}>
                            <Spinner mb={2} color="white" />
                            <Text color="white">Subiendo imagen...</Text>
                        </Flex>
                    ) : (
                        previewImage ? (
                            <Image
                                src={previewImage}
                                alt="Vista previa"
                                display="block"
                                w="75%"
                                mx="auto"
                                borderRadius="md"
                                maxH="15rem"
                                objectFit="contain"
                            />
                        ) : (
                            <>
                                <Text display="block" color="white">Haz click o arrastra una imagen aquí</Text>
                                <Image src="/AddImage.svg" alt="Agregar imagen" w="4rem" mb={2} mx="auto" />
                            </>
                        )
                    )}
                </Box>

                <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelected}
                    display="none"
                />

                <Text color="white">Nombre</Text>
                <Input
                    w="100%"
                    mb={4}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={authContext.name || "Tu nombre"}
                    bg="#454545"
                    color="white"
                    _placeholder={{ color: "gray.400" }}
                    borderColor="white"
                    borderRadius="1rem"
                />

                <Flex w="100%" justify="center" align="center">
                    <Box w="50%" textAlign="start">
                        <Button
                            bg="white"
                            color="black"
                            _hover={{ bg: "gray.200" }}
                            onClick={() => navigate("/edit-password")}
                            borderRadius="1rem"
                        >
                            Cambiar contraseña
                        </Button>
                    </Box>
                    <Box w="50%" textAlign="end">
                        <Button
                            bg="white"
                            color="black"
                            _hover={{ bg: "gray.200" }}
                            onClick={handleSave}
                            disabled={isFormDisabled}
                            borderRadius="1rem"
                        >
                            {!isSendingForm ? (
                                "Actualizar"
                            ) : (
                                <Flex justify="center" align="center">
                                    <Text mr={3}>Actualizando...</Text>
                                    <Spinner size="sm" color="black" />
                                </Flex>
                            )}
                        </Button>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
}

export default EditProfile;
