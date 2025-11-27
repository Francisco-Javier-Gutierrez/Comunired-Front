import React, { useState, useEffect } from "react";
import axios from "axios";
import { goTo, BackendApi } from "../utils/globalVariables";

const notificacionesIniciales = [
    {
        Id_notificacion: "0001",
        Correo_destinatario: "chinopaco.05@gmail.com",
        Correo_emisor: "franchescojavini@gmail.com",
        Id_comentario: "com0001",
        Mensaje: "Franchesco ha comentado tu publicación",
        Fecha_publicacion: "2025-12-12",
        Usuario: { nombre_usuario: "Franchesco", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
    },
    {
        Id_notificacion: "0002",
        Correo_destinatario: "chinopaco.05@gmail.com",
        Correo_emisor: "anadidgiles@gmail.com",
        Id_comentario: "com0002",
        Mensaje: "Francely ha comentado tu publicación",
        Fecha_publicacion: "2025-12-12",
        Usuario: { nombre_usuario: "Francely", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
    }
];

function Notifications() {
    const [notificaciones, setNotificaciones] = useState(notificacionesIniciales);

    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url,{}, { withCredentials: true })
            .catch(() => {
                goTo("/login");
            });
    }, []);

    const eliminarNotificacion = (id: string) => {
        setNotificaciones(prev => prev.filter(n => n.Id_notificacion !== id));
    };

    const hasNotificaciones = notificaciones.length > 0;
    const isEmpty = !hasNotificaciones;

    return (
        <div className="text-center flex-column min-vh-100">
            <h1 className="text-white mb-5 text-center">Notificaciones</h1>

            {isEmpty && <p className="text-white text-center">No tienes notificaciones</p>}

            {hasNotificaciones && (
                <div className="d-flex w-75 mx-auto flex-column">
                    {notificaciones.map((noti) => (
                        <React.Fragment key={noti.Id_notificacion}>
                            <div className="d-flex align-items-start p-1 mb-3 w-100 text-white justify-content-between notifications-container">
                                <div className="mb-2">
                                    <img
                                        src={noti.Usuario.Url_foto_perfil ?? "/Profile.svg"}
                                        alt={noti.Usuario.nombre_usuario}
                                        className="cursor-pointer no-select me-2 rounded-circle me-1 user-notification-image"
                                        onClick={() => eliminarNotificacion(noti.Id_notificacion)}
                                    />
                                    <span>{noti.Mensaje}</span>
                                </div>

                                <img
                                    src="/Cancel-white.svg"
                                    className="notification-image cursor-pointer m-1"
                                    alt=""
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
