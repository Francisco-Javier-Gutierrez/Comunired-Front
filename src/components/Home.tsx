import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Publication } from "../types";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { SkeletonFeed } from "./Skeletons";
import InfiniteScroll from "react-infinite-scroll-component";

const PAGE_SIZE = 10;

function Home() {
    const navigate = useNavigate();
    const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const isRequestInFlight = useRef(false);

    const loadPublications = useCallback(async (token?: string | null, replace = false) => {
        if (isRequestInFlight.current) return;

        isRequestInFlight.current = true;
        setErrorMessage(null);

        if (replace) {
            setIsLoadingPublications(true);
        } else if (token) {
            setIsLoadingMore(true);
        }

        try {
            const { items, hasMore: more, nextToken: newNextToken } = await api.publications.list(PAGE_SIZE, token);
            setPublicaciones(prev => replace || !token ? items : [...prev, ...items]);
            setHasMore(more);
            setNextToken(newNextToken ?? null);
        } catch {
            setErrorMessage("No pudimos cargar las publicaciones. Revisa tu conexión e intenta de nuevo.");
            setHasMore(false);
        } finally {
            setIsLoadingPublications(false);
            setIsLoadingMore(false);
            isRequestInFlight.current = false;
        }
    }, []);

    useEffect(() => {
        loadPublications(null, true);
    }, [loadPublications]);

    const fetchMoreData = () => {
        if (!nextToken || isLoadingMore) return;
        loadPublications(nextToken);
    };

    const refreshPublications = () => {
        loadPublications(null, true);
    };

    if (isLoadingPublications) return (
        <Box display="flex" justifyContent="center" py={4}>
            <Box w={["90%", "75%"]} maxW="760px" mx="auto">
                <SkeletonFeed count={3} />
            </Box>
        </Box>
    );

    const hasPublications = publicaciones.length > 0;

    if (!hasPublications) return (
        <Flex minH="70dvh" justify="center" align="center" px={4}>
            <Flex
                direction="column"
                align="center"
                textAlign="center"
                gap={4}
                w="100%"
                maxW="520px"
                color="var(--text-color)"
            >
                <Heading size={["2xl", "3xl"]}>
                    {errorMessage ? "No se pudo cargar el feed" : "Todavía no hay publicaciones"}
                </Heading>
                <Text color="var(--muted-color)" fontSize="md">
                    {errorMessage ?? "Sé el primero en compartir una actualización con la comunidad."}
                </Text>
                <Flex gap={3} wrap="wrap" justify="center">
                    <Button
                        bg="var(--button-bg)"
                        color="var(--button-text)"
                        borderRadius="1rem"
                        _hover={{ bg: "var(--button-hover-bg)" }}
                        onClick={refreshPublications}
                    >
                        <FiRefreshCw />
                        Reintentar
                    </Button>
                    {!errorMessage && (
                        <Button
                            variant="outline"
                            borderColor="var(--border-color)"
                            color="var(--text-color)"
                            borderRadius="1rem"
                            _hover={{ bg: "var(--surface-hover)" }}
                            onClick={() => navigate("/create-publication")}
                        >
                            <FiPlus />
                            Crear publicación
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );

    return (
        <Box display="flex" justifyContent="center" py={4}>
            <Box w={["90%", "75%"]} maxW="760px" mx="auto">
                <Flex align="center" justify="space-between" gap={3} mb={2}>
                    <Box>
                        <Heading as="h1" size={["2xl", "3xl"]} color="var(--text-color)">
                            Inicio
                        </Heading>
                        <Text color="var(--muted-color)" fontSize="sm">
                            {publicaciones.length} publicaciones cargadas
                        </Text>
                    </Box>
                    <Button
                        size="sm"
                        variant="ghost"
                        color="var(--text-color)"
                        borderRadius="full"
                        disabled={isRequestInFlight.current}
                        onClick={refreshPublications}
                        _hover={{ bg: "var(--surface-hover)" }}
                    >
                        <FiRefreshCw />
                        Actualizar
                    </Button>
                </Flex>

                {errorMessage && (
                    <Flex
                        role="alert"
                        align="center"
                        justify="space-between"
                        gap={3}
                        mb={3}
                        px={4}
                        py={3}
                        bg="var(--card-bg)"
                        border="1px solid var(--border-color)"
                        borderRadius="md"
                    >
                        <Text color="var(--text-color)" fontSize="sm">{errorMessage}</Text>
                        <Button
                            size="xs"
                            variant="ghost"
                            color="var(--text-color)"
                            onClick={refreshPublications}
                            _hover={{ bg: "var(--surface-hover)" }}
                        >
                            Reintentar
                        </Button>
                    </Flex>
                )}

                <InfiniteScroll
                    dataLength={publicaciones.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<Box mt={4}><SkeletonFeed count={1} /></Box>}
                    endMessage={
                        !errorMessage ? (
                            <Text color="var(--muted-color)" textAlign="center" mt={6} mb={4} fontSize="sm">
                                No hay más publicaciones por cargar
                            </Text>
                        ) : null
                    }
                    style={{ overflow: "hidden" }}
                >
                    {publicaciones.map(post => (
                        <PublicationCard
                            key={post.id}
                            post={post}
                            onImageClick={setImagenSeleccionada}
                        />
                    ))}
                </InfiniteScroll>

                <ImageModal
                    image={imagenSeleccionada}
                    onClose={() => setImagenSeleccionada(null)}
                />
            </Box>
        </Box>
    );
}

export default Home;
