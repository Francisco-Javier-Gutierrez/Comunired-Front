import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatFecha } from "../utils/GlobalVariables";
import { usePublicationActions } from "./hooks/PublicationsActions";
import ConfirmModal from "./modals/ConfirmModal";
import RequireAuthModal from "./modals/RequireAuthModal";
import LocationPicker from "./LocationPicker";
import EditPublicationModal from "./modals/EditPublicationModal";
import { Box, Flex, Image, Text, chakra } from "@chakra-ui/react";

export default function PublicationCard({ post: initialPost, onImageClick, onClickComent, isPreview = false }: any) {
    const [post, setPost] = useState(initialPost);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
                setShowOptions(false);
            }
        };
        if (showOptions) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showOptions]);

    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isLiked, likes, sharedCount, showCopied, showAuthModal, setShowAuthModal, authMessage, handleLike, handleShare, handleDelete } =
        usePublicationActions(post);

    return (
        <Box>
            {showCopied && (
                <Box
                    position="fixed"
                    bottom="90px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="white"
                    color="black"
                    px={5}
                    py={3}
                    borderRadius="xl"
                    fontWeight="bold"
                    fontSize="sm"
                    zIndex={9999}
                    boxShadow="0 4px 20px rgba(0,0,0,0.4)"
                >
                    ✅ URL copiada al portapapeles
                </Box>
            )}
            <Flex
                my={3}
                userSelect="none"
                cursor={isPreview ? "default" : "pointer"}
                onClick={() => !isPreview && navigate("/publication?post=" + post.Id_publicacion)}
                alignItems="flex-start"
            >
                <Box>
                    <Image
                        src={post.Usuario?.Url_foto_perfil ?? "/Profile.svg"}
                        cursor="pointer"
                        borderRadius="full"
                        boxSize="1.5rem"
                        mr={3}
                        onClick={e => { e.stopPropagation(); onImageClick(post.Usuario?.Url_foto_perfil ?? "/Profile.svg"); }}
                    />
                </Box>

                <Box color="white" flex="1">
                    <Flex justify="space-between" mb={3}>
                        <Text
                            as="a"
                            color="white"
                            fontWeight="bold"
                            cursor={isPreview ? "default" : "pointer"}
                            onClick={(e: any) => { e.stopPropagation(); !isPreview && navigate("/profile?user=" + post.Usuario?.Correo_electronico); }}
                        >
                            {post.Usuario?.nombre_usuario}
                        </Text>
                        <Flex align="center" position="relative" ref={optionsRef}>
                            <Text as="span" mr={post.Is_mine ? 2 : 3} fontSize="sm" color="gray.400">{formatFecha(post.Fecha_publicacion)}</Text>
                            {post.Is_mine && (
                                <>
                                    <Image
                                        src="/Show_Options.svg"
                                        cursor="pointer"
                                        height="1.2rem"
                                        alt="Opciones"
                                        onClick={e => { e.stopPropagation(); !isPreview && setShowOptions(!showOptions); }}
                                    />
                                    {showOptions && !isPreview && (
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
                                                onClick={e => { e.stopPropagation(); setShowOptions(false); setShowEditModal(true); }}
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
                                                onClick={e => { e.stopPropagation(); setShowOptions(false); setShowDeleteModal(true); }}
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

                    <Text mb={3}>{post.Contenido}</Text>

                    {post.Lat && post.Long && (
                        <Box mb={3} w={["100%", "75%"]} mx="auto" onClick={e => e.stopPropagation()}>
                            <LocationPicker
                                latitude={Number(post.Lat)}
                                longitude={Number(post.Long)}
                                readOnly={true}
                            />
                        </Box>
                    )}

                    {post.Url_imagen && (
                        <Image
                            src={post.Url_imagen}
                            borderRadius="md"
                            mb={3}
                            w={["100%", "50%"]}
                            display="block"
                            fetchPriority="high"
                            mx="auto"
                            cursor="pointer"
                            onClick={e => { e.stopPropagation(); onImageClick(post.Url_imagen); }}
                        />
                    )}

                    {post.Url_video && (
                        <chakra.video
                            src={post.Url_video}
                            borderRadius="md"
                            mb={3}
                            w={["100%", "75%"]}
                            display="block"
                            mx="auto"
                            controls
                            preload="auto"
                            onClick={(e: any) => e.stopPropagation()}
                        />
                    )}

                    <Flex justify="space-between" mt={2}>
                        <Flex onClick={e => { e.stopPropagation(); !isPreview && handleLike(); }} align="center">
                            <Image mr={1} cursor="pointer" src={isLiked ? "Like_active.svg" : "Like.svg"} width="20px" />
                            <Text>{likes}</Text>
                        </Flex>

                        <Flex onClick={e => { if (onClickComent) { e.stopPropagation(); !isPreview && onClickComent(); } }} align="center">
                            <Image mr={1} cursor="pointer" src="Comment.svg" width="20px" />
                            <Text>{post.comentarios?.total ?? 0}</Text>
                        </Flex>

                        <Flex onClick={e => { e.stopPropagation(); !isPreview && handleShare(); }} align="center">
                            <Image mr={1} cursor="pointer" src="Share.svg" width="20px" />
                            <Text>{sharedCount}</Text>
                        </Flex>
                    </Flex>
                </Box>
            </Flex>
            <Box as="hr" borderColor="gray.600" m={0} />
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
            <RequireAuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message={authMessage}
            />
            {showEditModal && (
                <EditPublicationModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    post={post}
                    onSuccess={(updatedPost) => {
                        setPost(updatedPost);
                    }}
                />
            )}
        </Box>
    );
}
