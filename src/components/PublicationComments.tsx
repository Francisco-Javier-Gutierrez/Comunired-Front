import { useRef, useState, useEffect } from "react";
import { formatFecha } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import { useCommentActions } from "./hooks/CommentActions";
import ConfirmModal from "./modals/ConfirmModal";
import RequireAuthModal from "./modals/RequireAuthModal";
import { Box, Flex, Text, Textarea, Button, Spinner, Image, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function PublicationComments({ publication, showInput, setShowInput, onImageClick, onCommentAdded, onCommentDeleted }: any) {
    const { comments, isCreatingComment, showAuthModal, setShowAuthModal, authMessage, handleAddComment, handleEditComment, handleDeleteComment } = useCommentActions(publication.comentarios, publication.Id_publicacion, onCommentAdded, onCommentDeleted);
    const { name, profilePictureUrl } = useUserData();
    const [newComment, setNewComment] = useState("");
    const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [isEditingComment, setIsEditingComment] = useState(false);

    const [showOptionsId, setShowOptionsId] = useState<string | null>(null);

    const commentToDeleteIdRef = useRef<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
        }
        setShowInput(false);
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
        if (!editingContent.trim() || editingContent === comments.find((c: any) => c.id_comentario === id)?.contenido) {
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

    return (
        <Box>
            {showInput && (
                <Flex my={3} className={isCreatingComment ? "disabled-form" : ""} userSelect="none">
                    <Box>
                        <Image
                            src={profilePictureUrl ?? "/Profile.svg"}
                            alt={name ?? "Usuario"}
                            cursor="pointer"
                            userSelect="none"
                            borderRadius="full"
                            mr={1}
                            boxSize="1.5rem"
                            objectFit="cover"
                            onClick={() => onImageClick(profilePictureUrl ?? "/Profile.svg")}
                        />
                    </Box>

                    <Box color="white" flexGrow={1}>
                        <Flex justify="space-between" align="center" mb={2}>
                            <Text userSelect="none">{name ?? "Usuario"}</Text>
                        </Flex>

                        <Textarea
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
                            mb={2}
                            bg="#454545"
                            color="white"
                            borderRadius="0.5rem"
                            borderColor="white"
                            _placeholder={{ color: "gray.400" }}
                            minH="80px"
                            overflow="hidden"
                            resize="none"
                        />

                        <Button
                            bg="white"
                            color="black"
                            width="100%"
                            _hover={{ bg: "gray.200" }}
                            onClick={submitComment}
                            borderRadius="1rem"
                        >
                            {!isCreatingComment
                                ? "Comentar"
                                : (
                                    <Flex justify="center" align="center">
                                        <Text mr={3}>Creando comentario...</Text>
                                        <Spinner size="sm" color="black" />
                                    </Flex>
                                )
                            }
                        </Button>
                    </Box>
                </Flex>
            )}

            {(!comments || comments.length === 0) && !showInput && (
                <Text as="h4" color="white" textAlign="center" mb={3} fontSize="lg" fontWeight="bold">
                    No hay comentarios en la publicación
                </Text>
            )}

            {comments.map((c: any, index: number) => (
                <Box key={c.id_comentario || `comment-${index}`}>
                    <Flex my={3}>
                        <Box>
                            <Image
                                src={c.Usuario?.Url_foto_perfil ?? c.Usuario?.url_foto_perfil ?? "/Profile.svg"}
                                alt={c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}
                                cursor="pointer"
                                userSelect="none"
                                borderRadius="full"
                                mr={1}
                                boxSize="1rem"
                                objectFit="cover"
                                onClick={() =>
                                    onImageClick(
                                        c.Usuario?.Url_foto_perfil ??
                                        c.Usuario?.url_foto_perfil ??
                                        "/Profile.svg"
                                    )
                                }
                            />
                        </Box>

                        <Box color="white" flexGrow={1}>
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text userSelect="none">
                                    <Link
                                        color="white"
                                        onClick={() => navigate("/profile?user=" + c.Usuario?.Correo_electronico)}
                                        _hover={{ textDecoration: "underline" }}
                                    >
                                        {c.Usuario?.Nombre_usuario ?? c.Usuario?.nombre_usuario ?? "Usuario"}
                                    </Link>
                                </Text>
                                <Flex align="center" gap={3} position="relative" ref={showOptionsId === c.id_comentario ? optionsRef : null}>
                                    <Text>{formatFecha(c.fecha_comentario)}</Text>
                                    {c.Is_mine && (
                                        <>
                                            <Image
                                                src="/Show_Options.svg"
                                                alt="Opciones"
                                                cursor="pointer"
                                                height="1.2rem"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowOptionsId(showOptionsId === c.id_comentario ? null : c.id_comentario);
                                                }}
                                            />
                                            {showOptionsId === c.id_comentario && (
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
                                                    <Flex
                                                        align="center"
                                                        px={4}
                                                        py={2}
                                                        cursor="pointer"
                                                        _hover={{ bg: "#3d3d3d" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowOptionsId(null);
                                                            setEditingCommentId(c.id_comentario);
                                                            setEditingContent(c.contenido);
                                                        }}
                                                    >
                                                        <Image src="/Edit.svg" width="20px" mr={3} alt="Editar" />
                                                        <Text fontSize="sm" color="white" fontWeight="bold">Editar</Text>
                                                    </Flex>
                                                    <Flex
                                                        align="center"
                                                        px={4}
                                                        py={2}
                                                        cursor="pointer"
                                                        _hover={{ bg: "#3d3d3d" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowOptionsId(null);
                                                            openDeleteModal(c.id_comentario);
                                                        }}
                                                    >
                                                        <Image src="/Delete.svg" width="20px" mr={3} alt="Eliminar" />
                                                        <Text fontSize="sm" color="red.400" fontWeight="bold">Eliminar</Text>
                                                    </Flex>
                                                </Flex>
                                            )}
                                        </>
                                    )}
                                </Flex>
                            </Flex>

                            {editingCommentId === c.id_comentario ? (
                                <Box mb={3} mt={1}>
                                    <Textarea
                                        value={editingContent}
                                        onChange={e => setEditingContent(e.target.value)}
                                        bg="#2d2d2d"
                                        color="white"
                                        borderRadius="0.5rem"
                                        borderColor="transparent"
                                        _focus={{ borderColor: "gray.400" }}
                                        autoFocus
                                        minH="60px"
                                        resize="none"
                                        mb={2}
                                    />
                                    <Flex justify="flex-end" gap={2}>
                                        <Button size="sm" bg="transparent" color="gray.400" _hover={{ color: "white" }} onClick={() => setEditingCommentId(null)} disabled={isEditingComment}>
                                            Cancelar
                                        </Button>
                                        <Button size="sm" bg="white" color="black" _hover={{ opacity: 0.8 }} onClick={() => submitEditComment(c.id_comentario)} disabled={isEditingComment}>
                                            {isEditingComment ? <Spinner size="xs" color="black" /> : "Guardar"}
                                        </Button>
                                    </Flex>
                                </Box>
                            ) : (
                                <Text mb={3} whiteSpace="pre-wrap">{c.contenido}</Text>
                            )}
                        </Box>
                    </Flex>
                    <Box as="hr" borderColor="white" mb={3} m={0} />
                </Box>
            ))
            }
            <ConfirmModal
                isOpen={commentToDeleteId !== null}
                title="¿Estás seguro de que deseas eliminar este comentario?"
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
