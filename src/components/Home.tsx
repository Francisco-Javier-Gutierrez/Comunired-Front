import React, { useState, useEffect } from "react";
import axios from "axios";
import { BackendApi, goTo, paths } from "../utils/globalVariables";
import { formatFecha } from "../utils/globalVariables";

const reportes = [
    {
        Id_reporte: "rep-006",
        Correo_electronico_usuario: "lucia.morales@gmail.com",
        Servicio_reporte: "Transporte público",
        Descripcion_problema: "Los camiones están tardando demasiado en pasar por la ruta habitual",
        Direccion: "Colonia El Mirador, Tlatlaya, México",
        Nivel_urgencia: "Media",
        Foto_evidencia: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
        Nombre_reportante: "Lucía Morales Castillo",
        Contacto_reportante: "7227784412",
        Fecha_reporte: "2025-11-15",
        Usuario: { nombre_usuario: "Carlos Mendoza", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
        likes: { total: 64 }, comentarios: { total: 3 }, compartidos: { total: 2 }
    },
    {
        Id_reporte: "rep-007",
        Correo_electronico_usuario: "diego.santos@gmail.com",
        Servicio_reporte: "Electricidad",
        Descripcion_problema: "Se va la luz constantemente en toda la privada desde hace dos días",
        Direccion: "Privada Los Pinos, Tlatlaya, México",
        Nivel_urgencia: "Urgente",
        Foto_evidencia: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
        Nombre_reportante: "Diego Santos Martínez",
        Contacto_reportante: "7221047788",
        Fecha_reporte: "2025-11-16",
        Usuario: { nombre_usuario: "Carlos Mendoza", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
        likes: { total: 189 }, comentarios: { total: 21 }, compartidos: { total: 10 }
    },
    {
        Id_reporte: "rep-008",
        Correo_electronico_usuario: "rocio.garcia@gmail.com",
        Servicio_reporte: "Salud",
        Descripcion_problema: "El centro de salud no cuenta con suficiente personal para las consultas",
        Direccion: "Barrio La Esperanza, Tlatlaya, México",
        Nivel_urgencia: "Alta",
        Foto_evidencia: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
        Nombre_reportante: "Rocío García Hernández",
        Contacto_reportante: "7226679080",
        Fecha_reporte: "2025-11-17",
        Usuario: { nombre_usuario: "Carlos Mendoza", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
        likes: { total: 142 }, comentarios: { total: 9 }, compartidos: { total: 5 }
    }
];

function Home() {
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState<boolean>(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
    const [reportesMock, setReportesMock] = useState(reportes);
    const processingLikes = new Set<string>();

    const handleLikeClick = async (id_publicacion: string) => {
        if (processingLikes.has(id_publicacion)) return;
        processingLikes.add(id_publicacion);

        const alreadyLiked = !!likesActivos[id_publicacion];
        const change = alreadyLiked ? -1 : +1;

        setLikesActivos(prev => ({ ...prev, [id_publicacion]: !alreadyLiked }));
        updateLikeNumbers(id_publicacion, change);

        try {
            await axios.post(
                BackendApi.like_publications_url,
                { Id_objetivo: id_publicacion },
                { withCredentials: true }
            );
        } catch (err: any) {
            const status = err?.response?.status;

            updateLikeNumbers(id_publicacion, -change);

            if (status === 401) {
                goTo("/login");
            } else if (status !== 400) {
                console.error("Error inesperado al dar like:", err);
            }
        } finally {
            processingLikes.delete(id_publicacion);
        }
    };

    const updateLikeNumbers = (id_publicacion: string, change: number) => {
        setPublicaciones(prev =>
            prev.map(pub =>
                pub.Id_publicacion === id_publicacion
                    ? {
                        ...pub,
                        likes: {
                            total: (pub.likes?.total ?? 0) + change
                        }
                    }
                    : pub
            )
        );

        setReportesMock(prev =>
            prev.map(rep =>
                rep.Id_reporte === id_publicacion
                    ? {
                        ...rep,
                        likes: { total: rep.likes.total + change }
                    }
                    : rep
            )
        );
    };

    useEffect(() => {
        setIsLoadingPublications(true);
        axios
            .get(BackendApi.list_publications_url, { withCredentials: true })
            .then((res) => {
                const data = res.data.publicaciones || [];
                setPublicaciones(data);
            })
            .catch((err) => {
                console.error("Error cargando publicaciones:", err);
            })
            .finally(() => {
                setIsLoadingPublications(false);
            });
    }, []);

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75 home-container">
                {isLoadingPublications ? (
                    <div className="big-loader"></div>
                ) : (
                    <>
                        {publicaciones.map((post) => {
                            const liked = likesActivos[post.Id_publicacion];
                            return (
                                <React.Fragment key={post.Id_publicacion}>
                                    <div className="d-flex my-3">
                                        <div>
                                            <img src={post.Usuario.Url_foto_perfil == null ? "/Profile.svg" : post.Usuario.Url_foto_perfil} alt={post.Usuario.nombre_usuario} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(post.Usuario.Url_foto_perfil)} />
                                        </div>
                                        <div className="text-white flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="no-select">{post.Usuario.nombre_usuario}</span>
                                                <span>{formatFecha(post.Fecha_publicacion)}</span>
                                            </div>

                                            <p className="mb-3">{post.Contenido}</p>
                                            {post.Url_imagen && (
                                                <img src={post.Url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto"
                                                    onClick={() => setImagenSeleccionada(post.Url_imagen)} />
                                            )}

                                            <div className="d-flex no-select justify-content-between text-center mt-2">
                                                <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(post.Id_publicacion)}>
                                                    <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                                                    <span className={liked ? "text-error" : ""}>{post.likes?.total ?? 0}</span>
                                                </div>
                                                <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios"
                                                    onClick={() => { goTo("/publication?post=" + post.Id_publicacion) }} />{post.comentarios?.total ?? 0}</div>
                                                <div><img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />{post.compartidos?.total ?? 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="text-white m-0" />
                                </React.Fragment>
                            );
                        })}

                        {reportesMock.map((reporte, i) => {
                            const liked = likesActivos[reporte.Id_reporte];
                            return (
                                <React.Fragment key={i}>
                                    <div className="d-flex my-3">
                                        <div>
                                            <img src={reporte.Usuario.Url_foto_perfil} alt={reporte.Usuario.nombre_usuario} className="cursor-pointer no-select rounded-circle me-1 user-image"
                                                onClick={() => setImagenSeleccionada(reporte.Usuario.Url_foto_perfil)} />
                                        </div>
                                        <div className="text-white flex-grow-1">

                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="no-select">{reporte.Usuario.nombre_usuario}</span>
                                                <span>{formatFecha(reporte.Fecha_reporte)}</span>
                                            </div>

                                            <p className="mb-1">{reporte.Direccion}</p>
                                            <p className="mb-1"><strong>Servicio:</strong> {reporte.Servicio_reporte}</p>
                                            <p className="mb-3">{reporte.Descripcion_problema}</p>

                                            {reporte.Foto_evidencia && (<img src={reporte.Foto_evidencia} alt="evidencia"
                                                className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto"
                                                onClick={() => setImagenSeleccionada(reporte.Foto_evidencia)} />)}

                                            <div className="d-flex no-select justify-content-between text-center mt-2">
                                                <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(reporte.Id_reporte)}>
                                                    <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                                                    <span className={liked ? "text-error" : ""}>{reporte.likes.total}</span>
                                                </div>
                                                <div>
                                                    <img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{reporte.comentarios?.total}
                                                </div>
                                                <div>
                                                    <img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />{reporte.compartidos?.total}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <hr className="text-white m-0" />
                                </React.Fragment>
                            );
                        })}

                        {imagenSeleccionada && (
                            <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
                                <div className="modal-dialog modal-dialog-centered modal-lg">
                                    <div className="modal-content bg-transparent border-0">
                                        <div className="modal-body p-0 text-center position-relative">
                                            <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid rounded-3 selected-image" />
                                            <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
