import React, { useState, useEffect } from "react";
import axios from "axios";
import { goTo, BackendApi } from "../utils/globalVariables";

function Notifications() {
    const [notificaciones, setNotificaciones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                await axios.post(BackendApi.auth_me_url, {}, { withCredentials: true });
                const res = await axios.get(BackendApi.messages_account_url, { withCredentials: true });
                const data = res.data.notifications || [];
                setNotificaciones(data);
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    return goTo("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const eliminarNotificacion = (id: string) => {
        setNotificaciones(prev => prev.filter(n => n.Id_notificacion !== id));
    };

    const hasNotificaciones = notificaciones.length > 0;

    return (
        <div className="text-center flex-column min-vh-100">
            <h1 className="text-white mb-5 text-center">Notificaciones</h1>

            {isLoading && <div className="big-loader"></div>}

            {!isLoading && !hasNotificaciones && (
                <p className="text-white text-center">No tienes notificaciones</p>
            )}

            {!isLoading && hasNotificaciones && (
                <div className="d-flex w-75 mx-auto flex-column">
                    {notificaciones.map((noti) => (
                        <React.Fragment key={noti.Id_notificacion}>
                            <div className="d-flex align-items-start p-1 mb-3 w-100 text-white justify-content-between notifications-container">
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
                                    onClick={() => eliminarNotificacion(noti.Id_notificacion)}
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
