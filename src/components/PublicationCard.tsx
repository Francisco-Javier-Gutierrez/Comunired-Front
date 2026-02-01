import { goTo, formatFecha } from "../utils/globalVariables";
import { usePublicationActions } from "./hooks/PublicationsActions";

export default function PublicationCard({ post, onImageClick, onClickComent }: any) {
    const { isLiked, likes, sharedCount, handleLike, handleShare } =
        usePublicationActions(post);

    return (
        <>
            <div className="d-flex my-3 no-select" onClick={() => goTo("/publication?post=" + post.Id_publicacion)}>
                <div>
                    <img src={post.Usuario?.Url_foto_perfil ?? "/Profile.svg"} className="cursor-pointer rounded-circle me-1 user-image"
                        onClick={e => { e.stopPropagation(); onImageClick(post.Usuario?.Url_foto_perfil ?? "/Profile.svg"); }} />
                </div>

                <div className="text-white flex-grow-1">
                    <div className="d-flex justify-content-between mb-3">
                        <a className="text-white cursor-pointer"
                            onClick={e => { e.stopPropagation(); goTo("/profile?user=" + post.Usuario?.Correo_electronico); }}>
                            {post.Usuario?.nombre_usuario}
                        </a>
                        <span>{formatFecha(post.Fecha_publicacion)}</span>
                    </div>

                    <p>{post.Contenido}</p>

                    {post.Url_imagen && (
                        <img src={post.Url_imagen} className="rounded-3 mb-3 w-50 d-block mx-auto"
                            onClick={e => { e.stopPropagation(); onImageClick(post.Url_imagen); }} />
                    )}

                    <div className="d-flex justify-content-between mt-2">
                        <div onClick={e => { e.stopPropagation(); handleLike(); }}>
                            <img className="me-1" src={isLiked ? "Like_active.svg" : "Like.svg"} width={20} />
                            {likes}
                        </div>

                        <div onClick={e => { e.stopPropagation(); onClickComent(true); }}>
                            <img className="me-1" src="Comment.svg" width={20} />
                            {post.comentarios?.total ?? 0}
                        </div>

                        <div onClick={e => { e.stopPropagation(); handleShare(); }}>
                            <img className="me-1" src="Share.svg" width={20} />
                            {sharedCount}
                        </div>
                    </div>
                </div>
            </div>
            <hr className="text-white m-0" />
        </>
    );
}
