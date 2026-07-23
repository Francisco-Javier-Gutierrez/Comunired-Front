import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { useUserData } from "../../utils/UserStore";
import type { CommentData } from "../../types";

type CommentSuccessHandler = (count?: number) => void;

const removeCommentWithChildren = (items: CommentData[], commentId: string) => {
    const childrenByParent = new Map<string, CommentData[]>();

    items.forEach((comment) => {
        if (!comment.parentCommentId) return;
        const children = childrenByParent.get(comment.parentCommentId) || [];
        children.push(comment);
        childrenByParent.set(comment.parentCommentId, children);
    });

    const idsToRemove = new Set<string>();
    const queue = [commentId];

    while (queue.length > 0) {
        const id = queue.shift();
        if (!id || idsToRemove.has(id)) continue;
        idsToRemove.add(id);

        (childrenByParent.get(id) || []).forEach((child) => queue.push(child.id));
    }

    return {
        next: items.filter((comment) => !idsToRemove.has(comment.id)),
        removedCount: idsToRemove.size
    };
};

const bumpRepliesCount = (items: CommentData[], parentCommentId: string, delta: number) =>
    items.map((comment) => comment.id === parentCommentId
        ? { ...comment, repliesCount: Math.max(0, (comment.repliesCount || 0) + delta) }
        : comment
    );

export function useCommentActions(initialComments: any, publicationId: string, onSuccess?: CommentSuccessHandler, onDeleteSuccess?: CommentSuccessHandler) {
    const [comments, setComments] = useState<CommentData[]>(initialComments?.list || []);
    const [totalComments, setTotalComments] = useState(initialComments?.total || 0);
    const [isCreatingComment, setIsCreatingComment] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const { name, profilePictureUrl, email } = useUserData();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMessage, setAuthMessage] = useState("");

    const triggerAuth = (message: string) => {
        setAuthMessage(message);
        setShowAuthModal(true);
    };

    const fetchComments = useCallback(async (token: string | null = null, limit: number = 20) => {
        setIsLoadingComments(true);
        try {
            const res = await api.comments.list(publicationId, limit, token);
            setComments((prev: CommentData[]) => token ? [...prev, ...res.items] : res.items);
            setHasMore(res.hasMore);
            setNextToken(res.nextToken ?? null);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setIsLoadingComments(false);
        }
    }, [publicationId]);

    useEffect(() => {
        if (publicationId) {
            fetchComments();
        }
    }, [publicationId, fetchComments]);

    const handleAddComment = async (content: string, parentCommentId: string | null = null) => {
        if (!content.trim()) return false;
        setIsCreatingComment(true);

        try {
            const res = await api.comments.create(publicationId, content, parentCommentId);

            if (res.id) {
                const apiComment = res.comment;
                const newComm: CommentData = {
                    id: res.id,
                    content,
                    createdAt: apiComment?.createdAt || new Date().toISOString(),
                    parentCommentId: apiComment?.parentCommentId ?? parentCommentId,
                    repliesCount: apiComment?.repliesCount ?? 0,
                    canDelete: apiComment?.canDelete ?? true,
                    canUpdate: apiComment?.canUpdate ?? true,
                    user: apiComment?.user ?? {
                        email: email ?? "",
                        username: name ?? "Usuario",
                        profilePicUrl: profilePictureUrl ?? "/Profile.svg",
                        role: "user"
                    }
                };

                setComments((prev: CommentData[]) => {
                    const next = [newComm, ...prev];
                    return parentCommentId ? bumpRepliesCount(next, parentCommentId, 1) : next;
                });
                setTotalComments((prev: number) => prev + 1);
                if (onSuccess) onSuccess(1);
                return true;
            }
        } catch (err: any) {
            if (err.message.includes("401")) triggerAuth("Para comentar necesitas iniciar sesion en Comunired.");
            else if (err.message.includes("403")) triggerAuth("Usted esta baneado, no puede comentar.");
            return false;
        } finally {
            setIsCreatingComment(false);
        }
        return false;
    };

    const handleEditComment = async (commentId: string, newContent: string) => {
        if (!newContent.trim()) return false;

        try {
            await api.comments.edit(commentId, newContent);
            setComments((prev: CommentData[]) => prev.map((comment: CommentData) =>
                comment.id === commentId ? { ...comment, content: newContent } : comment
            ));
            return true;
        } catch (err: any) {
            if (err.message.includes("401")) triggerAuth("Para editar un comentario necesitas iniciar sesion.");
            else if (err.message.includes("403")) triggerAuth("No tienes permiso para editar este comentario.");
        }
        return false;
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const res = await api.comments.delete(commentId);
            let removedLocally = 1;

            setComments((prev: CommentData[]) => {
                const comment = prev.find((item) => item.id === commentId);
                const result = removeCommentWithChildren(prev, commentId);
                removedLocally = result.removedCount;
                return comment?.parentCommentId
                    ? bumpRepliesCount(result.next, comment.parentCommentId, -1)
                    : result.next;
            });

            const deletedCount = res.data?.deletedCount ?? removedLocally;
            setTotalComments((prev: number) => Math.max(0, prev - deletedCount));
            if (onDeleteSuccess) onDeleteSuccess(deletedCount);
            return true;
        } catch (err: any) {
            if (err.message.includes("401")) triggerAuth("Para eliminar un comentario necesitas iniciar sesion.");
            else if (err.message.includes("403")) triggerAuth("No tienes permiso para eliminar este comentario.");
            return false;
        }
    };

    return {
        comments,
        totalComments,
        isCreatingComment,
        isLoadingComments,
        nextToken,
        hasMore,
        fetchComments,
        showAuthModal,
        setShowAuthModal,
        authMessage,
        handleAddComment,
        handleEditComment,
        handleDeleteComment
    };
}
