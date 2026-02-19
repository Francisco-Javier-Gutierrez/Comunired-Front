import { useRef, useState } from "react";
import { formatFecha } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import { useCommentActions } from "./hooks/CommentActions";
import ConfirmModal from "./modals/ConfirmModal";
import { Box, Flex, Text, Textarea, Button, Spinner, Image, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function PublicationComments({ publication, showInput, setShowInput, onImageClick, onCommentAdded, onCommentDeleted }: any) {
    const { comments, isCreatingComment, handleAddComment, handleDeleteComment } = useCommentActions(publication.comentarios, publication.Id_publicacion, onCommentAdded, onCommentDeleted);
    const { name, profilePictureUrl } = useUserData();
    const [newComment, setNewComment] = useState("");
    const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const commentToDeleteIdRef = useRef<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

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
                                <Flex align="center" gap={2}>
                                    <Text>{formatFecha(c.fecha_comentario)}</Text>
                                    {c.Is_mine && (
                                        <Image
                                            src="/Delete.svg"
                                            alt="Eliminar comentario"
                                            cursor="pointer"
                                            onClick={() => openDeleteModal(c.id_comentario)}
                                            boxSize="20px"
                                        />
                                    )}
                                </Flex>
                            </Flex>

                            <Text mb={3}>{c.contenido}</Text>
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
        </Box >
    );
}
