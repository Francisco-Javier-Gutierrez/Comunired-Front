import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    BackendApi,
    formatFecha,
    useSearchParamsGlobal,
    goTo,
    getToken,
    isUserAuthenticated
} from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "../components/PublicationCard";
import ImageModal from "./ImageModal";

function normalizePublication(p: any) {
    if (!p) return null;

    return {
        ...p,
        likes: p?.likes ?? { total: 0 },
        comentarios: p?.comentarios ?? { total: 0, lista: [] },
        compartidos: p?.compartidos ?? { total: 0 },
        Usuario: p?.Usuario ?? {
            nombre_usuario: "Usuario",
            Url_foto_perfil: null,
            Correo_electronico: null
        }
    };
}

function ViewPublication() {
    const [publication, setPublication] = useState<any>(null);
    const { name, profilePictureUrl } = useUserData();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const [showCommentInput, setShowCommentInput] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isCreatingComment, setIsCreatingComment] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const searchParams = useSearchParamsGlobal();
    const publicationId = searchParams.get("post");

    useEffect(() => {
        if (!publicationId) {
            setError("No se proporcionó un ID de publicación.");
            return;
        }

        setIsLoading(true);

        const loadPublication = async () => {
            try {
                const isAuth = await isUserAuthenticated();
                const token = isAuth ? await getToken() : null;
                const res = await axios.post(
                    (isAuth ? BackendApi.list_publication_user_auth_url : BackendApi.list_publication_url),
                    { Id_publicacion: publicationId },
                    {
                        withCredentials: true,
                        ...(isAuth && {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    }
                );

                setPublication(normalizePublication(res.data));
            } catch (err) {
                console.error("Error al cargar la publicación:", err);
                setError("Error al obtener la publicación");
            } finally {
                setIsLoading(false);
            }
        };

        loadPublication();
    }, [publicationId]);

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setIsCreatingComment(true);

        const token = await getToken();

        axios.post(
            BackendApi.comment_publication_url,
            { Id_objetivo: publicationId, Contenido: newComment },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .then(res => {
                if (!res.data?.id) return;

                const newComm = {
                    Id_comentario: res.data.id,
                    Contenido: newComment,
                    Fecha_comentario: new Date().toISOString(),
                    Usuario: {
                        Nombre_usuario: name ?? "Usuario",
                        Url_foto_perfil: profilePictureUrl ?? "/Profile.svg"
                    }
                };

                setPublication((prev: any) => {
                    const prevComentarios = prev?.comentarios ?? { total: 0, lista: [] };
                    const lista = Array.isArray(prevComentarios.lista) ? prevComentarios.lista : [];

                    return {
                        ...prev,
                        comentarios: {
                            ...prevComentarios,
                            total: lista.length + 1,
                            lista: [newComm, ...lista]
                        }
                    };
                });

                setNewComment("");
                setShowCommentInput(false);
            })
            .catch(err => {
                const status = err?.response?.status;
                if (status === 401) goTo("/login");
                if (status === 403) alert("Usted está baneado, no puede comentar");
            })
            .finally(() => {
                setNewComment("");
                setShowCommentInput(false);
                setIsCreatingComment(false);
            });
    };

    if (isLoading) {
        return (
            <div className="home-container">
                <div className="big-loader"></div>
            </div>
        );
    }

    if (error) return <div className="text-danger">{error}</div>;
    if (!publication) return <div>No hay publicación para mostrar</div>;

    const { comentarios } = publication;

    return (
        <div className="w-75 mx-auto home-container d-flex flex-column">
            <PublicationCard
                post={publication}
                onImageClick={setImagenSeleccionada}
                onToggleComment={() => setShowCommentInput(p => !p)}
                onClickComent={setShowCommentInput}
            />

            <hr className="text-white mt-3 m-0" />
            <h6 className="text-white my-2">Comentarios</h6>
            <hr className="text-white mb-3 m-0" />

            {showCommentInput && (
                <div className={`d-flex my-3 ${isCreatingComment ? "disabled-form no-select" : ""}`}>
                    <div>
                        <img
                            src={profilePictureUrl ?? "/Profile.svg"}
                            alt={name ?? "Usuario"}
                            className="cursor-pointer no-select rounded-circle me-1 user-image"
                            onClick={() => setImagenSeleccionada(profilePictureUrl ?? "/Profile.svg")}
                        />
                    </div>

                    <div className="text-white flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="no-select">{name ?? "Usuario"}</span>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={newComment}
                            onChange={e => {
                                setNewComment(e.target.value);
                                autoResize();
                            }}
                            placeholder="Escribe un comentario..."
                            className="textarea-input mb-2"
                            style={{ overflow: "hidden", resize: "none", minHeight: "80px" }}
                        />

                        <button className="white-button" onClick={handleAddComment}>
                            {!isCreatingComment
                                ? "Comentar"
                                : (
                                    <div className="d-flex justify-content-center">
                                        <span>Creando comentario...</span>
                                        <div className="loader ms-3"></div>
                                    </div>
                                )
                            }
                        </button>
                    </div>
                </div>
            )}

            {(!comentarios?.lista || comentarios.lista.length === 0) && (
                <h4 className="text-white text-center mb-3">
                    No hay comentarios en la publicación
                </h4>
            )}

            {(comentarios?.lista ?? []).map((c: any) => (
                <div key={c.Id_comentario || `${c.Fecha_comentario}-${Math.random()}`}>
                    <div className="d-flex my-3">
                        <div>
                            <img
                                src={c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg"}
                                alt={c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}
                                className="cursor-pointer no-select rounded-circle me-1 user-image"
                                onClick={() =>
                                    setImagenSeleccionada(
                                        c.Usuario?.Url_foto_perfil ??
                                        c.Usuario?.url_foto_perfil ??
                                        "/Profile.svg"
                                    )
                                }
                            />
                        </div>

                        <div className="text-white flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="no-select">
                                    <a
                                        className="text-white"
                                        href={"/profile?user=" + c.Usuario?.Correo_electronico}
                                    >
                                        {c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}
                                    </a>
                                </span>
                                <span>{formatFecha(c.Fecha_comentario)}</span>
                            </div>

                            <p className="mb-3">{c.Contenido}</p>
                        </div>
                    </div>
                    <hr className="text-white mb-3 m-0" />
                </div>
            ))}

            <ImageModal
                image={imagenSeleccionada}
                onClose={() => setImagenSeleccionada(null)}
            />
        </div>
    );
}

export default ViewPublication;
