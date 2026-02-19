import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Heading, Text, Spinner, Image, VStack } from "@chakra-ui/react";

function Notifications() {
    const navigate = useNavigate();
    const [notificaciones, setNotificaciones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
            } catch (err) {
                console.error("Error consultando notificaciones:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const leerNotificacion = async (id: string) => {

        const token = await getToken();
        try {
            await axios.post(
                apiRoutes.read_notification_url,
                { Id_notificacion: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotificaciones(prev =>
                prev.filter(n => n.id_notificacion !== id)
            );
        } catch (err) {
            console.error("Error leyendo notificación:", err);
        }
    };

    const hasNotificaciones = notificaciones.length > 0;

    return (
        <Flex direction="column" minH="100vh" textAlign="center">
            <Heading as="h1" size="4xl" color="white" mb={4}>Notificaciones</Heading>

            {isLoading && (
                <Flex justify="center" mt="5rem">
                    <Spinner size="xl" color="white" boxSize="15rem" borderWidth="8px" />
                </Flex>
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
                                    navigate("/publication?post=" + noti.id_objetivo);
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
