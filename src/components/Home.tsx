import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Flex, Heading, Spinner } from "@chakra-ui/react";
import { apiRoutes, getToken, isUserAuthenticated } from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";

function Home() {
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    useEffect(() => {
        setIsLoadingPublications(true);

        const loadPublications = async () => {
            try {
                const isAuth = await isUserAuthenticated();
                const token = isAuth ? await getToken() : null;

                const res = await axios.get(
                    (isAuth ?
                        apiRoutes.list_publications_user_auth_url :
                        apiRoutes.list_publications_url),
                    {
                        ...(isAuth && {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    }
                );

                setPublicaciones(res.data);
            } catch (err) {
                console.error("Error al cargar publicaciones:", err);
            } finally {
                setIsLoadingPublications(false);
            }
        };

        loadPublications();
    }, []);

    if (isLoadingPublications) return (
        <Flex minH="100vh" justify="center" align="center">
            <Spinner size="xl" color="white" boxSize="15rem" borderWidth="8px" />
        </Flex>
    );

    if (!publicaciones) return <Flex minH="100vh" justify="center" align="center"><Heading size="4xl" color="white">No hay publicación para mostrar</Heading></Flex>;

    return (
        <Box display="flex" justifyContent="center" py={4}>
            <Box w={["90%", "75%"]} mx="auto">
                <>
                    {publicaciones.map(post => (
                        <PublicationCard
                            key={post.Id_publicacion}
                            post={post}
                            onImageClick={setImagenSeleccionada}
                        />
                    ))}

                    <ImageModal
                        image={imagenSeleccionada}
                        onClose={() => setImagenSeleccionada(null)}
                    />

                </>
            </Box>
        </Box>
    );
}

export default Home;
