import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { apiRoutes, getToken, isUserAuthenticated } from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { SkeletonFeed } from "./Skeletons";
import InfiniteScroll from "react-infinite-scroll-component";

function Home() {
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState(true);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    // Pagination specific states
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadPublications = async (pageNumber: number) => {
        try {
            const isAuth = await isUserAuthenticated();
            const token = isAuth ? await getToken() : null;

            const url = isAuth ? apiRoutes.list_publications_user_auth_url : apiRoutes.list_publications_url;
            const res = await axios.get(url, {
                params: { page: pageNumber, limit: 10 },
                ...(isAuth && {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            });

            // Fallback for current backend vs. new paginated backend response scheme
            let newPosts = [];
            let more = false;

            if (Array.isArray(res.data)) {
                newPosts = res.data;
                more = false; // The old endpoint returns everything at once
            } else {
                newPosts = res.data.publicaciones || [];
                more = res.data.hasMore ?? false;
            }

            setPublicaciones(prev => pageNumber === 1 ? newPosts : [...prev, ...newPosts]);
            setHasMore(more);
        } catch {
            setHasMore(false);
        } finally {
            setIsLoadingPublications(false);
        }
    };

    useEffect(() => {
        setIsLoadingPublications(true);
        loadPublications(1);
    }, []);

    const fetchMoreData = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPublications(nextPage);
    };

    if (isLoadingPublications) return (
        <Box display="flex" justifyContent="center" py={4}>
            <Box w={["90%", "75%"]} mx="auto">
                <SkeletonFeed count={3} />
            </Box>
        </Box>
    );

    if (!publicaciones) return <Flex minH="100vh" justify="center" align="center"><Heading size="4xl" color="white">No hay publicación para mostrar</Heading></Flex>;

    return (
        <Box display="flex" justifyContent="center" py={4}>
            <Box w={["90%", "75%"]} mx="auto">
                <InfiniteScroll
                    dataLength={publicaciones.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<Box mt={4}><SkeletonFeed count={1} /></Box>}
                    endMessage={
                        <Text color="gray.500" textAlign="center" mt={6} mb={4} fontSize="sm">
                            No hay más publicaciones por cargar
                        </Text>
                    }
                    style={{ overflow: 'hidden' }}
                >
                    {publicaciones.map(post => (
                        <PublicationCard
                            key={post.Id_publicacion}
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
