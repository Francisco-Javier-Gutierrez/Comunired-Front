import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BackendApi, formatFecha } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";

function ViewPublication() {
    const [publication, setPublication] = useState<any>(null);
    const { name, profilePictureUrl } = useUserData();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
    const [newComment, setNewComment] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const searchParams = new URLSearchParams(window.location.search);
    const publicationId = searchParams.get("post");

    useEffect(() => {
        if (!publicationId) {
            setError("No se proporcionó un ID de publicación.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        axios.post(
            BackendApi.list_publication_url,
            { Id_publicacion: publicationId },
            { withCredentials: true }
        )
            .then(res => {
                const pub = Array.isArray(res.data.publicacion) ? res.data.publicacion[0] : res.data.publicacion;
                setPublication(pub);
            })
            .catch(err => {
                console.error(err.response?.data || err.message);
                setError("Error al obtener la publicación");
            })
            .finally(() => setIsLoading(false));
    }, [publicationId]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const body = { Id_objetivo: publicationId, Contenido: newComment };

        axios.post(BackendApi.comment_publication_url, body, { withCredentials: true })
            .then(res => {
                if (res.data?.id) {

                    const newComm = {
                        Id_comentario: res.data.id,
                        Contenido: newComment,
                        Fecha_comentario: new Date().toISOString(),
                        Usuario: {
                            Nombre_usuario: name ?? "Usuario",
                            Url_foto_perfil: profilePictureUrl ?? "/Profile.svg"
                        }
                    };

                    setPublication((prev: { comentarios: { total: number; lista: never[]; }; }) => {
                        const prevComentarios = prev?.comentarios ?? { total: 0, lista: [] };
                        const lista = Array.isArray(prevComentarios.lista) ? prevComentarios.lista : [];

                        return {
                            ...prev,
                            comentarios: {
                                ...prevComentarios,
                                total: lista.length + 1,
                                lista: [...lista, newComm]
                            }
                        };
                    });

                    setNewComment("");
                    setShowCommentInput(false);

                }
            })
            .catch(err => console.error(err));
    };

    if (isLoading) return <div className="big-loader"></div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!publication) return <div>No hay publicación para mostrar</div>;

    const { Contenido, Url_imagen, Fecha_publicacion, Usuario, likes, comentarios, compartidos } = publication;

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleSharePublication = () => {
        navigator.clipboard.writeText(window.location.href)
            .catch(err => {
                console.error("Error copiando URL:", err);
            });
        axios.post(
            BackendApi.share_publication_url,
            { Id_objetivo: publicationId },
            { withCredentials: true }
        )
            .then(res => {
                if (res.data?.id) {
                    setPublication((prev: { compartidos: { total: number; }; }) => {
                        const prevCompartidos = prev?.compartidos ?? { total: 0 };

                        return {
                            ...prev,
                            compartidos: {
                                ...prevCompartidos,
                                total: (prevCompartidos.total ?? 0) + 1
                            }
                        };
                    });

                }
            })
            .catch(err => console.error("Error al registrar compartido:", err));
    };

    return (
        <div className="w-75 min-vh-100 mx-auto home-container d-flex flex-column">
            <div className="d-flex my-3">
                <div>
                    <img src={Usuario?.Url_foto_perfil ?? Usuario?.url_foto_perfil ?? "/Profile.svg"} alt={Usuario?.nombre_usuario ?? Usuario?.Nombre_usuario ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(Usuario?.Url_foto_perfil ?? Usuario?.url_foto_perfil ?? "/Profile.svg")} />
                </div>

                <div className="text-white flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="no-select">{Usuario?.nombre_usuario ?? Usuario?.Nombre_usuario ?? "Usuario"}</span>
                        <span>{formatFecha(Fecha_publicacion)}</span>
                    </div>

                    <p className="mb-3">{Contenido}</p>

                    {Url_imagen && (
                        <img src={Url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={() => setImagenSeleccionada(Url_imagen)} />
                    )}

                    <div className="d-flex no-select justify-content-between text-center mt-2">
                        <div className="cursor-pointer d-flex align-items-center justify-content-center">
                            <img src="Like.svg" width={20} className="me-1" alt="Like" />
                            <span>{likes?.total ?? 0}</span>
                        </div>

                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => setShowCommentInput(prev => !prev)}>
                            <img src="Comment.svg" width={20} className="me-1" alt="Comentarios" />
                            <span>{comentarios?.total ?? (comentarios && Array.isArray(comentarios) ? comentarios.length : 0)}</span>
                        </div>

                        <div
                            className="d-flex align-items-center cursor-pointer justify-content-center"
                            onClick={handleSharePublication}
                        >
                            <img src="Share.svg" width={20} className="me-1" alt="Compartir" />
                            <span>{compartidos?.total ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="text-white mt-5 m-0" />
            <h6 className="text-white my-2">Comentarios</h6>
            <hr className="text-white mb-3 m-0" />

            {showCommentInput && (
                <div className="d-flex my-3">
                    <div>
                        <img src={profilePictureUrl ?? "/Profile.svg"} alt={name ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(profilePictureUrl ?? "/Profile.svg")} />
                    </div>
                    <div className="text-white flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="no-select">{name ?? "Usuario"}</span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={newComment}
                            onChange={e => { setNewComment(e.target.value); autoResize(); }}
                            placeholder="Escribe un comentario..."
                            className="textarea-input mb-2"
                            style={{ overflow: "hidden", resize: "none", minHeight: "80px" }}
                        />
                        <button className="white-button" onClick={handleAddComment}>Comentar</button>
                    </div>
                </div>
            )}

            {(comentarios?.lista ?? []).map((c: any) => (
                <div key={c.Id_comentario || `${c.Fecha_comentario}-${Math.random()}`}>
                    <div className="d-flex my-3">
                        <div>
                            <img src={c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg"} alt={c.Usuario?.nombre_usuario ?? c.Usuario?.Nombre_usuario ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg")} />
                        </div>
                        <div className="text-white flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="no-select">{c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}</span>
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

export default ViewPublication;
