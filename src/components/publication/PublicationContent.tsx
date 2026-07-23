import { Box, Image, Text, chakra } from "@chakra-ui/react";
import LocationPicker from "../LocationPicker";
import type { Publication } from "../../types";

interface PublicationContentProps {
    post: Publication;
    onImageClick: (src: string) => void;
}

export default function PublicationContent({ post, onImageClick }: PublicationContentProps) {
    const authorName = post.user?.username ?? "Usuario";
    const hasLocation = post.lat !== null && post.lat !== undefined && post.long !== null && post.long !== undefined;

    return (
        <>
            <Text mb={3} whiteSpace="pre-wrap" overflowWrap="anywhere" lineHeight="1.6">
                {post.content}
            </Text>

            {hasLocation && (
                <Box mb={3} w={["100%", "75%"]} mx="auto" onClick={e => e.stopPropagation()}>
                    <LocationPicker
                        latitude={Number(post.lat)}
                        longitude={Number(post.long)}
                        readOnly={true}
                    />
                </Box>
            )}

            {post.imageUrl && (
                <Image
                    src={post.imageUrl}
                    alt={`Imagen de la publicación de ${authorName}`}
                    borderRadius="md"
                    mb={3}
                    w={["100%", "50%"]}
                    maxH="70dvh"
                    display="block"
                    loading="lazy"
                    objectFit="contain"
                    mx="auto"
                    cursor="pointer"
                    onClick={e => { e.stopPropagation(); onImageClick(post.imageUrl!); }}
                />
            )}

            {post.videoUrl && (
                <chakra.video
                    src={post.videoUrl}
                    aria-label={`Video de la publicación de ${authorName}`}
                    borderRadius="md"
                    mb={3}
                    w={["100%", "75%"]}
                    display="block"
                    mx="auto"
                    controls
                    preload="metadata"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
            )}
        </>
    );
}
