import { Dialog, Button, Flex, Text, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

export default function RequireAuthModal({ isOpen, onClose, message }: Props) {
    const navigate = useNavigate();

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Dialog.Backdrop bg="rgba(0,0,0,0.8)" />
            <Dialog.Positioner>
                <Dialog.Content
                    bg="linear-gradient(145deg, #1a1a1a, #111)"
                    border="1px solid #333"
                    boxShadow="0 20px 60px rgba(0,0,0,0.6)"
                    borderRadius="20px"
                    p={6}
                    color="white"
                    maxW="360px"
                    textAlign="center"
                >
                    <Dialog.Body p={0}>
                        <Box fontSize="48px" mb={6}>🔒</Box>

                        <Text fontSize="18px" fontWeight="700" mb={3}>
                            Se requiere iniciar sesión
                        </Text>

                        <Text color="#aaa" fontSize="14px" lineHeight="1.5" mb={6}>
                            {message || "Para interactuar con esta publicación necesitas iniciar sesión en Comunired."}
                        </Text>

                        <Flex direction="column" gap={3}>
                            <Button
                                w="100%"
                                py={3}
                                bg="white"
                                color="black"
                                borderRadius="12px"
                                fontSize="15px"
                                fontWeight="700"
                                onClick={() => {
                                    onClose();
                                    navigate("/login");
                                }}
                                _hover={{ opacity: 0.9 }}
                            >
                                Iniciar sesión
                            </Button>

                            <Button
                                w="100%"
                                py={3}
                                bg="transparent"
                                color="#666"
                                borderRadius="12px"
                                fontSize="14px"
                                onClick={onClose}
                                _hover={{ color: '#999' }}
                            >
                                Seguir navegando
                            </Button>
                        </Flex>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
