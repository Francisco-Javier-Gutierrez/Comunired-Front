import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicationActions } from "./hooks/PublicationsActions";
import { useUserData } from "../utils/UserStore";
import { Box, Flex } from "@chakra-ui/react";
import type { Publication, PublicationCardProps } from "../types";

import PublicationHeader from "./publication/PublicationHeader";
import PublicationContent from "./publication/PublicationContent";
import PublicationActions from "./publication/PublicationActions";
import ConfirmModal from "./modals/ConfirmModal";
import RequireAuthModal from "./modals/RequireAuthModal";
import EditPublicationModal from "./modals/EditPublicationModal";
import ReportModal from "./modals/ReportModal";

export default function PublicationCard({ post: initialPost, onImageClick, onClickComent, isPreview = false }: PublicationCardProps) {
    const [post, setPost] = useState<Publication>(initialPost);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { role: globalRole } = useUserData();
    const isBannedUser = globalRole === "banned";
    const navigate = useNavigate();
    const canOpenPublication = !isBannedUser && !isPreview;

    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    const { isLiked, isSaved, likes, sharedCount, showCopied, feedbackMessage, showAuthModal, setShowAuthModal, authMessage, handleLike, handleSave, handleReport, handleShare, handleDelete } =
        usePublicationActions(post);

    const openPublication = () => {
        if (canOpenPublication) navigate("/publication?post=" + encodeURIComponent(post.id));
    };

    const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!canOpenPublication) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPublication();
        }
    };

    return (
        <Box>
            {showCopied && (
                <Box
                    position="fixed"
                    bottom="90px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="var(--button-bg)"
                    color="var(--button-text)"
                    px={5}
                    py={3}
                    borderRadius="xl"
                    fontWeight="bold"
                    fontSize="sm"
                    zIndex={9999}
                    boxShadow="0 4px 20px rgba(0,0,0,0.4)"
                >
                    {feedbackMessage}
                </Box>
            )}

            <Flex
                my={2}
                px={{ base: 2, md: 3 }}
                py={3}
                userSelect="none"
                onClick={openPublication}
                onKeyDown={handleCardKeyDown}
                alignItems="flex-start"
                borderRadius="md"
                cursor={canOpenPublication ? "pointer" : "default"}
                role={canOpenPublication ? "button" : "article"}
                tabIndex={canOpenPublication ? 0 : undefined}
                aria-label={canOpenPublication ? `Abrir publicacion de ${post.user?.username ?? "Usuario"}` : undefined}
                transition="background-color 0.2s ease, box-shadow 0.2s ease"
                _hover={canOpenPublication ? { bg: "var(--surface-hover)" } : undefined}
                _focusVisible={canOpenPublication ? { boxShadow: "0 0 0 2px var(--button-bg)", outline: "none" } : undefined}
            >
                <Box color="var(--text-color)" flex="1" minW={0}>
                    <PublicationHeader
                        post={post}
                        isPreview={isPreview}
                        onImageClick={onImageClick}
                        onShowDeleteModal={() => setShowDeleteModal(true)}
                        onShowEditModal={() => setShowEditModal(true)}
                    />

                    <PublicationContent
                        post={post}
                        onImageClick={onImageClick}
                    />

                    <PublicationActions
                        isLiked={isLiked}
                        isSaved={isSaved}
                        likes={likes}
                        commentCount={post.comments?.total ?? 0}
                        sharedCount={sharedCount}
                        isPreview={isPreview}
                        onLike={handleLike}
                        onComment={onClickComent}
                        onShare={handleShare}
                        onSave={handleSave}
                        onReport={() => setShowReportModal(true)}
                    />
                </Box>
            </Flex>

            <Box as="hr" borderColor="gray.600" m={0} />

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Estas seguro de que deseas eliminar esta publicacion?"
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

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetLabel={post.content}
                onSubmit={handleReport}
            />

            {showEditModal && (
                <EditPublicationModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    post={post}
                    onSuccess={(updatedPost: Publication) => {
                        setPost(updatedPost);
                    }}
                />
            )}
        </Box>
    );
}