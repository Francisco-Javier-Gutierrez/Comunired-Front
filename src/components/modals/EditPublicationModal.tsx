import { useRef, useState, useEffect } from "react";
import { api } from "../../services/api";
import { uploadFile } from "../../utils/UploadUtils";
import LocationPicker from "../LocationPicker";
import ConfirmModal from "./ConfirmModal";
import { Dialog, Flex, Box, Text, Textarea, Image, Button, Spinner, Input } from "@chakra-ui/react";
import { useUserData } from "../../utils/UserStore";
import type { Publication } from "../../types";

export interface EditPublicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Publication;
    onSuccess: (updatedPost: Publication) => void;
}

export default function EditPublicationModal({ isOpen, onClose, post, onSuccess }: EditPublicationModalProps) {
    const { profilePictureUrl, name, email: globalEmail } = useUserData();
    const postOwnerName = post.user?.username ?? name ?? "Usuario";
    const postOwnerPic = post.user?.profilePicUrl ?? profilePictureUrl ?? "/Profile.svg";
    const postOwnerEmail = post.user?.email ?? post.userEmail;
    const isOwner = !!postOwnerEmail && !!globalEmail && postOwnerEmail.toLowerCase() === globalEmail.toLowerCase();

    const [image, setImage] = useState<string | null>(post.imageUrl || null);
    const [video, setVideo] = useState<string | null>(post.videoUrl || null);
    const [latitude, setLatitude] = useState<number | null>(post.lat ?? null);
    const [longitude, setLongitude] = useState<number | null>(post.long ?? null);

    const [textMessage, setTextMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputVideoRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const [isValidText, setIsValidText] = useState<boolean | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(post.imageUrl || null);
    const [previewVideo, setPreviewVideo] = useState<string | null>(post.videoUrl || null);

    const [imageError, setImageError] = useState("");
    const [videoError, setVideoError] = useState("");
    const [isValidImage, setIsValidImage] = useState<boolean | null>(null);
    const [isValidVideo, setIsValidVideo] = useState<boolean | null>(null);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [showMap, setShowMap] = useState(post.lat !== null && post.lat !== undefined && post.long !== null && post.long !== undefined);
    const [formError, setFormError] = useState("");

    const [modalData, setModalData] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { }
    });

    useEffect(() => {
        if (isOpen && post) {
            setImage(post.imageUrl || null);
            setPreviewImage(post.imageUrl || null);
            setVideo(post.videoUrl || null);
            setPreviewVideo(post.videoUrl || null);

            const lat = post.lat ?? null;
            const lng = post.long ?? null;
            setLatitude(lat);
            setLongitude(lng);
            setShowMap(lat !== null && lng !== null);

            setIsValidText(null);
            setTextMessage("");
            setFormError("");
            if (textareaRef.current) {
                textareaRef.current.value = post.content || "";
                setTimeout(autoResize, 10);
            }
        }
    }, [isOpen, post]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const maxHeight = window.innerHeight * 0.4;
        const newHeight = el.scrollHeight;
        if (newHeight < maxHeight) {
            el.style.overflowY = "hidden";
            el.style.height = newHeight + "px";
        } else {
            el.style.overflowY = "auto";
            el.style.height = maxHeight + "px";
        }
    };

    const openImageSelector = () => fileInputRef.current?.click();
    const openVideoSelector = () => fileInputVideoRef.current?.click();

    const toggleLocation = () => {
        if (!showMap && (image || video)) {
            setModalData({
                isOpen: true,
                title: "¿Reemplazar por ubicación?",
                description: `Al agregar una ubicación, se eliminará permanentemente ${image ? "la foto" : "el video"}.`,
                onConfirm: () => {
                    setImage(null);
                    setPreviewImage(null);
                    setVideo(null);
                    setPreviewVideo(null);
                    setShowMap(true);
                    setModalData(prev => ({ ...prev, isOpen: false }));
                }
            });
        } else {
            if (!showMap) {
                setImage(null);
                setPreviewImage(null);
                setVideo(null);
                setPreviewVideo(null);
            }
            setShowMap(!showMap);
        }
    };

    const handleAddImage = () => {
        if (video || showMap) {
            setModalData({
                isOpen: true,
                title: "¿Reemplazar por foto?",
                description: `Al agregar una foto, se eliminará permanentemente ${video ? "el video" : "la ubicación"}.`,
                onConfirm: () => {
                    setVideo(null);
                    setPreviewVideo(null);
                    setShowMap(false);
                    setLatitude(null);
                    setLongitude(null);
                    openImageSelector();
                    setModalData(prev => ({ ...prev, isOpen: false }));
                }
            });
        } else {
            openImageSelector();
        }
    };

    const handleAddVideo = () => {
        if (image || showMap) {
            setModalData({
                isOpen: true,
                title: "¿Reemplazar por video?",
                description: `Al agregar un video, se eliminará permanentemente ${image ? "la foto" : "la ubicación"}.`,
                onConfirm: () => {
                    setImage(null);
                    setPreviewImage(null);
                    setShowMap(false);
                    setLatitude(null);
                    setLongitude(null);
                    openVideoSelector();
                    setModalData(prev => ({ ...prev, isOpen: false }));
                }
            });
        } else {
            openVideoSelector();
        }
    };

    const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError("La imagen está demasiado pesada (máx 10MB)");
            setIsValidImage(false);
            return;
        }

        setIsValidImage(true);
        setImageError("");
        setVideo(null);
        setPreviewVideo(null);
        setShowMap(false);
        setLatitude(null);
        setLongitude(null);

        const blobUrl = URL.createObjectURL(file);
        setPreviewImage(blobUrl);

        setIsUploadingImage(true);
        try {
            const fileUrl = await uploadFile(file, "publications");
            if (fileUrl) {
                setPreviewImage(fileUrl);
                setImage(fileUrl);
            }
        } catch {
            setImageError("Error subiendo imagen, intenta de nuevo");
            setIsValidImage(false);
            setPreviewImage(null);
            setImage(null);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingImage(false);
        }
    };

    const handleVideoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            setVideoError("El video es demasiado pesado (máx 500MB)");
            setIsValidVideo(false);
            return;
        }

        setIsValidVideo(true);
        setVideoError("");
        setImage(null);
        setPreviewImage(null);
        setShowMap(false);
        setLatitude(null);
        setLongitude(null);

        const blobUrl = URL.createObjectURL(file);
        setPreviewVideo(blobUrl);

        setIsUploadingVideo(true);
        try {
            const fileUrl = await uploadFile(file, "publications");
            if (fileUrl) {
                setPreviewVideo(fileUrl);
                setVideo(fileUrl);
            }
        } catch {
            setVideoError("Error subiendo video, intenta de nuevo");
            setIsValidVideo(false);
            setPreviewVideo(null);
            setVideo(null);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingVideo(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewImage(null);
        setIsValidImage(null);
        setImageError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveVideo = () => {
        setVideo(null);
        setPreviewVideo(null);
        setIsValidVideo(null);
        setVideoError("");
        if (fileInputVideoRef.current) fileInputVideoRef.current.value = "";
    };

    const handleRemoveLocation = () => {
        setLatitude(null);
        setLongitude(null);
        setShowMap(false);
    };

    const validateText = () => {
        const realText = textareaRef.current?.value || "";
        if (!realText.trim()) {
            setTextMessage("No ha colocado un texto para la publicación");
            setIsValidText(false);
            return false;
        }
        setTextMessage("");
        setIsValidText(true);
        return true;
    };

    const handleUpdatePublication = async () => {
        const textIsValid = validateText();
        if (!textIsValid || isValidImage === false || isValidVideo === false) return;

        setIsSendingForm(true);
        setFormError("");
        try {
            const realText = textareaRef.current?.value || "";
            const updatedPost = await api.publications.edit(post.id, {
                content: realText,
                imageUrl: image,
                videoUrl: video,
                lat: latitude,
                long: longitude,
            });

            onSuccess(updatedPost);
            onClose();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "No pudimos actualizar la publicacion.");
        } finally {
            setIsSendingForm(false);
        }
    };

    const isDisabled = isSendingForm || isUploadingImage || isUploadingVideo;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && !isDisabled && onClose()} placement="center" closeOnInteractOutside={!isDisabled}>
            <Dialog.Backdrop bg="rgba(0,0,0,0.85)" />
            <Dialog.Positioner>
                <Dialog.Content
                    bg="#1f1f1f"
                    border="1px solid #333"
                    boxShadow="0 20px 60px rgba(0,0,0,0.6)"
                    borderRadius="20px"
                    p="24px"
                    w="95%"
                    maxW="600px"
                    maxH="90vh"
                    overflowY="auto"
                >
                    <Dialog.Body p={0}>
                        <Box className={`${isDisabled ? "disabled-form" : ""}`} userSelect="none">
                            <Text color="var(--text-color)" fontSize="20px" fontWeight="700" mb={4} textAlign="center">
                                {isOwner || !globalEmail ? "Editar publicación" : `Editar publicación de ${postOwnerName}`}
                            </Text>

                            <Flex align="center" my={3}>
                                <Image
                                    src={postOwnerPic}
                                    alt="Foto de perfil"
                                    borderRadius="full"
                                    mr={2}
                                    boxSize="2rem"
                                    userSelect="none"
                                />
                                <Box>
                                    <Text color="var(--text-color)" fontWeight="bold" fontSize="sm">{postOwnerName}</Text>
                                    <Text color="gray.400" fontSize="xs">Editando...</Text>
                                </Box>
                            </Flex>

                            <Text color="red.500" fontSize="sm">{textMessage}</Text>
                            {formError && <Text role="alert" color="red.500" fontSize="sm" mb={2}>{formError}</Text>}
                            <Textarea
                                ref={textareaRef}
                                className={`textarea-input ${isValidText === false ? "input-error" : ""}`}
                                placeholder="Corrige tu idea u opinión aquí"
                                onInput={autoResize}
                                onChange={() => { setIsValidText(null); setTextMessage(""); }}
                                mb={3}
                                minH="80px"
                                resize="none"
                                overflow="hidden"
                                bg="#2d2d2d"
                                color="var(--text-color)"
                                borderColor={isValidText === false ? "red.500" : "transparent"}
                                borderRadius="1rem"
                                p={3}
                                _placeholder={{ color: "gray.500" }}
                                _focus={{ borderColor: "gray.400", outline: "none" }}
                            />

                            <Flex align="center" mb={3} gap={4}>
                                <Image src="/AddImage.svg" alt="Agregar imagen" boxSize="1.5rem" cursor="pointer" onClick={handleAddImage} opacity={image ? 0.5 : 1} filter="none" />
                                <Image src="/AddVideo.svg" alt="Agregar video" boxSize="1.5rem" cursor="pointer" onClick={handleAddVideo} opacity={video ? 0.5 : 1} filter="none" />
                                <Image src="/AddLocation.svg" alt="Agregar ubicación" boxSize="1.5rem" cursor="pointer" onClick={toggleLocation} opacity={showMap ? 0.5 : 1} filter="none" />
                            </Flex>

                            {imageError && <Text color="red.500" textAlign="center" mt={2} fontSize="sm">{imageError}</Text>}
                            {videoError && <Text color="red.500" textAlign="center" mt={2} fontSize="sm">{videoError}</Text>}
                            {(isUploadingImage || isUploadingVideo) && <Text color="var(--text-color)" mt={2} fontSize="sm">Sincronizando archivo de reemplazo...</Text>}

                            <Input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} onChange={handleImageSelected} display="none" />
                            <Input type="file" accept="video/mp4,video/webm,video/quicktime" ref={fileInputVideoRef} onChange={handleVideoSelected} display="none" />

                            {showMap && (
                                <Box mb={4} pos="relative">
                                    <LocationPicker
                                        latitude={latitude}
                                        longitude={longitude}
                                        setLocation={(lat: number | null, lng: number | null) => {
                                            setLatitude(lat);
                                            setLongitude(lng);
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        pos="absolute"
                                        top={0}
                                        right={0}
                                        m={2}
                                        borderRadius="full"
                                        onClick={handleRemoveLocation}
                                        zIndex={1000}
                                        bg="red.500"
                                        _hover={{ bg: "red.600" }}
                                        color="var(--text-color)"
                                        w="30px" h="30px" minW="0" p="0"
                                    >✕</Button>
                                </Box>
                            )}

                            {previewImage && (
                                <Box pos="relative" w="100%" mx="auto" mt={4}>
                                    <Image src={previewImage} alt="Vista previa" w="100%" borderRadius="md" maxH="15rem" objectFit="cover" display="block" />
                                    <Button
                                        size="sm"
                                        pos="absolute"
                                        top={0}
                                        right={0}
                                        m={2}
                                        borderRadius="full"
                                        onClick={handleRemoveImage}
                                        bg="red.500"
                                        _hover={{ bg: "red.600" }}
                                        color="var(--text-color)"
                                        w="30px" h="30px" minW="0" p="0"
                                    >✕</Button>
                                </Box>
                            )}

                            {previewVideo && (
                                <Box pos="relative" w="100%" mx="auto" mt={4}>
                                    <video src={previewVideo} controls style={{ width: "100%", borderRadius: "0.25rem", display: "block", maxHeight: "15rem", backgroundColor: "#000" }} />
                                    <Button
                                        size="sm"
                                        pos="absolute"
                                        top={0}
                                        right={0}
                                        m={2}
                                        borderRadius="full"
                                        onClick={handleRemoveVideo}
                                        zIndex={1}
                                        bg="red.500"
                                        _hover={{ bg: "red.600" }}
                                        color="var(--text-color)"
                                        w="30px" h="30px" minW="0" p="0"
                                    >✕</Button>
                                </Box>
                            )}

                            <Flex w="100%" mt={6} justify="flex-end" gap={3}>
                                <Button
                                    bg="transparent"
                                    color="gray.400"
                                    _hover={{ color: "white" }}
                                    onClick={onClose}
                                    disabled={isDisabled}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    bg="var(--button-bg)"
                                    color="var(--button-text)"
                                    _hover={{ opacity: 0.8 }}
                                    onClick={handleUpdatePublication}
                                    disabled={isDisabled}
                                    borderRadius="1rem"
                                    px={6}
                                >
                                    {!isSendingForm ? "Guardar cambios" : <Spinner size="sm" color="var(--button-text)" />}
                                </Button>
                            </Flex>
                        </Box>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>

            <ConfirmModal
                isOpen={modalData.isOpen}
                title={modalData.title}
                description={modalData.description}
                onConfirm={modalData.onConfirm}
                onCancel={() => setModalData(prev => ({ ...prev, isOpen: false }))}
            />
        </Dialog.Root>
    );
}
