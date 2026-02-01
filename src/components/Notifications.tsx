import React, { useEffect, useState } from "react";
import axios from "axios";
import { goTo, BackendApi, getToken } from "../utils/globalVariables";

function Notifications() {
    const [notificaciones, setNotificaciones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const loadNotifications = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(BackendApi.messages_account_url, {
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
                BackendApi.read_notification_url,
                { Id_notificacion: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotificaciones(prev =>
                prev.filter(n => n.Id_notificacion !== id)
            );
        } catch (err) {
            console.error("Error leyendo notificación:", err);
        }
    };

    const hasNotificaciones = notificaciones.length > 0;

    return (
        <div className="text-center flex-column min-dvh-100">
            <h1 className="text-white mb-5 text-center">Notificaciones</h1>

            {isLoading && (
                <div className="big-loader"></div>
            )}

            {!isLoading && !hasNotificaciones && (
                <p className="text-white text-center">No tienes notificaciones</p>
            )}

            {!isLoading && hasNotificaciones && (
                <div className="d-flex w-75 mx-auto flex-column">
                    {notificaciones.map((noti) => (
                        <React.Fragment key={noti.Id_notificacion}>
                            <div
                                className="d-flex align-items-start p-1 mb-3 w-100 text-white justify-content-between notifications-container cursor-pointer"
                                onClick={() => {
                                    leerNotificacion(noti.Id_notificacion);
                                    goTo("/publication?post=" + noti.Id_objetivo);
                                }}
                            >
                                <div className="mb-2 d-flex align-items-center">
                                    <img
                                        src={noti.Usuario?.Url_foto_perfil ?? "/Profile.svg"}
                                        alt={noti.Usuario?.nombre_usuario ?? "Usuario"}
                                        className="cursor-pointer no-select me-2 rounded-circle me-1 user-notification-image"
                                    />
                                    <div>
                                        <span>{noti.Mensaje}</span>
                                    </div>
                                </div>

                                <img
                                    src="/Cancel-white.svg"
                                    className="notification-image cursor-pointer m-1"
                                    alt="Eliminar"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        leerNotificacion(noti.Id_notificacion);
                                    }}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notifications;
