import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParamsGlobal } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import { api } from "../services/api";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import ReportModal from "./modals/ReportModal";
import { Box, Flex, Heading, Text, Image, VStack, Button } from "@chakra-ui/react";
import ConfirmModal from "./modals/ConfirmModal";
import { SkeletonProfileHeader, SkeletonFeed } from "./Skeletons";
import InfiniteScroll from "react-infinite-scroll-component";
import { FiFlag, FiSlash, FiUserCheck, FiUserPlus, FiVolume2, FiVolumeX } from "react-icons/fi";
import type { Publication, ReportPayload } from "../types";

const formatRole = (role: string) => {
  const roles: Record<string, string> = {
    admin: "El patron",
    banned: "Baneado",
    moderator: "Moderador",
    user: "Usuario",
  };
  return roles[role] || role;
};

function UserProfile() {
  const navigate = useNavigate();
  const searchParams = useSearchParamsGlobal();
  const { email: globalEmail, role: globalRole } = useUserData();
  const userEmail = searchParams.get("user");

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [accion, setAccion] = useState<"make_moderator" | "remove_moderator" | "ban" | "unban" | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);

  const [posts, setPosts] = useState<Publication[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [userProfile, setUserProfile] = useState({
    pic: "",
    name: "",
    role: "user",
    isFollowing: false,
    isBlocked: false,
    isMuted: false,
  });

  const [status, setStatus] = useState({
    loading: false,
    notFound: false,
  });

  useEffect(() => {
    if (userEmail === globalEmail) {
      navigate("/my-profile");
    }
  }, [userEmail, globalEmail, navigate]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const loadUserFeed = useCallback(async (token: string | null = null, isInitial: boolean = false) => {
    if (!userEmail) return;
    if (isInitial) setStatus({ loading: true, notFound: false });

    try {
      const res = await api.publications.listByUser(userEmail, 10, token);

      if (res.userProfile) {
        setUserProfile({
          pic: res.userProfile.profilePicUrl || "",
          name: res.userProfile.username || "Usuario",
          role: res.userProfile.role || "user",
          isFollowing: !!res.userProfile.isFollowing,
          isBlocked: !!res.userProfile.isBlocked,
          isMuted: !!res.userProfile.isMuted,
        });
      }

      setPosts((prev) => (isInitial ? res.items : [...prev, ...res.items]));
      setHasMore(res.hasMore);
      setNextToken(res.nextToken ?? null);
    } catch (err: any) {
      if (err.message === "Usuario no encontrado" || err.message?.includes("404")) {
        if (isInitial) setStatus((prev) => ({ ...prev, notFound: true }));
      }
      setHasMore(false);
    } finally {
      if (isInitial) setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) loadUserFeed(null, true);
  }, [userEmail, loadUserFeed]);

  const fetchMoreData = () => {
    loadUserFeed(nextToken);
  };

  const handleConfirmAction = async () => {
    if (!userEmail || !accion) return;
    setIsLoadingAction(true);
    try {
      const actionMap: Record<string, (email: string) => Promise<any>> = {
        make_moderator: api.admin.makeModerator,
        remove_moderator: api.admin.removeModerator,
        ban: api.admin.banUser,
        unban: api.admin.unbanUser,
      };

      const mensajeExito: Record<string, string> = {
        make_moderator: "El usuario ahora es moderador",
        remove_moderator: "Se eliminaron los privilegios de moderador",
        ban: "El usuario ha sido baneado",
        unban: "El usuario ha sido desbaneado",
      };

      await actionMap[accion](userEmail);
      showToast(mensajeExito[accion]);

      setUserProfile((prev) => {
        let newRole = prev.role;
        if (accion === "make_moderator") newRole = "moderator";
        else if (accion === "remove_moderator") newRole = "user";
        else if (accion === "ban") newRole = "banned";
        else if (accion === "unban") newRole = "user";
        
        return { ...prev, role: newRole };
      });
    } catch {
      showToast(({
        make_moderator: "Hubo un problema al hacer moderador al usuario",
        remove_moderator: "Hubo un problema al eliminar privilegios",
        ban: "Hubo un problema al banear al usuario",
        unban: "Hubo un problema al desbanear al usuario",
      })[accion] || "Error desconocido");
    } finally {
      setIsLoadingAction(false);
      setAccion(null);
    }
  };

  const handleFollowToggle = async () => {
    if (!userEmail) return;
    const previous = userProfile.isFollowing;
    setUserProfile((prev) => ({ ...prev, isFollowing: !previous }));
    try {
      if (previous) {
        await api.social.unfollow(userEmail);
        showToast("Dejaste de seguir a este usuario");
      } else {
        await api.social.follow(userEmail);
        showToast("Ahora sigues a este usuario");
      }
    } catch {
      setUserProfile((prev) => ({ ...prev, isFollowing: previous }));
      showToast("No pudimos actualizar el seguimiento");
    }
  };

  const handleMuteToggle = async () => {
    if (!userEmail) return;
    const previous = userProfile.isMuted;
    setUserProfile((prev) => ({ ...prev, isMuted: !previous }));
    try {
      if (previous) {
        await api.social.unmute(userEmail);
        showToast("Usuario reactivado en tu feed");
      } else {
        await api.social.mute(userEmail);
        showToast("Usuario silenciado");
      }
    } catch {
      setUserProfile((prev) => ({ ...prev, isMuted: previous }));
      showToast("No pudimos actualizar el silencio");
    }
  };

  const handleBlockToggle = async () => {
    if (!userEmail) return;
    const previousBlocked = userProfile.isBlocked;
    const previousFollowing = userProfile.isFollowing;
    setUserProfile((prev) => ({ ...prev, isBlocked: !previousBlocked, isFollowing: previousBlocked ? prev.isFollowing : false }));
    try {
      if (previousBlocked) {
        await api.social.unblock(userEmail);
        showToast("Usuario desbloqueado");
      } else {
        await api.social.block(userEmail);
        showToast("Usuario bloqueado");
      }
    } catch {
      setUserProfile((prev) => ({ ...prev, isBlocked: previousBlocked, isFollowing: previousFollowing }));
      showToast("No pudimos actualizar el bloqueo");
    }
  };

  const handleReportUser = async (payload: ReportPayload) => {
    if (!userEmail) return;
    await api.social.report("user", userEmail, payload);
    showToast("Reporte enviado a moderacion");
  };

  const profileImage = userProfile.pic || "/Profile.svg";
  const isPrivileged = globalRole === "admin" || globalRole === "moderator";
  const isAdmin = globalRole === "admin";

  if (status.notFound) {
    return <Heading textAlign="center" color="red.500" fontWeight="bold" fontSize="6xl" mt={5}>USUARIO NO ENCONTRADO</Heading>;
  }

  if (status.loading) return <SkeletonProfileHeader isMyProfile={false} />;

  return (
    <Flex justify="center" minH="100vh">
      <VStack w={["90%", "75%"]} minH="100dvh" maxW="container.md" align="stretch" gap={4}>
        <Box textAlign="center">
          <Heading as="h1" size="4xl" color="var(--text-color)" mb={4}>Perfil de {userProfile.name}</Heading>
          <Image
            mb={4}
            mx="auto"
            borderRadius="full"
            cursor="pointer"
            src={profileImage}
            alt="Profile Image"
            onClick={() => setImagenSeleccionada(profileImage)}
            boxSize={["8rem", "9rem", "10rem", "11rem"]}
            objectFit="cover"
          />
        </Box>

        <Text color="var(--text-color)" fontWeight="bold">Nombre de usuario:</Text>
        <Text color="var(--text-color)" mb={5}>{userProfile.name}</Text>
        <Text color="var(--text-color)" fontWeight="bold">Correo Electronico:</Text>
        <Text color="var(--text-color)" mb={5}>{userEmail}</Text>

        <Flex py={2} align="center" justify="center" wrap="wrap" gap={3} mb={5}>
          <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} borderRadius="1rem" gap={2} onClick={handleFollowToggle} disabled={userProfile.isBlocked}>
            {userProfile.isFollowing ? <FiUserCheck /> : <FiUserPlus />}
            {userProfile.isFollowing ? "Siguiendo" : "Seguir"}
          </Button>
          <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} borderRadius="1rem" gap={2} onClick={handleMuteToggle} disabled={userProfile.isBlocked}>
            {userProfile.isMuted ? <FiVolume2 /> : <FiVolumeX />}
            {userProfile.isMuted ? "Reactivar" : "Silenciar"}
          </Button>
          <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} borderRadius="1rem" gap={2} onClick={handleBlockToggle}>
            {userProfile.isBlocked ? <FiUserCheck /> : <FiSlash />}
            {userProfile.isBlocked ? "Desbloquear" : "Bloquear"}
          </Button>
          <Button variant="ghost" color="red.400" borderRadius="1rem" gap={2} onClick={() => setShowReportModal(true)}>
            <FiFlag />
            Reportar
          </Button>
        </Flex>

        {isPrivileged && (
          <>
            <Text color="var(--text-color)" fontWeight="bold">Rol:</Text>
            <Text color="var(--text-color)" mb={5}>{formatRole(userProfile.role)}</Text>
            {isAdmin && userProfile.role !== "admin" && (
              <Flex py={2} align="center" justify="space-around" wrap="wrap" gap={4} mb={5}>
                {userProfile.role === "user" && (
                  <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} w={["100%", "30%"]} borderRadius="1rem" onClick={() => setAccion("make_moderator")}>
                    Hacer Moderador
                  </Button>
                )}
                {userProfile.role === "moderator" && (
                  <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} w={["100%", "30%"]} borderRadius="1rem" onClick={() => setAccion("remove_moderator")}>
                    Eliminar privilegios
                  </Button>
                )}
                {userProfile.role === "banned" ? (
                  <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} w={["100%", "30%"]} borderRadius="1rem" onClick={() => setAccion("unban")}>
                    Desbanear
                  </Button>
                ) : (
                  <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} w={["100%", "30%"]} borderRadius="1rem" onClick={() => setAccion("ban")}>
                    Banear
                  </Button>
                )}
                <Button bg="var(--button-bg)" color="var(--button-text)" _hover={{ bg: "var(--button-hover-bg)" }} w={["100%", "30%"]} borderRadius="1rem" onClick={() => navigate(`/edit-profile?user=${userEmail}`, { state: { userName: userProfile.name, userPic: userProfile.pic } })}>
                  Editar Perfil
                </Button>
              </Flex>
            )}
          </>
        )}

        <Box as="hr" borderColor="var(--text-color)" my={4} />

        <Heading as="h3" size="lg" color="var(--text-color)" mb={5} textAlign="center">Publicaciones de {userProfile.name}</Heading>
        {posts.length === 0 ? (
          <Text color="var(--text-color)" textAlign="center">{userProfile.name} no tiene publicaciones</Text>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<Box mt={4}><SkeletonFeed count={1} /></Box>}
            endMessage={<Text color="gray.500" textAlign="center" mt={6} mb={4} fontSize="sm">No hay mas publicaciones por cargar</Text>}
            style={{ overflow: "hidden" }}
          >
            {posts.map((post) => (
              <PublicationCard key={post.id} post={post} onImageClick={setImagenSeleccionada} />
            ))}
          </InfiniteScroll>
        )}

        <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
      </VStack>

      <ConfirmModal
        isOpen={accion !== null}
        title={
          accion === "make_moderator" ? "Estas seguro de que deseas hacer moderador a este usuario?" :
            accion === "remove_moderator" ? "Estas seguro de que deseas eliminar los privilegios de moderador?" :
              accion === "unban" ? "Estas seguro de que deseas desbanear a este usuario?" :
                "Estas seguro de que deseas banear a este usuario?"
        }
        isLoading={isLoadingAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setAccion(null)}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetLabel={`Perfil de ${userProfile.name || userEmail}`}
        onSubmit={handleReportUser}
      />

      {toastMessage && (
        <Box position="fixed" bottom="90px" left="50%" transform="translateX(-50%)" bg="var(--button-bg)" color="var(--button-text)" px={5} py={3} borderRadius="xl" fontWeight="bold" fontSize="sm" zIndex={9999} boxShadow="0 4px 20px rgba(0,0,0,0.4)">
          {toastMessage}
        </Box>
      )}
    </Flex>
  );
}

export default UserProfile;
