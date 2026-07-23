import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import ConfirmModal from "./modals/ConfirmModal";
import { signOut, fetchMFAPreference, updateMFAPreference } from "aws-amplify/auth";
import type { AuthContext } from "./layouts/LoggedLayout";
import { Box, Flex, Heading, Text, Image, Button, VStack, Separator } from "@chakra-ui/react";
import { SkeletonProfileHeader, SkeletonFeed } from "./Skeletons";
import InfiniteScroll from "react-infinite-scroll-component";


export default function MyProfile() {
  const navigate = useNavigate();
  const authContext = useOutletContext<AuthContext>();
  const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl, setRole, resetUser} = useUserData();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPublications = async (token: string | null = null, mounted: boolean = true) => {
    try {
      if (!authContext.email) return;

      const res = await api.publications.listByUser(authContext.email, 10, token);

      if (!mounted) return;

      if (res.userProfile) {
        setName(res.userProfile.username);
        setProfilePictureUrl(res.userProfile.profilePicUrl || null);
        setRole(res.userProfile.role);
        setIsBannedUser(res.userProfile.role === "banned");
      }

      setPosts(prev => token === null ? res.items : [...prev, ...res.items]);
      setHasMore(res.hasMore);
      setNextToken(res.nextToken ?? null);
    } catch (err: any) {
      const status = err.message?.includes("403") || err.response?.status === 403;
      if (status) {
        if (mounted) setIsBannedUser(true);
      } else if (err.message?.includes("401") || err.response?.status === 401) {
        navigate("/login");
      }
      setHasMore(false);
    } finally {
      if (mounted && token === null) setIsLoading(false);
    }
  };

  const fetchMoreData = () => {
    loadPublications(nextToken, true);
  };

  useEffect(() => {
    let mounted = true;

    setName(authContext.name);
    setEmail(authContext.email);
    setProfilePictureUrl(authContext.picture);

    if (authContext.email) {
      loadPublications(null, mounted);
    }

    (async () => {
      try {
        const mfaPreference = await fetchMFAPreference();
        if (mounted) setMfaEnabled(mfaPreference.preferred === "TOTP");
      } catch {
        if (mounted) setMfaEnabled(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authContext.email, authContext.name, authContext.picture]);
  const handleConfirm = async () => {
    setIsLoadingAction(true);
    try {
      if (accion === "cerrar") {
        await signOut();
        resetUser();
        navigate("/");
      } else if (accion === "desactivarMFA") {
        await updateMFAPreference({ totp: "DISABLED" });
        setMfaEnabled(false);
        return;
      }

      setName(null);
      setEmail(null);
      setProfilePictureUrl(null);
      navigate("/");
    } catch {
    } finally {
      setIsLoadingAction(false);
      setAccion(null);
    }
  };

  if (isLoading) return <SkeletonProfileHeader isMyProfile={true} />;

  return (
    <Flex justify="center" minH="100vh">
      <VStack w={["90%", "75%"]} maxW="container.md" gap={4} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="4xl" color="var(--text-color)" mb={4}>Tu perfil</Heading>
          <Image
            mb={4}
            mx="auto"
            borderRadius="full"
            cursor="pointer"
            src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"}
            alt="Profile Image"
            onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")}
            boxSize={["8rem", "9rem", "10rem", "11rem"]}
            objectFit="cover"
          />
        </Box>

        <Text color="var(--text-color)" fontWeight="bold">Nombre de usuario:</Text>
        <Text color="var(--text-color)" mb={5}>{name}</Text>
        <Text color="var(--text-color)" fontWeight="bold">Correo ElectrÃ³nico:</Text>
        <Text color="var(--text-color)" mb={5}>{email}</Text>

        <Text color="var(--text-color)" fontWeight="bold">AutenticaciÃ³n de Dos Factores (MFA):</Text>
        <Text color="var(--text-color)" mb={3}>
          {mfaEnabled ? "âœ… Activada" : "âŒ Desactivada"}
        </Text>

        {mfaEnabled ? (
          <Button
            bg="var(--button-bg)"
            color="var(--button-text)"
            _hover={{ bg: "var(--button-hover-bg)" }}
            mb={5}
            borderRadius="1rem"
            onClick={() => setAccion("desactivarMFA")}
            w="fit-content"
          >
            Desactivar MFA
          </Button>
        ) : (
          <Button
            bg="var(--button-bg)"
            color="var(--button-text)"
            _hover={{ bg: "var(--button-hover-bg)" }}
            mb={5}
            borderRadius="1rem"
            onClick={() => navigate("/setup-mfa")}
            w="fit-content"
          >
            Configurar MFA
          </Button>
        )}


        <Separator borderColor="#333" my={2} />

        <Flex py={2} align="center" justify="space-around" wrap="wrap" gap={4}>
          {!isBannedUser && (
            <Button
              bg="var(--button-bg)"
              color="var(--button-text)"
              _hover={{ bg: "var(--button-hover-bg)" }}
              w={["100%", "30%"]}
              borderRadius="1rem"
              onClick={() => navigate("/edit-profile")}
            >
              Editar mi perfil
            </Button>
          )}
          <Button
            bg="var(--button-bg)"
            color="var(--button-text)"
            _hover={{ bg: "var(--button-hover-bg)" }}
            w={["100%", "30%"]}
            borderRadius="1rem"
            onClick={() => setAccion("cerrar")}
          >
            Cerrar sesiÃ³n
          </Button>
        </Flex>

        <Separator borderColor="var(--text-color)" mt={2} mb={4} />

        <Heading as="h3" size="lg" color="var(--text-color)" mb={5} textAlign="center">Tus publicaciones</Heading>
        {posts.length === 0 ? <Text color="var(--text-color)" textAlign="center">No tienes publicaciones aÃºn ðŸ˜”</Text> : (
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<Box mt={4}><SkeletonFeed count={1} /></Box>}
            endMessage={
              <Text color="gray.500" textAlign="center" mt={6} mb={4} fontSize="sm">
                No hay mÃ¡s publicaciones por cargar
              </Text>
            }
            style={{ overflow: 'hidden' }}
          >
            {posts.map((post: any) => <PublicationCard key={post.id} post={post} onImageClick={setImagenSeleccionada} />)}
          </InfiniteScroll>
        )}

        <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
      </VStack>

      <ConfirmModal
        isOpen={accion !== null}
        title={
          accion === "desactivarMFA" ? "Â¿EstÃ¡s seguro de que deseas desactivar MFA?" :
            "Â¿EstÃ¡s seguro de que deseas cerrar sesiÃ³n?"
        }
        isLoading={isLoadingAction}
        onConfirm={handleConfirm}
        onCancel={() => setAccion(null)}
      />
    </Flex>
  );
}



