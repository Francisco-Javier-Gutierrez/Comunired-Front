import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiRoutes, useSearchParamsGlobal, isUserAuthenticated, getToken } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { Box, Flex, Heading, Text, Image, VStack } from "@chakra-ui/react";
import { SkeletonProfileHeader, SkeletonFeed } from "./Skeletons";
import InfiniteScroll from "react-infinite-scroll-component";

function UserProfile() {
  const navigate = useNavigate();
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const searchParams = useSearchParamsGlobal();
  const { email: globalEmail } = useUserData();

  const userEmail = searchParams.get("user");

  useEffect(() => {
    if (userEmail === globalEmail) {
      navigate("/my-profile");
    }
  }, [userEmail, globalEmail, navigate]);

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadUserFeed = async (pageNumber: number, isInitial: boolean = false) => {
    if (isInitial) {
      setIsLoading(true);
      setUserNotFound(false);
    }
    try {
      const isAuth = await isUserAuthenticated();
      const token = isAuth ? await getToken() : null;
      const res = await axios.post((
        isAuth ? apiRoutes.list_user_publications_user_auth_url :
          apiRoutes.list_user_publications_url),
        { Correo_electronico: userEmail },
        {
          params: { page: pageNumber, limit: 10 },
          ...(isAuth && {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        }
      );

      setProfilePictureUrl(res.data.usuario?.Url_foto_perfil || "");
      setUserName(res.data.usuario?.nombre_usuario || "Usuario");

      let newPosts = [];
      let more = false;

      if (Array.isArray(res.data.publicaciones)) {
        newPosts = res.data.publicaciones;
        more = false;
      } else if (res.data.publicaciones) {
        newPosts = res.data.publicaciones;
        more = res.data.hasMore ?? false;
      } else if (Array.isArray(res.data)) {
        newPosts = res.data;
        more = false;
      }

      setPosts(prev => pageNumber === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(more);
    } catch (err: any) {
      if (err?.response?.data?.error === "Usuario no encontrado" || err?.response?.status === 404) {
        if (isInitial) setUserNotFound(true);
      }
      setHasMore(false);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const fetchMoreData = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUserFeed(nextPage);
  };

  useEffect(() => {
    if (!userEmail) return;
    loadUserFeed(1, true);
  }, [userEmail]);

  if (userNotFound) {
    return <Heading textAlign="center" color="red.500" fontWeight="bold" fontSize="6xl" mt={5}>¡USUARIO NO ENCONTRADO!</Heading>;
  }

  if (isLoading) return <SkeletonProfileHeader isMyProfile={false} />;

  return (
    <Flex justify="center" minH="100vh">
      <VStack w={["90%", "75%"]} minH="100dvh" maxW="container.md" align="stretch" gap={4}>
        <Box textAlign="center">
          <Heading as="h1" size="4xl" color="white" mb={4}>Perfil de {userName}</Heading>
          <Image
            mb={4}
            mx="auto"
            borderRadius="full"
            cursor="pointer"
            src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"}
            alt="Profile Image"
            onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")}
            w={{ base: "50%", md: "20%", lg: "15%", xl: "10%" }}
            maxH="10rem"
            maxW="8rem"
            objectFit="cover"
          />
        </Box>

        <Text color="white" fontWeight="bold">Nombre de usuario:</Text>
        <Text color="white" mb={5}>{userName}</Text>
        <Text color="white" fontWeight="bold">Correo Electrónico:</Text>
        <Text color="white" mb={5}>{userEmail}</Text>

        <Box as="hr" borderColor="white" my={4} />

        <Heading as="h3" size="lg" color="white" mb={5} textAlign="center">Publicaciones de {userName}</Heading>
        {posts.length === 0 ? <Text color="white" textAlign="center">{userName} no tiene publicaciones</Text> : (
          <InfiniteScroll
            dataLength={posts.length}
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
            {posts.map((post: any) => <PublicationCard key={post.Id_publicacion} post={post} onImageClick={setImagenSeleccionada} />)}
          </InfiniteScroll>
        )}

        <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
      </VStack>
    </Flex>
  );
}

export default UserProfile;
