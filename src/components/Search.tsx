import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiRoutes, isUserAuthenticated, getToken } from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { Box, Flex, Heading, Input, Button, Spinner } from "@chakra-ui/react";

function normalizePublications(data: any[]) {
    return data.map(p => ({
        ...p,
        Id_publicacion: p.Id_publicacion ?? p.id_publicacion,
        Contenido: p.Contenido ?? p.contenido,
        Fecha_publicacion: p.Fecha_publicacion ?? p.fecha_publicacion,
        Url_imagen: p.Url_imagen ?? p.url_imagen,
        Url_video: p.Url_video ?? p.url_video,
        Lat: p.Lat ?? p.lat,
        Long: p.Long ?? p.long,
        Is_mine: p.Is_mine ?? p.is_mine,
        Usuario: p.Usuario ?? p.usuario ?? {
            nombre_usuario: "Usuario",
            Url_foto_perfil: null,
            Correo_electronico: null
        },
        is_Liked: p.is_Liked ?? p.is_liked,
        likes: p?.likes ?? { total: 0 },
        comentarios: p?.comentarios ?? { total: 0 },
        compartidos: p?.compartidos ?? { total: 0 },
    }));
}

function Search() {
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [resultados, setResultados] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const handleSearch = async () => {
        const lowered = text.toLowerCase().trim();
        if (!lowered) return;

        setHasSearched(true);

        setIsLoading(true);

        const isAuth = await isUserAuthenticated();

        const token = isAuth ? await getToken() : null;

        await axios.post(
            (isAuth ? apiRoutes.search_resources_user_auth_url : apiRoutes.search_resources_url),
            { texto: lowered },
            {
                ...(isAuth && {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            }
        )
            .then(res => {
                const pubs = normalizePublications(res.data ?? []);
                setResultados(pubs);
            })
            .catch(err => {
                console.error("Error en búsqueda:", err);
                setResultados([]);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <Box minH="100vh">
            <Heading as="h1" size="4xl" color="white" mb={4} textAlign="center">Buscador</Heading>

            <form
                style={{ width: "100%" }}
                onSubmit={e => {
                    e.preventDefault();
                    handleSearch();
                }}
            >
                <Flex w={["90%", "75%"]} mx="auto" justify="space-around" align="center" mb={5}>
                    <Flex w="100%" justify="space-between" align="center">
                        <Box w="75%">
                            <Input
                                type="text"
                                bg="#454545"
                                color="white"
                                _placeholder={{ color: "gray.400" }}
                                borderRadius="1rem"
                                borderColor="white"
                                w="100%"
                                value={text}
                                onChange={e => setText(e.target.value)}
                            />
                        </Box>
                        <Box w="25%" textAlign="center">
                            <Button
                                type="submit"
                                bg="white"
                                color="black"
                                w="75%"
                                _hover={{ bg: "gray.200" }}
                                borderRadius="1rem"
                            >
                                Buscar
                            </Button>
                        </Box>
                    </Flex>
                </Flex>
            </form>

            <Box w={["90%", "75%"]} mx="auto" mt={4}>
                {isLoading ? (
                    <Flex justify="center" mt={10}>
                        <Spinner
                            color='white'
                            size='xl'
                            w="15rem"
                            h="15rem"
                            borderWidth="4px"
                        />
                    </Flex>
                ) : (
                    <>
                        {resultados.map(post => (
                            <PublicationCard
                                key={post.Id_publicacion}
                                post={post}
                                onImageClick={setImagenSeleccionada}
                                onClick={() =>
                                    navigate(`/publication?post=${post.Id_publicacion}`)
                                }
                            />
                        ))}

                        {hasSearched && resultados.length === 0 && (
                            <Heading as="h1" size="4xl" color="white" mb={4} textAlign="center">
                                No se encontraron publicaciones.
                            </Heading>
                        )}
                    </>
                )}
            </Box>

            <ImageModal
                image={imagenSeleccionada}
                onClose={() => setImagenSeleccionada(null)}
            />
        </Box>
    );
}

export default Search;
