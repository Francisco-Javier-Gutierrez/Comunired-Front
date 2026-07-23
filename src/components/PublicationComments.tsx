import { useRef, useState, useEffect, useMemo } from "react";
import { formatFecha } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import { useCommentActions } from "./hooks/CommentActions";
import ConfirmModal from "./modals/ConfirmModal";
import RequireAuthModal from "./modals/RequireAuthModal";
import { Box, Flex, Text, Textarea, Button, Spinner, Image, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type { CommentData } from "../types";

type CommentNode = CommentData & { children: CommentNode[] };

const toTime = (value?: string) => {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const buildCommentTree = (items: CommentData[]): CommentNode[] => {
    const nodes = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    items.forEach((comment) => {
        nodes.set(comment.id, { ...comment, children: [] });
    });

    nodes.forEach((node) => {
        const parentId = node.parentCommentId;
        const parent = parentId ? nodes.get(parentId) : undefined;

        if (parent && parent.id !== node.id) {
            parent.children.push(node);
        } else {
            roots.push(node);
        }
    });

    roots.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));

    const sortChildren = (comments: CommentNode[]) => {
        comments.sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt));
        comments.forEach((comment) => sortChildren(comment.children));
    };

    roots.forEach((comment) => sortChildren(comment.children));
    return roots;
};

export default function PublicationComments({ publication, showInput, setShowInput, onImageClick, onCommentAdded, onCommentDeleted, targetCommentId }: any) {
    const {
        comments,
        isCreatingComment,
        isLoadingComments,
        hasMore,
        nextToken,
        fetchComments,
        showAuthModal,
        setShowAuthModal,
        authMessage,
        handleAddComment,
        handleEditComment,
        handleDeleteComment
    } = useCommentActions(publication.comments, publication.id, onCommentAdded, onCommentDeleted);
    const { name, profilePictureUrl, email: globalEmail, role: globalRole } = useUserData();
    const isBannedUser = globalRole === "banned";
    const [newComment, setNewComment] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
    const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [isEditingComment, setIsEditingComment] = useState(false);

    const [showOptionsId, setShowOptionsId] = useState<string | null>(null);
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

    const commentToDeleteIdRef = useRef<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const highlightedTargetRef = useRef<string | null>(null);
    const navigate = useNavigate();
    const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
                setShowOptionsId(null);
            }
        };
        if (showOptionsId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showOptionsId]);

    useEffect(() => {
        highlightedTargetRef.current = null;
        setHighlightedCommentId(null);
    }, [targetCommentId]);

    useEffect(() => {
        if (!targetCommentId) return;

        const hasTarget = comments.some((comment) => comment.id === targetCommentId);
        if (!hasTarget && hasMore && nextToken && !isLoadingComments) {
            fetchComments(nextToken, 50);
        }
    }, [comments, fetchComments, hasMore, isLoadingComments, nextToken, targetCommentId]);

    useEffect(() => {
        if (!targetCommentId || highlightedTargetRef.current === targetCommentId) return;
        if (!comments.some((comment) => comment.id === targetCommentId)) return;

        const timer = window.setTimeout(() => {
            const target = document.getElementById(`comment-${targetCommentId}`);
            if (!target) return;

            highlightedTargetRef.current = targetCommentId;
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedCommentId(targetCommentId);
            window.setTimeout(() => setHighlightedCommentId(null), 2400);
        }, 100);

        return () => window.clearTimeout(timer);
    }, [comments, targetCommentId]);

    const autoResize = (textarea: HTMLTextAreaElement | null) => {
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const submitComment = async () => {
        const success = await handleAddComment(newComment);
        if (success) {
            setNewComment("");
        }
        setShowInput(false);
    };

    const submitReply = async (parentCommentId: string) => {
        const success = await handleAddComment(replyContent, parentCommentId);
        if (success) {
            setReplyContent("");
            setReplyingToCommentId(null);
        }
    };

    const openDeleteModal = (id: string) => {
        commentToDeleteIdRef.current = id;
        setCommentToDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        const id = commentToDeleteIdRef.current;
        if (!id) return;
        setIsDeletingComment(true);
        await handleDeleteComment(id);
        setIsDeletingComment(false);
        commentToDeleteIdRef.current = null;
        setCommentToDeleteId(null);
    };

    const submitEditComment = async (id: string) => {
        if (!editingContent.trim() || editingContent === comments.find((c: any) => c.id === id)?.content) {
            setEditingCommentId(null);
            return;
        }
        setIsEditingComment(true);
        const success = await handleEditComment(id, editingContent);
        setIsEditingComment(false);
        if (success) {
            setEditingCommentId(null);
            setEditingContent("");
        }
    };

    const renderReplyInput = (parentCommentId: string) => (
        <Box mt={2} mb={3}>
            <Textarea
                ref={replyTextareaRef}
                value={replyContent}
                onChange={e => {
                    setReplyContent(e.target.value);
                    autoResize(replyTextareaRef.current);
                }}
                onKeyDown={async e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!replyContent.trim() || isCreatingComment) return;
                        await submitReply(parentCommentId);
                    }
                }}
                placeholder="Escribe una respuesta..."
                bg="var(--input-bg)"
                color="var(--text-color)"
                borderRadius="0.5rem"
                borderColor="var(--text-color)"
                _placeholder={{ color: "gray.400" }}
                minH="56px"
                overflow="hidden"
                resize="none"
                autoFocus
                _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
            />
            <Flex justify="flex-end" gap={2} mt={2}>
                <Button size="sm" bg="transparent" color="gray.400" _hover={{ color: "white" }} onClick={() => setReplyingToCommentId(null)} disabled={isCreatingComment}>
                    Cancelar
                </Button>
                <Button size="sm" bg="var(--button-bg)" color="var(--button-text)" _hover={{ opacity: 0.8 }} onClick={() => submitReply(parentCommentId)} disabled={isCreatingComment || !replyContent.trim()}>
                    {isCreatingComment ? <Spinner size="xs" color="var(--button-text)" /> : "Responder"}
                </Button>
            </Flex>
        </Box>
    );

    const renderComment = (c: CommentNode, depth: number = 0) => (
        <Box
            key={c.id}
            id={`comment-${c.id}`}
            className={highlightedCommentId === c.id ? "comment-highlight-blink" : undefined}
            scrollMarginTop="90px"
            ml={depth > 0 ? 4 : 0}
            pl={depth > 0 ? 3 : 0}
            borderLeft={depth > 0 ? "1px solid var(--border-color)" : "none"}
            borderRadius="sm"
        >
            <Flex my={3} align="flex-start">
                <Box>
                    <Image
                        src={c.user?.profilePicUrl ?? "/Profile.svg"}
                        alt={c.user?.username ?? "Usuario"}
                        cursor="pointer"
                        userSelect="none"
                        borderRadius="full"
                        mr={1}
                        boxSize="1rem"
                        objectFit="cover"
                        onClick={() =>
                            onImageClick(
                                c.user?.profilePicUrl ??
                                "/Profile.svg"
                            )
                        }
                    />
                </Box>

                <Box color="var(--text-color)" flexGrow={1} minW={0}>
                    <Flex justify="space-between" align="center" mb={2} gap={2}>
                        <Text userSelect="none" minW={0} overflowWrap="anywhere">
                            <Link
                                color="var(--text-color)"
                                onClick={() => navigate("/profile?user=" + c.user?.email)}
                                _hover={{ textDecoration: "underline" }}
                            >
                                {c.user?.username ?? "Usuario"}
                            </Link>
                        </Text>
                        <Flex align="center" gap={3} position="relative" ref={showOptionsId === c.id ? optionsRef : null} flexShrink={0}>
                            <Text>{formatFecha(c.createdAt)}</Text>
                            {c.canDelete && !isBannedUser && (
                                <>
                                    <Image
                                        src="/Show_Options.svg"
                                        alt="Opciones"
                                        cursor="pointer"
                                        filter="invert(0)"
                                        height="1.2rem"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowOptionsId(showOptionsId === c.id ? null : c.id);
                                        }}
                                    />
                                    {showOptionsId === c.id && (
                                        <Flex
                                            direction="column"
                                            position="absolute"
                                            right="0"
                                            top="100%"
                                            bg="#2d2d2d"
                                            borderRadius="md"
                                            boxShadow="0 4px 12px rgba(0,0,0,0.5)"
                                            zIndex={10}
                                            py={2}
                                            w="150px"
                                        >
                                            {c.canUpdate && (
                                                <Flex
                                                    align="center"
                                                    px={4}
                                                    py={2}
                                                    cursor="pointer"
                                                    _hover={{ bg: "#3d3d3d" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowOptionsId(null);
                                                        setEditingCommentId(c.id);
                                                        setEditingContent(c.content);
                                                    }}
                                                >
                                                    <Image src="/Edit.svg" width="20px" mr={3} alt="Editar" filter="none" />
                                                    <Text fontSize="sm" color="var(--text-color)" fontWeight="bold">Editar</Text>
                                                </Flex>
                                            )}
                                            <Flex
                                                align="center"
                                                px={4}
                                                py={2}
                                                cursor="pointer"
                                                _hover={{ bg: "#3d3d3d" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowOptionsId(null);
                                                    openDeleteModal(c.id);
                                                }}
                                            >
                                                <Image src="/Delete.svg" width="20px" mr={3} alt="Eliminar" />
                                                <Text fontSize="sm" color="red.500" fontWeight="bold">Eliminar</Text>
                                            </Flex>
                                        </Flex>
                                    )}
                                </>
                            )}
                        </Flex>
                    </Flex>

                    {editingCommentId === c.id ? (
                        <Box mb={3} mt={1}>
                            <Textarea
                                value={editingContent}
                                onChange={e => setEditingContent(e.target.value)}
                                bg="#2d2d2d"
                                color="var(--text-color)"
                                borderRadius="0.5rem"
                                borderColor="transparent"
                                _focus={{ borderColor: "gray.400", boxShadow: "none", outline: "none" }}
                                autoFocus
                                minH="60px"
                                resize="none"
                                mb={2}
                            />
                            <Flex justify="flex-end" gap={2}>
                                <Button size="sm" bg="transparent" color="gray.400" _hover={{ color: "white" }} onClick={() => setEditingCommentId(null)} disabled={isEditingComment}>
                                    Cancelar
                                </Button>
                                <Button size="sm" bg="var(--button-bg)" color="var(--button-text)" _hover={{ opacity: 0.8 }} onClick={() => submitEditComment(c.id)} disabled={isEditingComment}>
                                    {isEditingComment ? <Spinner size="xs" color="var(--button-text)" /> : "Guardar"}
                                </Button>
                            </Flex>
                        </Box>
                    ) : (
                        <Text mb={2} whiteSpace="pre-wrap" overflowWrap="anywhere">{c.content}</Text>
                    )}

                    {!isBannedUser && editingCommentId !== c.id && (
                        <Button
                            size="xs"
                            variant="ghost"
                            color="var(--muted-color)"
                            px={0}
                            minW="auto"
                            h="auto"
                            _hover={{ color: "var(--text-color)", bg: "transparent" }}
                            onClick={() => {
                                setReplyingToCommentId(c.id);
                                setReplyContent("");
                            }}
                        >
                            Responder{c.repliesCount ? ` (${c.repliesCount})` : ""}
                        </Button>
                    )}

                    {replyingToCommentId === c.id && renderReplyInput(c.id)}
                </Box>
            </Flex>

            {c.children.map((child) => renderComment(child, depth + 1))}
            <Box as="hr" borderColor="var(--text-color)" mb={3} m={0} opacity={depth > 0 ? 0.35 : 1} />
        </Box>
    );

    return (
        <Box>
            {showInput && !isBannedUser && (
                <Flex my={3} className={isCreatingComment ? "disabled-form" : ""} userSelect="none">
                    <Box>
                        <Image
                            src={profilePictureUrl ?? "/Profile.svg"}
                            alt={name ?? "Usuario"}
                            cursor="pointer"
                            userSelect="none"
                            borderRadius="full"
                            mr={1}
                            boxSize="1rem"
                            objectFit="cover"
                            onClick={() => onImageClick(profilePictureUrl ?? "/Profile.svg")}
                        />
                    </Box>

                    <Box color="var(--text-color)" flexGrow={1}>
                        <Flex justify="space-between" align="center" mb={2}>
                            <Text userSelect="none">{name ?? "Usuario"}</Text>
                        </Flex>

                        <Textarea
                            ref={textareaRef}
                            value={newComment}
                            onChange={e => {
                                setNewComment(e.target.value);
                                autoResize(textareaRef.current);
                            }}
                            onKeyDown={async e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();

                                    if (!newComment.trim() || isCreatingComment) return;

                                    await submitComment();
                                }
                            }}
                            placeholder="Escribe un comentario..."
                            mb={2}
                            bg="var(--input-bg)"
                            color="var(--text-color)"
                            borderRadius="0.5rem"
                            borderColor="var(--text-color)"
                            _placeholder={{ color: "gray.400" }}
                            minH="80px"
                            overflow="hidden"
                            resize="none"
                            _focus={{ border: "solid 0.05rem #7e7e7e", boxShadow: "none", outline: "none" }}
                        />

                        <Button
                            bg="var(--button-bg)"
                            color="var(--button-text)"
                            width="100%"
                            _hover={{ bg: "var(--button-hover-bg)" }}
                            onClick={submitComment}
                            borderRadius="1rem"
                        >
                            {!isCreatingComment
                                ? "Comentar"
                                : (
                                    <Flex justify="center" align="center">
                                        <Text mr={3}>Creando comentario...</Text>
                                        <Spinner size="sm" color="var(--button-text)" />
                                    </Flex>
                                )
                            }
                        </Button>
                    </Box>
                </Flex>
            )}

            {isLoadingComments && comments.length === 0 && (
                <Flex justify="center" my={5}>
                    <Spinner color="var(--text-color)" />
                </Flex>
            )}

            {(!comments || comments.length === 0) && !isLoadingComments && (!showInput || isBannedUser) && (
                <Text as="h4" color="var(--text-color)" textAlign="center" mb={3} fontSize="lg" fontWeight="bold">
                    No hay comentarios en la publicacion
                </Text>
            )}

            {commentTree.map((comment) => renderComment(comment))}

            {hasMore && (
                <Flex justify="center" my={4}>
                    <Button
                        size="sm"
                        variant="ghost"
                        color="var(--text-color)"
                        onClick={() => fetchComments(nextToken)}
                        loading={isLoadingComments}
                        _hover={{ bg: "whiteAlpha.200" }}
                    >
                        Cargar mas comentarios
                    </Button>
                </Flex>
            )}
            <ConfirmModal
                isOpen={commentToDeleteId !== null}
                title={
                    commentToDeleteId && comments.find((c: any) => c.id === commentToDeleteId)?.user?.email === globalEmail
                        ? "Estas seguro de que deseas eliminar tu comentario?"
                        : "Estas seguro de que deseas eliminar el comentario de este usuario?"
                }
                isLoading={isDeletingComment}
                onConfirm={handleConfirmDelete}
                onCancel={() => { commentToDeleteIdRef.current = null; setCommentToDeleteId(null); }}
            />
            <RequireAuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message={authMessage}
            />
        </Box >
    );
}
