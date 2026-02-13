import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatFecha } from "../utils/GlobalVariables";
import { usePublicationActions } from "./hooks/PublicationsActions";
import ConfirmModal from "./modals/ConfirmModal";
import LocationPicker from "./LocationPicker";

export default function PublicationCard({ post, onImageClick, onClickComent, isPreview = false }: any) {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isLiked, likes, sharedCount, handleLike, handleShare, handleDelete } =
        usePublicationActions(post);

    return (
        <>
            <div className={`d-flex my-3 no-select ${isPreview ? "" : "cursor-pointer"}`} onClick={() => !isPreview && navigate("/publication?post=" + post.Id_publicacion)}>
                <div>
                    <img src={post.Usuario?.Url_foto_perfil ?? "/Profile.svg"} className="cursor-pointer rounded-circle me-1 user-image"
                        onClick={e => { e.stopPropagation(); onImageClick(post.Usuario?.Url_foto_perfil ?? "/Profile.svg"); }} />
                </div>

                <div className="text-white flex-grow-1">
                    <div className="d-flex justify-content-between mb-3">
                        <a className={`text-white ${isPreview ? "" : "cursor-pointer"}`}
                            onClick={e => { e.stopPropagation(); !isPreview && navigate("/profile?user=" + post.Usuario?.Correo_electronico); }}>
                            {post.Usuario?.nombre_usuario}
                        </a>
                        <div className="d-flex align-items-center">
                            <span className="me-3">{formatFecha(post.Fecha_publicacion)}</span>
                            {post.Is_mine && (
                                <img
                                    src="Delete.svg"
                                    className={`cursor-pointer`}
                                    width={20}
                                    alt="Eliminar"
                                    onClick={e => { e.stopPropagation(); !isPreview && setShowDeleteModal(true); }}
                                />
                            )}
                        </div>
                    </div>

                    <p>{post.Contenido}</p>

                    {post.Lat && post.Long && (
                        <div className="mb-3 w-75 mx-auto" onClick={e => e.stopPropagation()}>
                            <LocationPicker
                                latitude={Number(post.Lat)}
                                longitude={Number(post.Long)}
                                readOnly={true}
                            />
                        </div>
                    )}

                    {post.Url_imagen && (
                        <img src={post.Url_imagen} className="rounded-3 mb-3 w-50 d-block mx-auto cursor-pointer"
                            onClick={e => { e.stopPropagation(); onImageClick(post.Url_imagen); }} />
                    )}

                    {post.Url_video && (
                        <video src={post.Url_video} className="rounded-3 mb-3 w-75 d-block mx-auto" controls
                            onClick={e => e.stopPropagation()} />
                    )}

                    <div className="d-flex justify-content-between mt-2">
                        <div onClick={e => { e.stopPropagation(); !isPreview && handleLike(); }}>
                            <img className="me-1 cursor-pointer" src={isLiked ? "Like_active.svg" : "Like.svg"} width={20} />
                            {likes}
                        </div>

                        <div onClick={e => { if (onClickComent) { e.stopPropagation(); !isPreview && onClickComent(); } }}>
                            <img className="me-1 cursor-pointer" src="Comment.svg" width={20} />
                            {post.comentarios?.total ?? 0}
                        </div>

                        <div onClick={e => { e.stopPropagation(); !isPreview && handleShare(); }}>
                            <img className="me-1 cursor-pointer" src="Share.svg" width={20} />
                            {sharedCount}
                        </div>
                    </div>
                </div>
            </div>
            <hr className="text-white m-0" />
            <ConfirmModal
                isOpen={showDeleteModal}
                title="¿Estás seguro de que deseas eliminar esta publicación?"
                isLoading={isDeleting}
                onConfirm={async () => {
                    setIsDeleting(true);
                    await handleDelete();
                    setIsDeleting(false);
                    setShowDeleteModal(false);
                }}
                onCancel={() => setShowDeleteModal(false)}
            />
        </>
    );
}
