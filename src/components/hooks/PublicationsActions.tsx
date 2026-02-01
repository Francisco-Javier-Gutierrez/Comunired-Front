import { useRef, useState } from "react";
import axios from "axios";
import { BackendApi, goTo, getToken } from "../../utils/globalVariables";

export function usePublicationActions(post: any) {
    const [isLiked, setIsLiked] = useState(
        post?.is_Liked ?? post?.Is_Liked ?? post?.is_liked ?? false
    );
    const [likes, setLikes] = useState(post.likes?.total ?? 0);
    const [sharedCount, setSharedCount] = useState(post.compartidos?.total ?? 0);

    const shareLock = useRef(false);
    const processingLikes = useRef(false);

    const handleLike = async () => {
        if (processingLikes.current) return;
        processingLikes.current = true;

        const change = isLiked ? -1 : 1;

        setIsLiked((prev: any) => !prev);
        setLikes((prev: any) => Number(prev) + change);

        const token = await getToken();

        await axios.post(
            isLiked ? BackendApi.unlike_publications_url : BackendApi.like_publications_url,
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

                if (err?.response?.status === 401) goTo("/login");
                if (err?.response?.status === 403) alert("Usted está baneado");
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
            window.location.href + "publication?post=" + post.Id_publicacion
        );
        alert("Url copiada exitosamente");

        const token = await getToken();

        await axios.post(
            BackendApi.share_publication_url,
            { Id_objetivo: post.Id_publicacion },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
            .catch(() => {
                setSharedCount(previousValue);
            })
            .finally(() => {
                setTimeout(() => {
                    shareLock.current = false;
                }, 600);
            });
    };

    return {
        isLiked,
        likes,
        sharedCount,
        handleLike,
        handleShare
    };
}
