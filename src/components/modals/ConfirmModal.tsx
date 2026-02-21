import React from "react";
import {
    Dialog,
    Button,
    Text,
    Flex
} from "@chakra-ui/react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onCancel()} size="sm" placement="center">
            <Dialog.Backdrop bg="rgba(0,0,0,0.8)" />
            <Dialog.Positioner>
                <Dialog.Content
                    bg="linear-gradient(145deg, #1a1a1a, #111)"
                    border="1px solid #333"
                    boxShadow="0 20px 60px rgba(0,0,0,0.6)"
                    borderRadius="20px"
                    p={6}
                    color="white"
                    textAlign="center"
                >
                    <Dialog.Header color="white" fontWeight="700" textAlign="center" fontSize="2xl" p={0} mb={3}>
                        <Dialog.Title>{title}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body p={0}>
                        <Text fontSize="15px" lineHeight="1.5" color="#aaa" mb={6}>{description}</Text>
                        <Flex direction="column" gap={3}>
                            <Button
                                w="100%"
                                py={3}
                                bg="white"
                                color="black"
                                borderRadius="12px"
                                fontSize="15px"
                                fontWeight="700"
                                onClick={onConfirm}
                                loading={isLoading}
                                _hover={{ opacity: 0.9 }}
                            >
                                Confirmar
                            </Button>

                            <Button
                                w="100%"
                                py={3}
                                bg="transparent"
                                color="#666"
                                borderRadius="12px"
                                fontSize="14px"
                                onClick={onCancel}
                                disabled={isLoading}
                                _hover={{ color: '#999' }}
                            >
                                Cancelar
                            </Button>
                        </Flex>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default ConfirmModal;
