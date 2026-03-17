import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Image, VStack, Button } from "@chakra-ui/react";
import { useNotificationStore } from "../utils/NotificationStore";
import { SkeletonNotification } from "./Skeletons";

function Notifications() {
    const navigate = useNavigate();
    const [notificaciones, setNotificaciones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isClearing, setIsClearing] = useState<boolean>(false);
    const setHasUnreadNotifications = useNotificationStore((state) => state.setHasUnreadNotifications);

    useEffect(() => {
        setIsLoading(true);
        const loadNotifications = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(apiRoutes.messages_account_url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = res.data.notifications || [];
                setNotificaciones(data);

                if (data.length === 0) {
                    setHasUnreadNotifications(false);
                }
            } catch {
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const leerNotificacion = async (id: string) => {
        const previousNotifications = [...notificaciones];
        const token = await getToken();

        setNotificaciones(prev => {
            const newNotifs = prev.filter(n => n.id_notificacion !== id);
            if (newNotifs.length === 0) {
                setHasUnreadNotifications(false);
            }
            return newNotifs;
        });

        try {
            await axios.post(
                apiRoutes.read_notification_url,
                { Id_notificacion: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch {
            setNotificaciones(previousNotifications);
            setHasUnreadNotifications(previousNotifications.length > 0);
        }
    };

    const handleClearAll = async () => {
        const previousNotifications = [...notificaciones];
        setIsClearing(true);
        setNotificaciones([]);
        setHasUnreadNotifications(false);

        try {
            const token = await getToken();
            await axios.post(
                apiRoutes.delete_all_notifications_url,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error(error);
            setNotificaciones(previousNotifications);
            setHasUnreadNotifications(previousNotifications.length > 0);
        } finally {
            setIsClearing(false);
        }
    };

    const hasNotificaciones = notificaciones.length > 0;

    return (
        <Flex direction="column" minH="100vh" textAlign="center">
            <Flex w={["90%", "75%"]} mx="auto" mb={4} justify="space-between" align="center" mt={3}>
                <Heading as="h1" size="4xl" color="white" textAlign="left">Notificaciones</Heading>
                {hasNotificaciones && (
                    <Button
                        size="sm"
                        bg="transparent"
                        color="red.400"
                        _hover={{ bg: "rgba(255,0,0,0.15)" }}
                        onClick={handleClearAll}
                        disabled={isClearing}
                        fontWeight="bold"
                    >
                        {isClearing ? "Limpiando..." : "Limpiar Todo"}
                    </Button>
                )}
            </Flex>

            {isLoading && (
                <VStack w={["90%", "75%"]} mx="auto" gap={3}>
                    <SkeletonNotification />
                    <SkeletonNotification />
                    <SkeletonNotification />
                    <SkeletonNotification />
                    <SkeletonNotification />
                    <SkeletonNotification />
                    <SkeletonNotification />
                </VStack>
            )}

            {!isLoading && !hasNotificaciones && (
                <Text color="white" textAlign="center">No tienes notificaciones</Text>
            )}

            {!isLoading && hasNotificaciones && (
                <VStack w={["90%", "75%"]} mx="auto" gap={3}>
                    {notificaciones.map((noti) => (
                        <React.Fragment key={noti.id_notificacion}>
                            <Flex
                                align="start"
                                p={1}
                                mb={3}
                                w="100%"
                                color="white"
                                justify="space-between"
                                bg="#8A8A8A"
                                borderRadius="md"
                                cursor="pointer"
                                onClick={() => {
                                    leerNotificacion(noti.id_notificacion);
                                    navigate("/publication?post=" + noti.id_publicacion);
                                }}
                            >
                                <Flex mb={2} align="center">
                                    <Image
                                        src={noti.usuario?.url_foto_perfil ?? "/Profile.svg"}
                                        alt={noti.usuario?.nombre_usuario ?? "Usuario"}
                                        cursor="pointer"
                                        userSelect="none"
                                        mr={2}
                                        borderRadius="full"
                                        boxSize="1.3rem"
                                    />
                                    <Box>
                                        <Text as="span">{noti.mensaje}</Text>
                                    </Box>
                                </Flex>

                                <Image
                                    src="/Cancel-white.svg"
                                    cursor="pointer"
                                    m={1}
                                    boxSize="1rem"
                                    alt="Eliminar"
                                    filter="none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        leerNotificacion(noti.id_notificacion);
                                    }}
                                />
                            </Flex>
                        </React.Fragment>
                    ))}
                </VStack>
            )}
        </Flex>
    );
}

export default Notifications;
