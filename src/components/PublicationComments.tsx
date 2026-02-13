import { useRef, useState } from "react";
import { formatFecha } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import { useCommentActions } from "./hooks/CommentActions";
import ConfirmModal from "./modals/ConfirmModal";

export default function PublicationComments({ publication, showInput, setShowInput, onImageClick, onCommentAdded, onCommentDeleted }: any) {
    const { comments, isCreatingComment, handleAddComment, handleDeleteComment } = useCommentActions(publication.comentarios, publication.Id_publicacion, onCommentAdded, onCommentDeleted);
    const { name, profilePictureUrl } = useUserData();
    const [newComment, setNewComment] = useState("");
    const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const submitComment = async () => {
        const success = await handleAddComment(newComment);
        if (success) {
            setNewComment("");
            setShowInput(false);
        }
    };

    return (
        <div>
            {showInput && (
                <div className={`d-flex my-3 ${isCreatingComment ? "disabled-form no-select" : ""}`}>
                    <div>
                        <img
                            src={profilePictureUrl ?? "/Profile.svg"}
                            alt={name ?? "Usuario"}
                            className="cursor-pointer no-select rounded-circle me-1 user-image"
                            onClick={() => onImageClick(profilePictureUrl ?? "/Profile.svg")}
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
                            onKeyDown={async e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();

                                    if (!newComment.trim() || isCreatingComment) return;

                                    await submitComment();
                                }
                            }}
                            placeholder="Escribe un comentario..."
                            className="textarea-input mb-2"
                            style={{ overflow: "hidden", resize: "none", minHeight: "80px" }}
                        />

                        <button className="white-button" onClick={submitComment}>
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

            {(!comments || comments.length === 0) && (
                <h4 className="text-white text-center mb-3">
                    No hay comentarios en la publicación
                </h4>
            )}

            {comments.map((c: any, index: number) => (
                <div key={c.Id_comentario || `comment-${index}`}>
                    <div className="d-flex my-3">
                        <div>
                            <img
                                src={c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg"}
                                alt={c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}
                                className="cursor-pointer no-select rounded-circle me-1 user-image"
                                onClick={() =>
                                    onImageClick(
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
                                <div className="d-flex align-items-center gap-2">
                                    <span>{formatFecha(c.Fecha_comentario)}</span>
                                    {c.Is_mine && (
                                        <img
                                            src="/Delete.svg"
                                            alt="Eliminar comentario"
                                            className="cursor-pointer"
                                            onClick={() => setCommentToDeleteId(c.Id_comentario)}
                                            style={{ width: "20px", height: "20px" }}
                                        />
                                    )}
                                </div>
                            </div>

                            <p className="mb-3">{c.Contenido}</p>
                        </div>
                    </div>
                    <hr className="text-white mb-3 m-0" />
                </div>
            ))
            }
            <ConfirmModal
                isOpen={commentToDeleteId !== null}
                title="¿Estás seguro de que deseas eliminar este comentario?"
                isLoading={isDeletingComment}
                onConfirm={async () => {
                    if (commentToDeleteId) {
                        setIsDeletingComment(true);
                        await handleDeleteComment(commentToDeleteId);
                        setIsDeletingComment(false);
                        setCommentToDeleteId(null);
                    }
                }}
                onCancel={() => setCommentToDeleteId(null)}
            />
        </div >
    );
}
