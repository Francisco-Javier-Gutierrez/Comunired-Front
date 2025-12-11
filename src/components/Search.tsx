import { useState } from "react";
import axios from "axios";
import { BackendApi, goTo, formatFecha } from "../utils/globalVariables";
import { ServiceNames, type ServiceCode } from "../enums/ServiceEnum";

const normalizeLiked = (raw: any): boolean => {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return !!raw;
};

function Search() {
    const [text, setText] = useState("");
    const [resultados, setResultados] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
    const [sharedCount, setSharedCount] = useState<{ [key: string]: number }>({});
    const [shareLock, setShareLock] = useState<{ [key: string]: boolean }>({});
    const [hasSearched, setHasSearched] = useState(false);
    const processingLikes = new Set<string>();
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const handleLikeClick = (id: string) => {
        if (processingLikes.has(id)) return;
        processingLikes.add(id);

        const wasLiked = !!likesActivos[id];
        const delta = wasLiked ? -1 : 1;

        setLikesActivos(prev => ({ ...prev, [id]: !wasLiked }));

        const updateResultados = (amount: number) => {
            setResultados(prev =>
                prev.map(r => {
                    const isTarget = r.data?.Id_publicacion === id || r.data?.Id_reporte === id;
                    if (!isTarget) return r;

                    const current = r.data.likes?.total ?? 0;
                    const newTotal = Math.max(0, current + amount);

                    return {
                        ...r,
                        data: {
                            ...r.data,
                            likes: { total: newTotal }
                        }
                    };
                })
            );
        };

        updateResultados(delta);

        axios.post(
            wasLiked
                ? BackendApi.unlike_publications_url
                : BackendApi.like_publications_url,
            { Id_objetivo: id },
            { withCredentials: true }
        )
            .catch(() => {
                updateResultados(-delta);
                setLikesActivos(prev => ({ ...prev, [id]: wasLiked }));
            })
            .finally(() => {
                processingLikes.delete(id);
            });
    };

    const handleLikeClickReport = (id: string) => {
        if (processingLikes.has(id)) return;
        processingLikes.add(id);

        const alreadyLiked = !!likesActivos[id];
        const change = alreadyLiked ? -1 : +1;

        setLikesActivos(prev => ({ ...prev, [id]: !alreadyLiked }));

        setResultados(prev =>
            prev.map(r =>
                r.data?.Id_publicacion === id || r.data?.Id_reporte === id
                    ? { ...r, data: { ...r.data, likes: { total: (r.data.likes.total ?? 0) + change } } }
                    : r
            )
        );

        axios.post(
            alreadyLiked ? BackendApi.unlike_publications_url : BackendApi.like_report_url,
            { Id_objetivo: id },
            { withCredentials: true }
        )
            .catch(err => {
                const status = err?.response?.status;

                setLikesActivos(prev => ({ ...prev, [id]: alreadyLiked }));

                setResultados(prev =>
                    prev.map(r =>
                        r.data?.Id_publicacion === id || r.data?.Id_reporte === id
                            ? { ...r, data: { ...r.data, likes: { total: (r.data.likes.total ?? 0) - change } } }
                            : r
                    )
                );

                if (status === 401) goTo("/login");
            })
            .finally(() => {
                processingLikes.delete(id);
            });
    };

    const handleSharePublication = (id: string) => {
        if (shareLock[id]) return;

        setShareLock(prev => ({ ...prev, [id]: true }));
        alert("Url copiada exitosamente");

        const url = new URL("/publication", window.location.origin);
        url.searchParams.set("post", id);

        const idStr = String(id);

        navigator.clipboard.writeText(url.toString())
            .then(() => {
                setSharedCount(prev => ({ ...prev, [idStr]: (prev[idStr] ?? 0) + 1 }));

                setResultados(prev =>
                    prev.map(r => {
                        if (r.data?.Id_publicacion != null && String(r.data.Id_publicacion) === idStr) {
                            const prevTotal = r.data.compartidos?.total ?? 0;
                            return {
                                ...r,
                                data: {
                                    ...r.data,
                                    compartidos: { ...(r.data.compartidos ?? {}), total: prevTotal + 1 }
                                }
                            };
                        }
                        return r;
                    })
                );

                axios.post(BackendApi.share_publication_url, { Id_objetivo: id }, { withCredentials: true })
                    .catch(() => {
                        setSharedCount(prev => ({ ...prev, [idStr]: Math.max(0, (prev[idStr] ?? 0) - 1) }));

                        setResultados(prev =>
                            prev.map(r => {
                                if (r.data?.Id_publicacion != null && String(r.data.Id_publicacion) === idStr) {
                                    const prevTotal = r.data.compartidos?.total ?? 1; // si no existe, asumimos 1 para restar a 0
                                    return {
                                        ...r,
                                        data: {
                                            ...r.data,
                                            compartidos: { ...(r.data.compartidos ?? {}), total: Math.max(0, prevTotal - 1) }
                                        }
                                    };
                                }
                                return r;
                            })
                        );
                    })
                    .finally(() => {
                        setTimeout(() => setShareLock(prev => ({ ...prev, [idStr]: false })), 600);
                    });
            })
            .catch(() => {
                setShareLock(prev => ({ ...prev, [idStr]: false }));
                alert("No se pudo copiar la URL al portapapeles.");
            });
    };

    const handleShareReport = (id: string) => {
        if (shareLock[id]) return;

        setShareLock(prev => ({ ...prev, [id]: true }));
        alert("Url copiada exitosamente");

        const url = new URL("/report", window.location.origin);
        url.searchParams.set("rep", id);

        navigator.clipboard.writeText(url.toString())
            .then(() => {
                setSharedCount(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

                setResultados(prev =>
                    prev.map(r =>
                        r.data?.Id_reporte === id
                            ? { ...r, data: { ...r.data, compartidos: { total: (r.data.compartidos?.total ?? 0) + 1 } } }
                            : r
                    )
                );

                axios.post(BackendApi.share_report_url, { Id_objetivo: id }, { withCredentials: true })
                    .catch(() => {
                        setSharedCount(prev => ({ ...prev, [id]: (prev[id] ?? 1) - 1 }));
                    })
                    .finally(() =>
                        setTimeout(() => setShareLock(prev => ({ ...prev, [id]: false })), 600)
                    );
            });
    };

    const handleSearch = () => {
        const lowered = text.toLowerCase();
        if (!lowered.trim()) return;

        setHasSearched(true);
        setIsLoading(true);

        axios.post(BackendApi.search_resources_url, { texto: lowered }, { withCredentials: true })
            .then(res => {
                const arr = res.data.resultados || [];
                setResultados(arr);
                const map: { [key: string]: boolean } = {};

                arr.forEach((r: { data: any; }) => {
                    const d = r.data;
                    const id = d.Id_publicacion ?? d.Id_reporte;

                    const raw = d.Is_liked ?? d.is_liked ?? d.is_Liked ?? false;

                    map[id] = normalizeLiked(raw);
                });

                setLikesActivos(map);
            })
            .catch(() => {
                setResultados([]);
                setLikesActivos({});
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="min-dvh-100">
            <h3 className="text-white w-75 mx-auto my-4">Buscador</h3>
            <div className="w-75 mx-auto d-flex justify-content-around align-items-center mb-5">
                <div className="w-100 d-flex justify-content-betwwen">
                    <div className="w-75 text-start"><input type="text" className="text-input w-100" value={text} onChange={e => setText(e.target.value)} /></div>
                    <div className="w-25 text-center"><button className="white-button w-75" onClick={handleSearch}>Buscar</button></div>
                </div>
            </div>

            <div className="w-75 mx-auto mt-4">
                {isLoading ? <div className="big-loader"></div> : <>

                    {resultados.map((r, i) => {
                        const d = r.data;
                        const isPub = r.tipo === "publicacion";
                        const id = d.Id_publicacion ?? d.Id_reporte;
                        const liked = likesActivos[id];

                        return (
                            <div key={i}>
                                <div className="d-flex my-3 no-select"
                                    onClick={() => { goTo(isPub ? "/publication?post=" + d.Id_publicacion : "/report?rep=" + d.Id_reporte) }} >
                                    <div
                                        onClick={(e) => { e.stopPropagation(); goTo("/profile?user=" + d.Usuario?.Correo_electronico) }}>
                                        <img src={String(d.Usuario?.Url_foto_perfil ? d.Usuario?.Url_foto_perfil : "/Profile.svg")} alt={d.Usuario?.nombre_usuario} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(d.Usuario?.Url_foto_perfil ?? "/Profile.svg") }} />
                                    </div>

                                    <div className="text-white flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="no-select">
                                                <a className="text-white cursor-pointer">{d.Usuario?.nombre_usuario}</a>
                                            </span>
                                            <span>{formatFecha(isPub ? d.Fecha_publicacion : d.Fecha_reporte)}</span>
                                        </div>

                                        {isPub ? <p className="mb-3">{d.Contenido}</p> : <>
                                            <p className="mb-1">{d.Direccion}</p>
                                            <p className="mb-1"><strong>Servicio:</strong> {ServiceNames[d.Servicio_reporte as ServiceCode]}</p>
                                            <p className="mb-3">{d.Descripcion_problema}</p>
                                        </>}

                                        {d.Url_imagen && (
                                            <img src={d.Url_imagen} alt="imagen" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(d.Url_imagen) }} />
                                        )}

                                        {d.Foto_evidencia && (
                                            <img src={d.Foto_evidencia} alt="evidencia" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(d.Foto_evidencia) }} />
                                        )}

                                        <div className="d-flex no-select justify-content-between text-center mt-2">

                                            <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); (isPub ? handleLikeClick(id) : handleLikeClickReport(id)) }}>
                                                <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                                                <span className={liked ? "text-error" : ""}>{d.likes?.total ?? 0}</span>
                                            </div>

                                            <div>
                                                <img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />
                                                {d.comentarios?.total ?? 0}
                                            </div>

                                            <div className="d-flex align-items-center cursor-pointer justify-content-center" onClick={(e) => { e.stopPropagation(); (isPub ? handleSharePublication(id) : handleShareReport(id)) }}>
                                                <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                                                <span>{sharedCount[id] ?? d.compartidos?.total ?? 0}</span>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <hr className="text-white m-0" />
                            </div>
                        );
                    })}

                    {hasSearched && resultados.length === 0 && !isLoading && (
                        <h1 className="text-white text-center mt-5">
                            No se encontraron publicaciones ni reportes.
                        </h1>
                    )}

                </>}

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

            </div>
        </div>
    );
}

export default Search;
