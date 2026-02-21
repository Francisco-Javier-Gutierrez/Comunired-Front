import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatFecha } from "../utils/GlobalVariables";
import { usePublicationActions } from "./hooks/PublicationsActions";
import ConfirmModal from "./modals/ConfirmModal";
import RequireAuthModal from "./modals/RequireAuthModal";
import LocationPicker from "./LocationPicker";
import { Box, Flex, Image, Text, chakra } from "@chakra-ui/react";

export default function PublicationCard({ post, onImageClick, onClickComent, isPreview = false }: any) {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
                        <Flex align="center">
                            <Text as="span" mr={3} fontSize="sm" color="gray.400">{formatFecha(post.Fecha_publicacion)}</Text>
                            {post.Is_mine && (
                                <Image
                                    src="Delete.svg"
                                    cursor="pointer"
                                    width="20px"
                                    alt="Eliminar"
                                    onClick={e => { e.stopPropagation(); !isPreview && setShowDeleteModal(true); }}
                                />
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
        </Box>
    );
}
