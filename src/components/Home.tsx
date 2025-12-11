import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BackendApi, goTo } from "../utils/globalVariables";
import { formatFecha } from "../utils/globalVariables";
import { ServiceNames, type ServiceCode } from "../enums/ServiceEnum";

const normalizeLiked = (pub: any) => {
    return pub?.is_Liked ?? pub?.Is_Liked ?? pub?.is_liked ?? false;
};

const CACHE_KEY = "home_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function tryParseJSONMaybeString(input: any, maxAttempts = 5) {
    if (typeof input !== "string") return input;
    let parsed: any = input;
    for (let i = 0; i < maxAttempts; i++) {
        try {
            parsed = JSON.parse(parsed);
        } catch (e) {
            return null;
        }
        if (typeof parsed !== "string") return parsed;
    }
    return null;
}

function parseServerResponse(resData: any) {
    const publicaciones: any[] = [];
    const reportes: any[] = [];

    let payload: any = null;

    if (typeof resData === "string") {
        payload = tryParseJSONMaybeString(resData) ?? null;
    } else if (resData && resData.body !== undefined) {
        if (typeof resData.body === "string") {
            payload = tryParseJSONMaybeString(resData.body) ?? null;
        } else {
            payload = resData.body;
        }
    } else {
        payload = resData;
    }

    if (!payload) {
        return { publicaciones: [], reportes: [] };
    }

    if (payload.publicaciones || payload.reportes) {
        return {
            publicaciones: payload.publicaciones ?? [],
            reportes: payload.reportes ?? []
        };
    }

    if (Array.isArray(payload)) {
        payload.forEach((item: any) => {
            if (!item || !item.tipo) return;
            const d: any = item.data ? { ...item.data } : {};

            if (item.id) {
                if (item.tipo === "publicacion" && !d.Id_publicacion) d.Id_publicacion = item.id;
                if (item.tipo === "reporte" && !d.Id_reporte) d.Id_reporte = item.id;
            }

            if (item.fecha_iso) {
                if (item.tipo === "publicacion" && !d.Fecha_publicacion) d.Fecha_publicacion = item.fecha_iso;
                if (item.tipo === "reporte" && !d.Fecha_reporte) d.Fecha_reporte = item.fecha_iso;
            } else if (item.fecha && (typeof item.fecha === "number" || /^\d+$/.test(String(item.fecha)))) {
                const iso = new Date(Number(item.fecha)).toISOString();
                if (item.tipo === "publicacion" && !d.Fecha_publicacion) d.Fecha_publicacion = iso;
                if (item.tipo === "reporte" && !d.Fecha_reporte) d.Fecha_reporte = iso;
            }

            if (!d.likes) d.likes = { total: 0 };
            if (!d.comentarios) d.comentarios = { total: 0 };
            if (!d.compartidos) d.compartidos = { total: 0 };
            if (!d.Usuario) d.Usuario = { nombre_usuario: "Usuario", Url_foto_perfil: null, Correo_electronico: null };

            if (item.tipo === "publicacion" || item.tipo === "post") {
                publicaciones.push(d);
            } else if (item.tipo === "reporte" || item.tipo === "report") {
                reportes.push(d);
            }
        });

        return { publicaciones, reportes };
    }

    return {
        publicaciones: payload.publicaciones ?? [],
        reportes: payload.reportes ?? []
    };
}

function Home() {
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [reportesMock, setReportesMock] = useState<any[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState<boolean>(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
    const [shareDisabled] = useState<boolean>(false);
    const [sharedCount, setSharedCount] = useState<{ [key: string]: number }>({});
    const [shareLock, setShareLock] = useState<{ [key: string]: boolean }>({});
    const processingLikes = useRef<Set<string>>(new Set<string>());

    const buildInitialLikesState = (pubs: any[], reps: any[]) => {
        const map: { [key: string]: boolean } = {};
        pubs.forEach(pub => {
            if (pub?.Id_publicacion) map[pub.Id_publicacion] = normalizeLiked(pub);
        });
        reps.forEach(rep => {
            if (rep?.Id_reporte) map[rep.Id_reporte] = normalizeLiked(rep);
        });
        return map;
    };

    const buildSharedCounts = (pubs: any[], reps: any[]) => {
        const map: { [key: string]: number } = {};
        pubs.forEach(p => { if (p?.Id_publicacion) map[p.Id_publicacion] = p.compartidos?.total ?? 0; });
        reps.forEach(r => { if (r?.Id_reporte) map[r.Id_reporte] = r.compartidos?.total ?? 0; });
        return map;
    };

    const mergeAndSort = (pubs: any[], reps: any[]) => {
        const merged = [
            ...pubs.map(p => ({ ...p, __tipo: "publicacion", __fecha: p.Fecha_publicacion ?? new Date(0).toISOString() })),
            ...reps.map(r => ({ ...r, __tipo: "reporte", __fecha: r.Fecha_reporte ?? new Date(0).toISOString() }))
        ].sort((a, b) => new Date(b.__fecha).getTime() - new Date(a.__fecha).getTime());
        return merged;
    };

    const updateLikeNumbers = (id: string, change: number) => {
        setPublicaciones(prev =>
            prev.map(pub =>
                pub.Id_publicacion === id
                    ? { ...pub, likes: { total: (pub.likes?.total ?? 0) + change } }
                    : pub
            )
        );

        setReportesMock(prev =>
            prev.map(rep =>
                rep.Id_reporte === id
                    ? { ...rep, likes: { total: (rep.likes?.total ?? 0) + change } }
                    : rep
            )
        );

        setFeed(prev =>
            prev.map(item => {
                if (item.Id_publicacion === id) return { ...item, likes: { total: (item.likes?.total ?? 0) + change } };
                if (item.Id_reporte === id) return { ...item, likes: { total: (item.likes?.total ?? 0) + change } };
                return item;
            })
        );
    };

    const handleLikeClickPublications = (id_publicacion: string) => {
        if (processingLikes.current.has(id_publicacion)) return;
        processingLikes.current.add(id_publicacion);

        const alreadyLiked = !!likesActivos[id_publicacion];
        const change = alreadyLiked ? -1 : +1;
        setLikesActivos(prev => ({ ...prev, [id_publicacion]: !alreadyLiked }));
        updateLikeNumbers(id_publicacion, change);

        axios.post(
            alreadyLiked ? BackendApi.unlike_publications_url : BackendApi.like_publications_url,
            { Id_objetivo: id_publicacion },
            { withCredentials: true }
        )
            .then(() => { })
            .catch((err: any) => {
                const status = err?.response?.status;
                setLikesActivos(prev => ({ ...prev, [id_publicacion]: alreadyLiked }));
                updateLikeNumbers(id_publicacion, -change);
                if (status === 401) goTo("/login");
                if (status === 403) alert("Usted está baneado, no puede dar like");
            })
            .finally(() => {
                processingLikes.current.delete(id_publicacion);
            });
    };

    const handleLikeClickReports = (id_reporte: string) => {
        if (processingLikes.current.has(id_reporte)) return;
        processingLikes.current.add(id_reporte);

        const alreadyLiked = !!likesActivos[id_reporte];
        const change = alreadyLiked ? -1 : +1;
        setLikesActivos(prev => ({ ...prev, [id_reporte]: !alreadyLiked }));
        updateLikeNumbers(id_reporte, change);

        axios.post(
            alreadyLiked ? BackendApi.unlike_publications_url : BackendApi.like_report_url,
            { Id_objetivo: id_reporte },
            { withCredentials: true }
        )
            .then(() => { })
            .catch((err: any) => {
                const status = err?.response?.status;
                setLikesActivos(prev => ({ ...prev, [id_reporte]: alreadyLiked }));
                updateLikeNumbers(id_reporte, -change);
                if (status === 401) goTo("/login");
                if (status === 403) alert("Usted está baneado, no puede dar like");
            })
            .finally(() => {
                processingLikes.current.delete(id_reporte);
            });
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.__cachedAt && (Date.now() - parsed.__cachedAt) < CACHE_TTL_MS) {
                    const pubs = parsed.publicaciones ?? [];
                    const reps = parsed.reportes ?? [];
                    setPublicaciones(pubs);
                    setReportesMock(reps);
                    setFeed(parsed.feed ?? mergeAndSort(pubs, reps));
                    setLikesActivos(buildInitialLikesState(pubs, reps));
                    setSharedCount(buildSharedCounts(pubs, reps));
                }
            }
        } catch (e) { }

        setIsLoadingPublications(true);
        axios.get(BackendApi.list_publications_url, { withCredentials: true })
            .then(res => {
                const { publicaciones: pubs, reportes: reps } = parseServerResponse(res.data);
                setPublicaciones(pubs);
                setReportesMock(reps);

                const merged = mergeAndSort(pubs, reps);
                setFeed(merged);

                setLikesActivos(buildInitialLikesState(pubs, reps));
                setSharedCount(buildSharedCounts(pubs, reps));

                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        __cachedAt: Date.now(),
                        publicaciones: pubs,
                        reportes: reps,
                        feed: merged
                    }));
                } catch (e) {
                    console.warn("No se pudo cachear en localStorage", e);
                }
            })
            .catch(() => { })
            .finally(() => setIsLoadingPublications(false));
    }, []);

    const handleSharePublication = (publicationId: string, isReporte = false) => {
        if (shareLock[publicationId]) return;
        setShareLock(prev => ({ ...prev, [publicationId]: true }));

        const urlToCopy = isReporte
            ? window.location.href + "report?rep=" + publicationId
            : window.location.href + "publication?post=" + publicationId;

        alert("Url copiada exitosamente");

        navigator.clipboard.writeText(urlToCopy)
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
                                ? { ...rep, compartidos: { total: (rep.compartidos?.total ?? 0) + 1 } }
                                : rep
                        )
                    );
                } else {
                    setPublicaciones(prev =>
                        prev.map(pub =>
                            pub.Id_publicacion === publicationId
                                ? { ...pub, compartidos: { total: (pub.compartidos?.total ?? 0) + 1 } }
                                : pub
                        )
                    );
                }

                setFeed(prev =>
                    prev.map(item => {
                        if (item.Id_reporte === publicationId)
                            return { ...item, compartidos: { total: (item.compartidos?.total ?? 0) + 1 } };

                        if (item.Id_publicacion === publicationId)
                            return { ...item, compartidos: { total: (item.compartidos?.total ?? 0) + 1 } };

                        return item;
                    })
                );

                const shareUrl = isReporte
                    ? BackendApi.share_report_url
                    : BackendApi.share_publication_url;

                axios.post(
                    shareUrl,
                    { Id_objetivo: publicationId },
                    { withCredentials: true }
                )
                    .catch((err) => {
                        setSharedCount(prev => ({ ...prev, [publicationId]: (prev[publicationId] ?? 1) - 1 }));
                        const status = err?.response?.status;
                        if (status === 401) goTo("/login");
                        if (status === 403) alert("Usted está baneado, puede compartir, pero no sumará");
                        if (isReporte) {
                            setReportesMock(prev =>
                                prev.map(rep =>
                                    rep.Id_reporte === publicationId
                                        ? { ...rep, compartidos: { total: (rep.compartidos?.total ?? 1) - 1 } }
                                        : rep
                                )
                            );
                        } else {
                            setPublicaciones(prev =>
                                prev.map(pub =>
                                    pub.Id_publicacion === publicationId
                                        ? { ...pub, compartidos: { total: (pub.compartidos?.total ?? 1) - 1 } }
                                        : pub
                                )
                            );
                        }

                        setFeed(prev =>
                            prev.map(item => {
                                if (item.Id_reporte === publicationId)
                                    return { ...item, compartidos: { total: (item.compartidos?.total ?? 1) - 1 } };

                                if (item.Id_publicacion === publicationId)
                                    return { ...item, compartidos: { total: (item.compartidos?.total ?? 1) - 1 } };

                                return item;
                            })
                        );
                    })
                    .finally(() => {
                        setTimeout(() => {
                            setShareLock(prev => ({ ...prev, [publicationId]: false }));
                        }, 600);
                    });

            })
            .catch(() => {
                setShareLock(prev => ({ ...prev, [publicationId]: false }));
            });
    };

    const renderPublicacion = (post: any) => (
        <React.Fragment key={post.Id_publicacion}>
            <div className="d-flex my-3 no-select" onClick={() => { goTo("/publication?post=" + post.Id_publicacion) }}>
                <div>
                    <img src={post.Usuario?.Url_foto_perfil ? post.Usuario?.Url_foto_perfil : "/Profile.svg"} alt={post.Usuario?.nombre_usuario} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(post.Usuario?.Url_foto_perfil == null ? "/Profile.svg" : post.Usuario?.Url_foto_perfil) }} />
                </div>
                <div className="text-white flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="no-select"><a className="text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); goTo("/profile?user=" + post.Usuario?.Correo_electronico) }}>{post.Usuario?.nombre_usuario}</a></span>
                        <span>{formatFecha(post.Fecha_publicacion)}</span>
                    </div>
                    <p className="mb-3">{post.Contenido}</p>
                    {post.Url_imagen && (<img src={post.Url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(post.Url_imagen) }} />)}
                    <div className="d-flex no-select justify-content-between text-center mt-2">
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleLikeClickPublications(post.Id_publicacion) }}>
                            <img src={likesActivos[post.Id_publicacion] ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                            <span className={likesActivos[post.Id_publicacion] ? "text-error" : ""}>{post.likes?.total ?? 0}</span>
                        </div>
                        <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{post.comentarios?.total ?? 0}</div>
                        <div className={`d-flex align-items-center cursor-pointer justify-content-center ${shareDisabled ? "disabled" : ""}`} onClick={(e) => { e.stopPropagation(); handleSharePublication(post.Id_publicacion, false) }}>
                            <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                            <span>{sharedCount[post.Id_publicacion] ?? post.compartidos?.total ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="text-white m-0" />
        </React.Fragment>
    );

    const renderReporte = (reporte: any, i: number) => (
        <React.Fragment key={reporte.Id_reporte ?? i}>
            <div className="d-flex my-3 no-select" onClick={() => { goTo("/report?rep=" + reporte.Id_reporte) }}>
                <div>
                    <img src={String(reporte.Usuario?.Url_foto_perfil ? reporte.Usuario?.Url_foto_perfil : "/Profile.svg")} alt={String(reporte.Usuario?.nombre_usuario ?? "")} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(typeof reporte.Usuario?.Url_foto_perfil === 'string' ? reporte.Usuario.Url_foto_perfil : "") }} />
                </div>
                <div className="text-white flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <a className="no-select cursor-pointer text-white" onClick={(e) => { e.stopPropagation(); goTo("/profile?user=" + reporte.Usuario?.Correo_electronico) }}>{reporte.Usuario?.nombre_usuario}</a>
                        <span>{formatFecha(reporte.Fecha_reporte)}</span>
                    </div>
                    <p className="mb-1">{reporte.Direccion}</p>
                    <p className="mb-1"><strong>Servicio:</strong> {ServiceNames[reporte.Servicio_reporte as ServiceCode]}</p>
                    <p className="mb-3">{reporte.Descripcion_problema}</p>
                    {reporte.Foto_evidencia && typeof reporte.Foto_evidencia === 'string' && (<img src={reporte.Foto_evidencia} alt="evidencia" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(reporte.Foto_evidencia as string) }} />)}
                    <div className="d-flex no-select justify-content-between text-center mt-2">
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleLikeClickReports(reporte.Id_reporte) }}>
                            <img src={likesActivos[reporte.Id_reporte] ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                            <span className={likesActivos[reporte.Id_reporte] ? "text-error" : ""}>{reporte.likes?.total ?? 0}</span>
                        </div>
                        <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{reporte.comentarios?.total ?? 0}</div>
                        <div className={`d-flex align-items-center cursor-pointer justify-content-center ${shareDisabled ? "disabled" : ""}`} onClick={(e) => { e.stopPropagation(); handleSharePublication(reporte.Id_reporte, true) }}>
                            <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                            <span>{sharedCount[reporte.Id_reporte] ?? reporte.compartidos?.total ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="text-white m-0" />
        </React.Fragment>
    );

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75 home-container">
                {isLoadingPublications ? (<div className="big-loader"></div>) : (<>
                    {feed.map((item, idx) => item.__tipo === "publicacion" ? renderPublicacion(item) : renderReporte(item, idx))}
                    {imagenSeleccionada && (<div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content bg-transparent border-0">
                                <div className="modal-body p-0 text-center position-relative">
                                    <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid rounded-3 selected-image" />
                                    <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button>
                                </div>
                            </div>
                        </div>
                    </div>)}
                </>)}
            </div>
        </div>
    );
}

export default Home;