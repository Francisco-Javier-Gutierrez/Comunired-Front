import type { MouseEvent } from "react";
import { Flex, Image, Text, Button } from "@chakra-ui/react";
import { FiBookmark, FiFlag } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { useUserData } from "../../utils/UserStore";

interface PublicationActionsProps {
    isLiked: boolean;
    isSaved?: boolean;
    likes: number;
    commentCount: number;
    sharedCount: number;
    isPreview: boolean;
    onLike: () => void;
    onComment?: () => void;
    onShare: () => void;
    onSave?: () => void;
    onReport?: () => void;
}

export default function PublicationActions({
    isLiked,
    isSaved = false,
    likes,
    commentCount,
    sharedCount,
    isPreview,
    onLike,
    onComment,
    onShare,
    onSave,
    onReport,
}: PublicationActionsProps) {
    const { role: globalRole } = useUserData();
    const isBannedUser = globalRole === "banned";
    const canInteract = !isPreview && !isBannedUser;
    const saveColor = isSaved ? "#3b82f6" : "var(--text-color)";
    const SaveIcon = isSaved ? FaBookmark : FiBookmark;

    const handleLike = (e: MouseEvent) => {
        e.stopPropagation();
        if (canInteract) onLike();
    };

    const handleComment = (e: MouseEvent) => {
        e.stopPropagation();
        if (canInteract) onComment?.();
    };

    const handleShare = (e: MouseEvent) => {
        e.stopPropagation();
        if (canInteract) onShare();
    };

    const handleSave = (e: MouseEvent) => {
        e.stopPropagation();
        if (canInteract) onSave?.();
    };

    const handleReport = (e: MouseEvent) => {
        e.stopPropagation();
        if (canInteract) onReport?.();
    };

    return (
        <Flex direction="column" gap={2} mt={2}>
            <Flex justify="space-between">
                <Flex onClick={handleLike} align="center">
                    <Image mr={1} cursor="pointer" src={isLiked ? "Like_active.svg" : "Like.svg"} width="20px" opacity={isBannedUser ? 0.5 : 1} />
                    <Text>{likes}</Text>
                </Flex>

                <Flex onClick={handleComment} align="center">
                    <Image mr={1} cursor={isBannedUser ? "default" : "pointer"} src="Comment.svg" width="20px" opacity={isBannedUser ? 0.5 : 1} filter="none" />
                    <Text>{commentCount}</Text>
                </Flex>

                <Flex onClick={handleShare} align="center">
                    <Image mr={1} cursor="pointer" src="Share.svg" width="20px" opacity={isBannedUser ? 0.5 : 1} filter="none" />
                    <Text>{sharedCount}</Text>
                </Flex>
            </Flex>

            {!isPreview && (
                <Flex justify="flex-end" gap={2} wrap="wrap">
                    <Button
                        size="xs"
                        variant="ghost"
                        color={saveColor}
                        gap={1}
                        onClick={handleSave}
                        disabled={isBannedUser}
                        aria-pressed={isSaved}
                        aria-label={isSaved ? "Quitar de guardados" : "Guardar publicación"}
                        _hover={{ bg: isSaved ? "rgba(59, 130, 246, 0.14)" : "var(--surface-hover)" }}
                    >
                        <SaveIcon aria-hidden="true" />
                        {isSaved ? "Guardado" : "Guardar"}
                    </Button>
                    <Button size="xs" variant="ghost" color="red.400" gap={1} onClick={handleReport} disabled={isBannedUser}>
                        <FiFlag />
                        Reportar
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}
