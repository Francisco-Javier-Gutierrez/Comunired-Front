import { useState } from "react";
import axios from "axios";
import { usePublicationData } from "../utils/PublicationStore";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";
import { Flex, Box, Button, Spinner, Text } from "@chakra-ui/react";

function PreviewPublication() {
    const navigate = useNavigate();
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const { text, image, video, latitude, longitude, setText, setImage, setVideo, resetPublication } = usePublicationData();
    const { email: userEmail, name: userName, profilePictureUrl } = useUserData();
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const handleValidatePublicationPublicate = async () => {
        if (!text?.trim()) return;

        setIsSendingForm(true);

        const token = await getToken();
        axios.post(apiRoutes.create_publication_url, { Contenido: text, Url_imagen: image, Url_video: video, Lat: latitude, Long: longitude }, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setText(null);
                setImage(null);
                setVideo(null);
                resetPublication();
                navigate("/my-profile");
            })
            .catch(() => { })
            .finally(() => {
                setIsSendingForm(false);
            });
    };

    return (
        <Box minH="100vh" className={isSendingForm ? "disabled-form" : ""} userSelect="none">
            <Flex direction="column" w={["90%", "75%"]} minH="70vh" mx="auto" className="home-container">
                <PublicationCard
                    key={0}
                    isPreview={true}
                    post={{
                        Id_publicacion: 0,
                        Usuario: {
                            Correo_electronico: userEmail,
                            nombre_usuario: userName,
                            Url_foto_perfil: profilePictureUrl
                        },
                        Fecha_publicacion: new Date().toISOString().split("T")[0],
                        Contenido: text,
                        Url_imagen: image,
                        Url_video: video,
                        Lat: latitude,
                        Long: longitude,
                        Me_gusta: 0,
                        Comentarios: 0,
                        Compartidos: 0
                    }}
                    onImageClick={setImagenSeleccionada}
                />

                <ImageModal
                    image={imagenSeleccionada}
                    onClose={() => setImagenSeleccionada(null)}
                />

                <Flex w="100%" mt="auto" justify="center" align="center">
                    <Box w="50%" textAlign="start">
                        <Button
                            bg="white"
                            color="black"
                            _hover={{ bg: "gray.200" }}
                            onClick={() => navigate("/create-publication")}
                            borderRadius="1rem"
                        >
                            Regresar
                        </Button>
                    </Box>
                    <Box w="50%" textAlign="end">
                        <Button
                            bg="white"
                            color="black"
                            _hover={{ bg: "gray.200" }}
                            onClick={handleValidatePublicationPublicate}
                            borderRadius="1rem"
                        >
                            {!isSendingForm ? "Publicar" : (
                                <Flex justify="center" align="center">
                                    <Text mr={3}>Publicando...</Text>
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

export default PreviewPublication;
