import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import type { Publication, ReportPayload } from "../../types";

export function usePublicationActions(post: Publication) {
    const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
    const [isSaved, setIsSaved] = useState(post?.isSaved ?? false);
    const [likes, setLikes] = useState(post.likesCount ?? 0);
    const [sharedCount, setSharedCount] = useState(post.sharesCount ?? 0);

    const shareLock = useRef(false);
    const saveLock = useRef(false);
    const reportLock = useRef(false);
    const processingLikes = useRef(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMessage, setAuthMessage] = useState("");

    useEffect(() => {
        setIsLiked(post.isLiked ?? false);
        setIsSaved(post.isSaved ?? false);
        setLikes(post.likesCount ?? 0);
        setSharedCount(post.sharesCount ?? 0);
    }, [post.id, post.isLiked, post.isSaved, post.likesCount, post.sharesCount]);

    const triggerAuth = (message: string) => {
        setAuthMessage(message);
        setShowAuthModal(true);
    };

    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => setFeedbackMessage(""), 2000);
    };

    const handleLike = async () => {
        if (processingLikes.current) return;
        processingLikes.current = true;

        const change = isLiked ? -1 : 1;

        setIsLiked((prev: any) => !prev);
        setLikes((prev: any) => Number(prev) + change);

        try {
            if (isLiked) {
                await api.social.unlike(post.id);
            } else {
                await api.social.like(post.id);
            }
        } catch (err: any) {
            setIsLiked((prev: any) => !prev);
            setLikes((prev: any) => Number(prev) - change);

            if (err.message.includes("401")) triggerAuth("Para dar me gusta a una publicacion necesitas iniciar sesion.");
            else if (err.message.includes("403")) triggerAuth("Parece que no tienes permisos o estas baneado.");
        } finally {
            processingLikes.current = false;
        }
    };

    const handleSave = async () => {
        if (saveLock.current) return;
        saveLock.current = true;
        const previous = isSaved;
        setIsSaved(!previous);

        try {
            if (previous) {
                await api.social.unsave(post.id);
                showFeedback("Publicacion quitada de guardados");
            } else {
                await api.social.save(post.id);
                showFeedback("Publicacion guardada");
            }
        } catch (err: any) {
            setIsSaved(previous);
            if (err.message.includes("401")) triggerAuth("Para guardar publicaciones necesitas iniciar sesion.");
            else if (err.message.includes("403")) triggerAuth("No puedes guardar publicaciones con este usuario.");
        } finally {
            saveLock.current = false;
        }
    };

    const handleReport = async (payload: ReportPayload) => {
        if (reportLock.current) return;
        reportLock.current = true;

        try {
            await api.social.report("publication", post.id, payload);
            showFeedback("Reporte enviado a moderacion");
        } catch (err: any) {
            if (err.message.includes("401")) triggerAuth("Para reportar necesitas iniciar sesion.");
            else if (err.message.includes("403")) triggerAuth("No puedes reportar con este usuario.");
        } finally {
            reportLock.current = false;
        }
    };

    const handleShare = async () => {
        if (shareLock.current) return;
        shareLock.current = true;

        const previousValue = sharedCount;

        setSharedCount((prev: number) => prev + 1);
        navigator.clipboard.writeText("https://comuni-red.com/publication?post=" + post.id);
        showFeedback("URL copiada al portapapeles");

        try {
            await api.social.share(post.id);
        } catch (err: any) {
            setSharedCount(previousValue);
            if (err.message.includes("401") || err.message.includes("403")) {
                triggerAuth("Tu compartido no se ha registrado porque no tienes sesion iniciada, pero aun puedes compartir el enlace.");
            }
        } finally {
            setTimeout(() => {
                shareLock.current = false;
            }, 600);
        }
    };

    const handleDelete = async () => {
        try {
            await api.publications.delete(post.id);
            window.location.reload();
        } catch (err: any) {
            if (err.message.includes("401")) triggerAuth("Para eliminar una publicacion necesitas iniciar sesion.");
            else if (err.message.includes("403")) triggerAuth("No tienes permisos para eliminar esta publicacion.");
        }
    };

    return {
        isLiked,
        isSaved,
        likes,
        sharedCount,
        showCopied: !!feedbackMessage,
        feedbackMessage,
        showAuthModal,
        setShowAuthModal,
        authMessage,
        handleLike,
        handleSave,
        handleReport,
        handleShare,
        handleDelete
    };
}
