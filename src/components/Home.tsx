import React, { useState, useEffect } from "react";
import axios from "axios";
import { BackendApi, goTo } from "../utils/globalVariables";
import { formatFecha } from "../utils/globalVariables";

const normalizeLiked = (pub: any) => {
    return pub?.is_Liked ?? pub?.Is_Liked ?? pub?.is_liked ?? false;
};

function Home() {
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState<boolean>(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
    const [shareDisabled] = useState<boolean>(false);
    const [sharedCount, setSharedCount] = useState<{ [key: string]: number }>({});
    const [shareLock, setShareLock] = useState<{ [key: string]: boolean }>({});
    const [reportesMock, setReportesMock] = useState<any[]>([]);
    const processingLikes = new Set<string>();

    const handleLikeClick = (id_publicacion: string) => {
        if (processingLikes.has(id_publicacion)) return;
        processingLikes.add(id_publicacion);

        const alreadyLiked = !!likesActivos[id_publicacion];
        const change = alreadyLiked ? -1 : +1;
        setLikesActivos(prev => ({ ...prev, [id_publicacion]: !alreadyLiked }));
        updateLikeNumbers(id_publicacion, change);

        axios.post(
            alreadyLiked
                ? BackendApi.unlike_publications_url
                : BackendApi.like_publications_url,
            { Id_objetivo: id_publicacion },
            { withCredentials: true }
        )
            .then(() => { })
            .catch((err: any) => {
                const status = err?.response?.status;
                setLikesActivos(prev => ({ ...prev, [id_publicacion]: alreadyLiked }));
                updateLikeNumbers(id_publicacion, -change);

                if (status === 401) goTo("/login");
            })
            .finally(() => {
                processingLikes.delete(id_publicacion);
            });
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

        setReportesMock((prev: any[]) =>
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

        axios.get(BackendApi.list_publications_url, { withCredentials: true })
            .then((res) => {
                const data = res.data.publicaciones || [];

                const initialLikesState: { [key: string]: boolean } = {};
                data.forEach((pub: { Id_publicacion: string | number }) => {
                    initialLikesState[pub.Id_publicacion] = normalizeLiked(pub);
                });

                setPublicaciones(data);
                setLikesActivos(initialLikesState);
            })
            .catch(() => { })
            .finally(() => setIsLoadingPublications(false));
    }, []);

    const handleSharePublication = (publicationId: string, isReporte = false) => {

        if (shareLock[publicationId]) return;

        setShareLock(prev => ({ ...prev, [publicationId]: true }));

        alert("Url copiada exitosamente");
        navigator.clipboard.writeText(window.location.href + "publication?post=" + publicationId)
            .then(() => {
                setSharedCount(prev => ({
                    ...prev,
                    [publicationId]: (prev[publicationId] ?? (
                        isReporte
                            ? reportesMock.find(r => r.Id_reporte === publicationId)?.compartidos?.total ?? 0
                            : publicaciones.find(p => p.Id_publicacion === publicationId)?.compartidos?.total ?? 0
                    )) + 1
                }));

                if (isReporte) {
                    setReportesMock(prev =>
                        prev.map(rep =>
                            rep.Id_reporte === publicationId
                                ? {
                                    ...rep,
                                    compartidos: {
                                        total: (rep.compartidos?.total ?? 0) + 1
                                    }
                                }
                                : rep
                        )
                    );
                } else {
                    setPublicaciones(prev =>
                        prev.map(pub =>
                            pub.Id_publicacion === publicationId
                                ? {
                                    ...pub,
                                    compartidos: {
                                        total: (pub.compartidos?.total ?? 0) + 1
                                    }
                                }
                                : pub
                        )
                    );
                }
                axios.post(
                    BackendApi.share_publication_url,
                    { Id_objetivo: publicationId },
                    { withCredentials: true }
                )
                    .catch(() => {
                        setSharedCount(prev => ({
                            ...prev,
                            [publicationId]: (prev[publicationId] ?? 1) - 1
                        }));

                        if (isReporte) {
                            setReportesMock((prev: any[]) =>
                                prev.map(rep =>
                                    rep.Id_reporte === publicationId
                                        ? {
                                            ...rep,
                                            compartidos: {
                                                total: (rep.compartidos?.total ?? 1) - 1
                                            }
                                        }
                                        : rep
                                )
                            );
                        } else {
                            setPublicaciones(prev =>
                                prev.map(pub =>
                                    pub.Id_publicacion === publicationId
                                        ? {
                                            ...pub,
                                            compartidos: {
                                                total: (pub.compartidos?.total ?? 1) - 1
                                            }
                                        }
                                        : pub
                                )
                            );
                        }
                    })
                    .finally(() => {
                        setTimeout(() => {
                            setShareLock(prev => ({ ...prev, [publicationId]: false }));
                        }, 600);
                    });
            })
            .catch(() => { setShareLock(prev => ({ ...prev, [publicationId]: false })); });
    };

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
                                    <div className="d-flex my-3 no-select"
                                        onClick={() => { goTo("/publication?post=" + post.Id_publicacion) }}>
                                        <div>
                                            <img src={post.Usuario.Url_foto_perfil == null ? "/Profile.svg" : post.Usuario.Url_foto_perfil} alt={post.Usuario.nombre_usuario} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(post.Usuario.Url_foto_perfil == null ? "/Profile.svg" : post.Usuario.Url_foto_perfil) }} />
                                        </div>
                                        <div className="text-white flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="no-select"><a className="text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); goTo("/profile?user=" + post.Usuario.Correo_electronico) }}>{post.Usuario.nombre_usuario}</a></span>
                                                <span>{formatFecha(post.Fecha_publicacion)}</span>
                                            </div>

                                            <p className="mb-3">{post.Contenido}</p>
                                            {post.Url_imagen && (
                                                <img src={post.Url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto"
                                                    onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(post.Url_imagen) }} />
                                            )}

                                            <div className="d-flex no-select justify-content-between text-center mt-2">
                                                <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleLikeClick(post.Id_publicacion) }}>
                                                    <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                                                    <span className={liked ? "text-error" : ""}>{post.likes?.total ?? 0}</span>
                                                </div>
                                                <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{post.comentarios?.total ?? 0}</div>
                                                <div
                                                    className={`d-flex align-items-center cursor-pointer justify-content-center ${shareDisabled ? "disabled" : ""}`}
                                                    onClick={(e) => { e.stopPropagation(); handleSharePublication(post.Id_publicacion, false) }}
                                                >
                                                    <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                                                    <span>{sharedCount[post.Id_publicacion] ?? post.compartidos?.total ?? 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="text-white m-0" />
                                </React.Fragment>
                            );
                        })}

                        {reportesMock.map((reporte: { Id_reporte: string; Usuario: { Url_foto_perfil: React.SetStateAction<string | null> | undefined; nombre_usuario: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; Fecha_reporte: string; Direccion: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Servicio_reporte: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Descripcion_problema: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Foto_evidencia: React.SetStateAction<string | null> | undefined; likes: { total: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; comentarios: { total: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; compartidos: { total: any; }; }, i: React.Key | null | undefined) => {
                            const liked = likesActivos[reporte.Id_reporte];
                            return (
                                <React.Fragment key={i}>
                                    <div className="d-flex my-3">
                                        <div>
                                            <img src={String(reporte.Usuario.Url_foto_perfil ?? "")} alt={String(reporte.Usuario.nombre_usuario ?? "")} className="cursor-pointer no-select rounded-circle me-1 user-image"
                                                onClick={() => setImagenSeleccionada(typeof reporte.Usuario.Url_foto_perfil === 'string' ? reporte.Usuario.Url_foto_perfil : "")} />
                                        </div>
                                        <div className="text-white flex-grow-1">

                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="no-select">{reporte.Usuario.nombre_usuario}</span>
                                                <span>{formatFecha(reporte.Fecha_reporte)}</span>
                                            </div>

                                            <p className="mb-1">{reporte.Direccion}</p>
                                            <p className="mb-1"><strong>Servicio:</strong> {reporte.Servicio_reporte}</p>
                                            <p className="mb-3">{reporte.Descripcion_problema}</p>

                                            {reporte.Foto_evidencia && typeof reporte.Foto_evidencia === 'string' && (<img src={reporte.Foto_evidencia} alt="evidencia"
                                                className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto"
                                                onClick={() => setImagenSeleccionada(reporte.Foto_evidencia as string)} />)}

                                            <div className="d-flex no-select justify-content-between text-center mt-2">
                                                <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(reporte.Id_reporte)}>
                                                    <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                                                    <span className={liked ? "text-error" : ""}>{reporte.likes.total}</span>
                                                </div>
                                                <div>
                                                    <img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{reporte.comentarios?.total}
                                                </div>
                                                <div
                                                    className={`d-flex align-items-center cursor-pointer justify-content-center ${shareDisabled ? "disabled" : ""}`}
                                                    onClick={() => handleSharePublication(reporte.Id_reporte, true)}
                                                >
                                                    <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                                                    <span>{sharedCount[reporte.Id_reporte] ?? reporte.compartidos?.total ?? 0}</span>
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
