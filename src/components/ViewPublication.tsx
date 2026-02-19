import { useState, useEffect } from "react";
import axios from "axios";
import {
    apiRoutes,
    useSearchParamsGlobal,
    getToken,
    isUserAuthenticated
} from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import PublicationComments from "./PublicationComments";
import { Flex, Box, Heading, Spinner } from "@chakra-ui/react";

function ViewPublication() {
    const [publication, setPublication] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [showCommentInput, setShowCommentInput] = useState(false);

    const searchParams = useSearchParamsGlobal();
    const publicationId = searchParams.get("post");

    useEffect(() => {
        if (!publicationId) {
            setError("No se proporcionó un ID de publicación.");
            return;
        }

        setIsLoading(true);

        const loadPublication = async () => {
            try {
                const isAuth = await isUserAuthenticated();
                const token = isAuth ? await getToken() : null;
                const res = await axios.post(
                    (isAuth ? apiRoutes.list_publication_user_auth_url : apiRoutes.list_publication_url),
                    { Id_publicacion: publicationId },
                    {
                        withCredentials: true,
                        ...(isAuth && {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    }
                );

                setPublication(res.data);
            } catch (err) {
                console.error("Error al cargar la publicación:", err);
                setError("Error al obtener la publicación");
            } finally {
                setIsLoading(false);
            }
        };

        loadPublication();
    }, [publicationId]);

    const handleCommentAdded = () => {
        setPublication((prev: any) => {
            if (!prev) return prev;
            const prevComentarios = prev.comentarios ?? { total: 0, lista: [] };
            return {
                ...prev,
                comentarios: {
                    ...prevComentarios,
                    total: prevComentarios.total + 1
                }
            };
        });
    };

    const handleCommentDeleted = () => {
        setPublication((prev: any) => {
            if (!prev) return prev;
            const prevComentarios = prev.comentarios ?? { total: 0, lista: [] };
            return {
                ...prev,
                comentarios: {
                    ...prevComentarios,
                    total: Math.max(0, prevComentarios.total - 1)
                }
            };
        });
    };

    if (isLoading) return (
        <Flex minH="100vh" justify="center" align="center">
            <Spinner size="xl" color="white" boxSize="15rem" borderWidth="8px" />
        </Flex>
    );

    if (error) return <Flex minH="100vh" justify="center" align="center"><Heading color="red.500">{error}</Heading></Flex>;
    if (!publication) return <Flex minH="100vh" justify="center" align="center"><Heading textAlign="center" size="4xl" color="white">No hay publicación para mostrar</Heading></Flex>;

    return (
        <Flex direction="column" w={["90%", "75%"]} mx="auto" minH="100vh" py={4}>
            <PublicationCard
                post={publication}
                onImageClick={setImagenSeleccionada}
                onClickComent={() => setShowCommentInput(prev => !prev)}
            />

            <Box as="hr" borderColor="white" mt={3} mb={0} />
            <Heading as="h6" size="sm" color="white" my={2}>Comentarios</Heading>
            <Box as="hr" borderColor="white" mb={3} mt={0} />

            <PublicationComments
                publication={publication}
                showInput={showCommentInput}
                setShowInput={setShowCommentInput}
                onImageClick={setImagenSeleccionada}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
            />

            <ImageModal
                image={imagenSeleccionada}
                onClose={() => setImagenSeleccionada(null)}
            />
        </Flex>
    );
}

export default ViewPublication;
