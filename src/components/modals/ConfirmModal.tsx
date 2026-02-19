import React from "react";
import {
    Dialog,
    Image,
    Text,
    Flex,
    Spinner
} from "@chakra-ui/react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    isLoading?: boolean;
    confirmImage?: string;
    cancelImage?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    isLoading = false,
    confirmImage = "Confirm.svg",
    cancelImage = "Cancel.svg",
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onCancel()} size="sm" placement="center">
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content borderRadius="xl" p={4} textAlign="center">
                    <Dialog.Header color="black" fontWeight="bold" textAlign="center" fontSize="2xl" p={0} mb={2}>
                        <Dialog.Title>{title}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body p={0}>
                        <Text fontSize="md" color="gray.600" mb={4}>{description}</Text>
                        <Flex justify="space-around" align="center" mt={4} w="75%" mx="auto">
                            {isLoading ? (
                                <Flex justify="center" align="center" boxSize="50px">
                                    <Spinner size="xl" color="black" />
                                </Flex>
                            ) : (
                                <Image
                                    src={confirmImage}
                                    alt="Confirmar"
                                    cursor="pointer"
                                    w="4rem"
                                    onPointerDown={(e) => { e.preventDefault(); onConfirm(); }}
                                    _hover={{ transform: "scale(1.1)" }}
                                    transition="transform 0.2s"
                                />
                            )}
                            <Image
                                src={cancelImage}
                                alt="Cancelar"
                                cursor="pointer"
                                w="3rem"
                                onPointerDown={(e) => { e.preventDefault(); onCancel(); }}
                                _hover={{ transform: "scale(1.1)" }}
                                transition="transform 0.2s"
                            />
                        </Flex>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default ConfirmModal;
