import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiRoutes, useSearchParamsGlobal, isUserAuthenticated, getToken } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { Box, Flex, Heading, Text, Image, VStack, Spinner } from "@chakra-ui/react";

function UserProfile() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const searchParams = useSearchParamsGlobal();
  const { email: globalEmail } = useUserData();

  const userEmail = searchParams.get("user");

  useEffect(() => {
    if (userEmail === globalEmail) {
      navigate("/my-profile");
    }
  }, [userEmail, globalEmail, navigate]);

  useEffect(() => {
    if (!userEmail) return;

    const loadUserFeed = async () => {
      setIsLoading(true);
      try {
        const isAuth = await isUserAuthenticated();
        const token = isAuth ? await getToken() : null;
        const res = await axios.post((
          isAuth ? apiRoutes.list_user_publications_user_auth_url :
            apiRoutes.list_user_publications_url),
          { Correo_electronico: userEmail },
          {
            ...(isAuth && {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          }
        );

        setProfilePictureUrl(res.data.usuario.Url_foto_perfil);
        setUserName(res.data.usuario.nombre_usuario);
        setPosts(res.data.publicaciones);
      } catch (err: any) {
        if (err?.response?.data?.error === "Usuario no encontrado") {
          setUserNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFeed();
  }, [userEmail]);

  if (userNotFound) {
    return <Heading textAlign="center" color="red.500" fontWeight="bold" fontSize="6xl" mt={5}>¡USUARIO NO ENCONTRADO!</Heading>;
  }

  if (isLoading) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

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
          <>
            {posts.map((post: any) => <PublicationCard key={post.Id_publicacion} post={post} onImageClick={setImagenSeleccionada} />)}
          </>
        )}

        <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
      </VStack>
    </Flex>
  );
}

export default UserProfile;
