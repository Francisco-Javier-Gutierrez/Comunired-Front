import { useRef, useState } from "react";
import axios from "axios";
import { apiRoutes, getToken } from "../../utils/GlobalVariables";

export function usePublicationActions(post: any) {
    const [isLiked, setIsLiked] = useState(
        post?.is_Liked ?? post?.Is_Liked ?? post?.is_liked ?? false
    );
    const [likes, setLikes] = useState(post.likes?.total ?? 0);
    const [sharedCount, setSharedCount] = useState(post.compartidos?.total ?? 0);

    const shareLock = useRef(false);
    const processingLikes = useRef(false);
    const [showCopied, setShowCopied] = useState(false);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMessage, setAuthMessage] = useState("");

    const triggerAuth = (message: string) => {
        setAuthMessage(message);
        setShowAuthModal(true);
    };

    const handleLike = async () => {
        if (processingLikes.current) return;
        processingLikes.current = true;

        const change = isLiked ? -1 : 1;

        setIsLiked((prev: any) => !prev);
        setLikes((prev: any) => Number(prev) + change);

        const token = await getToken();

        await axios.post(
            isLiked ? apiRoutes.unlike_publications_url : apiRoutes.like_publications_url,
            { Id_objetivo: post.Id_publicacion },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .catch(err => {
                setIsLiked((prev: any) => !prev);
                setLikes((prev: any) => Number(prev) - change);

                if (err?.response?.status === 401) triggerAuth("Para dar me gusta a una publicación necesitas iniciar sesión.");
                if (err?.response?.status === 403) triggerAuth("Parece que no tienes permisos o estás baneado.");
            })
            .finally(() => {
                processingLikes.current = false;
            });
    };

    const handleShare = async () => {
        if (shareLock.current) return;
        shareLock.current = true;

        const previousValue = sharedCount;

        setSharedCount((prev: number) => prev + 1);
        navigator.clipboard.writeText(
            "https://comuni-red.com/publication?post=" + post.Id_publicacion
        );
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);

        const token = await getToken();

        await axios.post(
            apiRoutes.share_publication_url,
            { Id_objetivo: post.Id_publicacion },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .catch((err) => {
                setSharedCount(previousValue);
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    triggerAuth("Tu compartido no se ha registrado porque no tienes sesión iniciada, pero aún puedes compartir el enlace.");
                }
            })
            .finally(() => {
                setTimeout(() => {
                    shareLock.current = false;
                }, 600);
            });
    };

    const handleDelete = async () => {
        try {
            const token = await getToken();
            await axios.post(
                apiRoutes.delete_publication_url,
                { Id_publicacion: post.Id_publicacion },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            window.location.reload();
        } catch (err: any) {
            if (err?.response?.status === 401) triggerAuth("Para eliminar una publicación necesitas iniciar sesión.");
            if (err?.response?.status === 403) triggerAuth("No tienes permisos para eliminar esta publicación.");
        }
    };

    return {
        isLiked,
        likes,
        sharedCount,
        showCopied,
        showAuthModal,
        setShowAuthModal,
        authMessage,
        handleLike,
        handleShare,
        handleDelete
    };
}
