import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatFecha } from "../../utils/GlobalVariables";
import { useUserData } from "../../utils/UserStore";
import { Flex, Image, Text } from "@chakra-ui/react";
import type { Publication } from "../../types";

interface PublicationHeaderProps {
    post: Publication;
    isPreview: boolean;
    onImageClick: (src: string) => void;
    onShowDeleteModal: () => void;
    onShowEditModal: () => void;
}

export default function PublicationHeader({ post, isPreview, onImageClick, onShowDeleteModal, onShowEditModal }: PublicationHeaderProps) {
    const navigate = useNavigate();
    const { email: currentEmail, name: currentName, role: globalRole, profilePictureUrl } = useUserData();
    const isBannedUser = globalRole === "banned";
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);
    const authorEmail = post.user?.email || post.userEmail;
    const isCurrentUserPost = !!authorEmail && !!currentEmail && authorEmail.toLowerCase() === currentEmail.toLowerCase();
    const backendAuthorName = post.user?.username && post.user.username !== "Usuario" ? post.user.username : null;
    const authorName = backendAuthorName || (isCurrentUserPost && currentName ? currentName : "Usuario");
    const authorImage = post.user?.profilePicUrl || (isCurrentUserPost ? profilePictureUrl : null) || "/Profile.svg";
    const canOpenUserProfile = !isPreview && authorEmail;
    const canToggleOptions = !isPreview;

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

    return (
        <Flex justify="space-between" mb={3}>
            <Flex align="center" gap={3}>
                <Image
                    src={authorImage}
                    cursor="pointer"
                    borderRadius="full"
                    boxSize="1.5rem"
                    onClick={e => { e.stopPropagation(); onImageClick(authorImage); }}
                />
                <Text
                    as="a"
                    color="var(--text-color)"
                    fontWeight="bold"
                    cursor={isPreview ? "default" : "pointer"}
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (canOpenUserProfile) navigate("/profile?user=" + authorEmail);
                    }}
                >
                    {authorName}
                </Text>
            </Flex>
            <Flex align="center" position="relative" ref={optionsRef}>
                <Text as="span" mr={(post.canDelete || post.canUpdate) ? 2 : 3} fontSize="sm" color="gray.400">{formatFecha(post.createdAt)}</Text>
                {(post.canDelete || post.canUpdate) && !isBannedUser && (
                    <>
                        <Image
                            src="/Show_Options.svg"
                            filter="none"
                            cursor="pointer"
                            height="1.2rem"
                            alt="Opciones"
                            onClick={e => {
                                e.stopPropagation();
                                if (canToggleOptions) setShowOptions(!showOptions);
                            }}
                        />
                        {showOptions && !isPreview && (
                            <Flex
                                direction="column"
                                position="absolute"
                                right="0"
                                top="100%"
                                bg="var(--card-bg)"
                                border="1px solid var(--input-border)"
                                borderRadius="md"
                                boxShadow="0 4px 12px rgba(0,0,0,0.5)"
                                zIndex={10}
                                py={2}
                                w="150px"
                            >
                                {post.canUpdate && (
                                    <Flex
                                        align="center"
                                        px={4}
                                        py={2}
                                        cursor="pointer"
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                        onClick={e => { e.stopPropagation(); setShowOptions(false); onShowEditModal(); }}
                                    >
                                        <Image src="/Edit.svg" width="20px" mr={3} alt="Editar" />
                                        <Text fontSize="sm" color="var(--text-color)" fontWeight="bold">Editar</Text>
                                    </Flex>
                                )}
                                {post.canDelete && (
                                    <Flex
                                        align="center"
                                        px={4}
                                        py={2}
                                        cursor="pointer"
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                        onClick={e => { e.stopPropagation(); setShowOptions(false); onShowDeleteModal(); }}
                                    >
                                        <Image src="/Delete.svg" width="20px" mr={3} alt="Eliminar" />
                                        <Text fontSize="sm" color="red.500" fontWeight="bold">Eliminar</Text>
                                    </Flex>
                                )}
                            </Flex>
                        )}
                    </>
                )}
            </Flex>
        </Flex>
    );
}
