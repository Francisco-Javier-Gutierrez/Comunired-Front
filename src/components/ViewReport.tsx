import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BackendApi, formatFecha, goTo, useSearchParamsGlobal } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import { ServiceNames, type ServiceCode } from "../enums/ServiceEnum";

function ViewReport() {
    const [publication, setPublication] = useState<any>(null);
    const { name, profilePictureUrl } = useUserData();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
    const [newComment, setNewComment] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isCreatingComment, setIsCreatingComment] = useState<boolean>(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const likeProcessing = useRef(false);
    const [shareDisabled, setShareDisabled] = useState<boolean>(false);

    const searchParams = useSearchParamsGlobal();
    const reportId = searchParams.get("rep");

    useEffect(() => {
        if (!reportId) {
            setError("No se proporcionó un ID de reporte.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        axios.post(BackendApi.list_report_url, { Id_reporte: reportId }, { withCredentials: true })
            .then(res => {
                const pub = Array.isArray(res.data.reporte) ? res.data.reporte[0] : res.data.reporte;
                setPublication(pub);
                setLiked(pub?.is_Liked ?? pub?.Is_Liked ?? false);
                setLikesCount(pub?.likes?.total ?? 0);
            })
            .catch(() => { setError("Error al obtener el reporte"); })
            .finally(() => setIsLoading(false));
    }, [reportId]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const body = { Id_objetivo: reportId, Contenido: newComment };
        setIsCreatingComment(true);
        axios.post(BackendApi.comment_report_url, body, { withCredentials: true })
            .then(res => {
                if (res.data?.id) {
                    const newComm = {
                        Id_comentario: res.data.id,
                        Contenido: newComment,
                        Fecha_comentario: new Date().toISOString(),
                        Usuario: { Nombre_usuario: name ?? "Usuario", Url_foto_perfil: profilePictureUrl ? profilePictureUrl : "/Profile.svg" }
                    };
                    setPublication((prev: any) => {
                        const prevComentarios = prev?.comentarios ?? { total: 0, lista: [] };
                        const lista = Array.isArray(prevComentarios.lista) ? prevComentarios.lista : [];
                        return { ...prev, comentarios: { ...prevComentarios, total: lista.length + 1, lista: [newComm, ...lista] } };
                    });
                }
            })
            .catch((err) => {
                const status = err?.response?.status;
                if (status === 401) {
                    goTo("/login");
                }
                if (status === 403) {
                    alert("Usted está baneado, no puede comentar");
                }
            })
            .finally(() => {
                setNewComment("");
                setShowCommentInput(false);
                setIsCreatingComment(false)
            });
    };

    const toggleLike = async () => {
        if (likeProcessing.current) return;
        likeProcessing.current = true;
        const already = liked;
        const change = already ? -1 : +1;
        setLiked(!already);
        setLikesCount(prev => prev + change);

        try {
            await axios.post(already ? BackendApi.unlike_publications_url : BackendApi.like_report_url, { Id_objetivo: reportId }, { withCredentials: true });
        } catch (err: any) {
            const status = err?.response?.status;
            setLiked(already);
            setLikesCount(prev => prev - change);
            if (status === 401) window.location.href = "/login";
        } finally { likeProcessing.current = false; }
    };

    const handleSharePublication = () => {
        if (shareDisabled) return;
        setShareDisabled(true);
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                alert("¡Copiado al portapapeles!");
                axios.post(BackendApi.share_report_url, { Id_objetivo: reportId }, { withCredentials: true })
                    .then(res => {
                        if (res.data?.id) {
                            setPublication((prev: any) => {
                                const prevCompartidos = prev?.compartidos ?? { total: 0 };
                                return { ...prev, compartidos: { ...prevCompartidos, total: (prevCompartidos.total ?? 0) + 1 } };
                            });
                        }
                    })
                    .catch(() => { })
                    .finally(() => setTimeout(() => setShareDisabled(false), 1500));
            })
            .catch(() => { setShareDisabled(false); });
    };

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    if (isLoading) return (<div className="home-container"><div className="big-loader"></div></div>);
    if (error) return (<div className="text-danger">{error}</div>);
    if (!publication) return (<div>No hay reporte para mostrar</div>);

    const Usuario = publication.Usuario ?? publication.usuario ?? {};
    const userImage = Usuario?.Url_foto_perfil ?? Usuario?.url_foto_perfil ?? "/Profile.svg";
    const userName = Usuario?.Nombre_usuario ?? Usuario?.nombre_usuario ?? "Usuario";
    const fecha = publication.Fecha_reporte ?? publication.Fecha_publicacion ?? publication.fecha_iso ?? publication.fecha ?? null;
    const displayedDate = fecha ? formatFecha(fecha) : "";

    const direccion = publication.Direccion ?? publication.direccion ?? null;
    const servicio = publication.Servicio_reporte ?? publication.servicio_reporte ?? publication.Servicio ?? null;
    const descripcion = publication.Descripcion_problema ?? publication.descripcion_problema ?? publication.Contenido ?? publication.contenido ?? null;
    const evidencia = publication.Foto_evidencia ?? publication.foto_evidencia ?? publication.Url_imagen ?? publication.url_imagen ?? null;
    const comentarios = publication.comentarios ?? publication.Comentarios ?? { total: 0, lista: [] };
    const compartidos = publication.compartidos ?? publication.Compartidos ?? { total: 0 };
    const likes = likesCount;

    return (
        <div className="w-75 mx-auto home-container d-flex flex-column">
            <div className="d-flex my-3 no-select">
                <div>
                    <img src={String(userImage ? userImage : "/Profile.svg")} alt={String(userName)} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(String(userImage))} />
                </div>
                <div className="text-white flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <a className="no-select cursor-pointer text-white" href={"/profile?user=" + (Usuario?.Correo_electronico ?? "")}>{userName}</a>
                        <span>{displayedDate}</span>
                    </div>

                    {direccion && <p className="mb-1">{direccion}</p>}
                    {servicio && <p className="mb-1"><strong>Servicio:</strong> {ServiceNames[servicio as ServiceCode]}</p>}
                    {descripcion && <p className="mb-3">{descripcion}</p>}

                    {evidencia && typeof evidencia === "string" && (<img src={evidencia} alt="evidencia" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={() => setImagenSeleccionada(evidencia)} />)}

                    <div className="d-flex no-select justify-content-between text-center mt-2">
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={toggleLike}>
                            <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                            <span className={liked ? "text-error" : ""}>{likes}</span>
                        </div>

                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => setShowCommentInput(prev => !prev)}>
                            <img src="Comment.svg" width={20} className="me-1" alt="Comentarios" />
                            <span>{comentarios?.total ?? (Array.isArray(comentarios) ? comentarios.length : 0)}</span>
                        </div>

                        <div className={`d-flex align-items-center cursor-pointer justify-content-center ${shareDisabled ? "disabled" : ""}`} onClick={handleSharePublication}>
                            <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                            <span>{compartidos?.total ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="text-white mt-3 m-0" />
            <h6 className="text-white my-2">Comentarios</h6>
            <hr className="text-white mb-3 m-0" />

            {showCommentInput && (
                <div className={`d-flex my-3 ${isCreatingComment ? "disabled-form no-select" : ""}`}>
                    <div>
                        <img src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt={name ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(profilePictureUrl ?? "/Profile.svg")} />
                    </div>
                    <div className="text-white flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="no-select">{name ?? "Usuario"}</span>
                        </div>
                        <textarea ref={textareaRef} value={newComment} onChange={e => { setNewComment(e.target.value); autoResize(); }} placeholder="Escribe un comentario..." className="textarea-input mb-2" style={{ overflow: "hidden", resize: "none", minHeight: "80px" }} />
                        <button className="white-button" onClick={handleAddComment}>{!isCreatingComment ? "Comentar" : (<div className="d-flex justify-content-center"><span>Creando comentario...</span><div className="loader ms-3"></div></div>)}</button>
                    </div>
                </div>
            )}

            {(!comentarios?.lista || comentarios.lista.length === 0) && (<h4 className="text-white text-center mb-3">No hay comentarios en el reporte</h4>)}

            {(comentarios?.lista ?? []).map((c: any) => (
                <div key={c.Id_comentario || `${c.Fecha_comentario}-${Math.random()}`}>
                    <div className="d-flex my-3">
                        <div>
                            <img src={c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg"} alt={c.Usuario?.nombre_usuario ?? c.Usuario?.Nombre_usuario ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg")} />
                        </div>
                        <div className="text-white flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="no-select"><a className="text-white" href={"/profile?user=" + (c.Usuario?.Correo_electronico ?? "")}>{c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}</a></span>
                                <span>{formatFecha(c.Fecha_comentario)}</span>
                            </div>
                            <p className="mb-3">{c.Contenido}</p>
                        </div>
                    </div>
                    <hr className="text-white mb-3 m-0" />
                </div>
            ))}

            {imagenSeleccionada && (
                <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
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
    );
}

export default ViewReport;
