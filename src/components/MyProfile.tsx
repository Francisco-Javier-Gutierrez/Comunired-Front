import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import ConfirmModal from "./modals/ConfirmModal";
import { signOut, fetchMFAPreference, updateMFAPreference } from "aws-amplify/auth";
import type { AuthContext } from "./layouts/LoggedLayout";
import { Box, Flex, Heading, Text, Image, Button, VStack, Spinner, Separator } from "@chakra-ui/react";

export default function MyProfile() {
  const navigate = useNavigate();
  const authContext = useOutletContext<AuthContext>();
  const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    setName(authContext.name);
    setEmail(authContext.email);
    setProfilePictureUrl(authContext.picture);

    (async () => {
      try {
        const token = await getToken();

        const listRes = await axios.post(
          apiRoutes.list_user_publications_user_auth_url,
          { Correo_electronico: email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );

        if (!mounted) return;

        const raw =
          listRes.data.publicaciones ??
          listRes.data.mezclados ??
          listRes.data ??
          [];

        const normalized = Array.isArray(raw)
          ? raw
            .map((item: any) => item?.data ?? item)
            .filter((p: any) => p?.Id_publicacion)
          : [];

        setPosts(normalized);

      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 403) {
          if (mounted) setIsBannedUser(true);
        } else if (status === 401) {
          navigate("/login");
        } else {
          console.error("Error cargando perfil:", err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    (async () => {
      try {
        const mfaPreference = await fetchMFAPreference();
        setMfaEnabled(mfaPreference.preferred === "TOTP");
      } catch {
        setMfaEnabled(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirm = async () => {
    setIsLoadingAction(true);
    try {
      if (accion === "cerrar") {
        await signOut();
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
    } catch (err) {
      console.error("Error en acción de cuenta:", err);
    } finally {
      setIsLoadingAction(false);
      setAccion(null);
    }
  };

  if (isBannedUser) return (
    <Heading textAlign="center" color="red.500" fontWeight="bold" fontSize="6xl" mt={5}>USUARIO BLOQUEADO</Heading>
  );

  if (isLoading) return (
    <Flex minH="100vh" justify="center" align="center">
      <Spinner size="xl" color="white" boxSize="15rem" borderWidth="8px" />
    </Flex>
  );

  return (
    <Flex justify="center" minH="100vh">
      <VStack w={["90%", "75%"]} maxW="container.md" gap={4} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="4xl" color="white" mb={4}>Tu perfil</Heading>
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

        <Text color="white" fontWeight="bold">Nombre de usuario:</Text>
        <Text color="white" mb={5}>{name}</Text>
        <Text color="white" fontWeight="bold">Correo Electrónico:</Text>
        <Text color="white" mb={5}>{email}</Text>

        <Text color="white" fontWeight="bold">Autenticación de Dos Factores (MFA):</Text>
        <Text color="white" mb={3}>
          {mfaEnabled ? "✅ Activada" : "❌ Desactivada"}
        </Text>

        {mfaEnabled ? (
          <Button
            bg="white"
            color="black"
            _hover={{ bg: "gray.200" }}
            mb={5}
            borderRadius="1rem"
            onClick={() => setAccion("desactivarMFA")}
            w="fit-content"
          >
            Desactivar MFA
          </Button>
        ) : (
          <Button
            bg="white"
            color="black"
            _hover={{ bg: "gray.200" }}
            mb={5}
            borderRadius="1rem"
            onClick={() => navigate("/setup-mfa")}
            w="fit-content"
          >
            Configurar MFA
          </Button>
        )}

        <Flex py={4} align="center" justify="space-around" wrap="wrap" gap={4}>
          <Button
            bg="white"
            color="black"
            _hover={{ bg: "gray.200" }}
            w={["100%", "30%"]}
            borderRadius="1rem"
            onClick={() => navigate("/edit-profile")}
          >
            Editar mi perfil
          </Button>
          <Button
            bg="white"
            color="black"
            _hover={{ bg: "gray.200" }}
            w={["100%", "30%"]}
            borderRadius="1rem"
            onClick={() => setAccion("cerrar")}
          >
            Cerrar sesión
          </Button>
        </Flex>

        <Separator borderColor="white" />

        <Heading as="h3" size="lg" color="white" mb={5} textAlign="center">Tus publicaciones</Heading>
        {posts.length === 0 ? <Text color="white" textAlign="center">No tienes publicaciones aún 😔</Text> : (
          <>
            {posts.map((post: any) => <PublicationCard key={post.Id_publicacion} post={post} onImageClick={setImagenSeleccionada} />)}
          </>
        )}

        <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
      </VStack>

      <ConfirmModal
        isOpen={accion !== null}
        title={
          accion === "desactivarMFA" ? "¿Estás seguro de que deseas desactivar MFA?" :
            "¿Estás seguro de que deseas cerrar sesión?"
        }
        isLoading={isLoadingAction}
        onConfirm={handleConfirm}
        onCancel={() => setAccion(null)}
      />
    </Flex>
  );
}
