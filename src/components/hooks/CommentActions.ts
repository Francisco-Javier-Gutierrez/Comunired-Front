import { useState } from "react";
import axios from "axios";
import { apiRoutes, getToken } from "../../utils/GlobalVariables";
import { useUserData } from "../../utils/UserStore";

export function useCommentActions(initialComments: any, publicationId: string, onSuccess?: () => void, onDeleteSuccess?: () => void) {
    const [comments, setComments] = useState(initialComments?.lista || []);
    const [totalComments, setTotalComments] = useState(initialComments?.total || 0);
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const { name, profilePictureUrl } = useUserData();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMessage, setAuthMessage] = useState("");

    const triggerAuth = (message: string) => {
        setAuthMessage(message);
        setShowAuthModal(true);
    };

    const handleAddComment = async (content: string) => {
        if (!content.trim()) return false;
        setIsCreatingComment(true);

        try {
            const token = await getToken();
            const res = await axios.post(
                apiRoutes.comment_publication_url,
                { Id_objetivo: publicationId, Contenido: content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data?.id) {
                const newComm = {
                    id_comentario: res.data.id,
                    contenido: content,
                    fecha_comentario: new Date().toISOString(),
                    Is_mine: true,
                    Usuario: {
                        Nombre_usuario: name ?? "Usuario",
                        Url_foto_perfil: profilePictureUrl ?? "/Profile.svg"
                    }
                };

                setComments((prev: any[]) => [newComm, ...prev]);
                setTotalComments((prev: number) => prev + 1);
                if (onSuccess) onSuccess();
                return true;
            }
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401) triggerAuth("Para comentar necesitas iniciar sesión en Comunired.");
            if (status === 403) triggerAuth("Usted está baneado, no puede comentar.");
            console.error(err);
            return false;
        } finally {
            setIsCreatingComment(false);
        }
        return false;
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const token = await getToken();
            await axios.post(
                apiRoutes.delete_comment_url,
                { Id_comentario: commentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setComments((prev: any[]) => prev.filter((c: any) => c.id_comentario !== commentId));
            setTotalComments((prev: number) => prev - 1);
            if (onDeleteSuccess) onDeleteSuccess();
            return true;
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401) triggerAuth("Para eliminar un comentario necesitas iniciar sesión.");
            if (status === 403) triggerAuth("No tienes permiso para eliminar este comentario.");
            console.error(err);
            return false;
        }
    };

    return {
        comments,
        totalComments,
        isCreatingComment,
        showAuthModal,
        setShowAuthModal,
        authMessage,
        handleAddComment,
        handleDeleteComment
    };
}
