import { useEffect, useState } from "react";
import { Box, Button, Dialog, Flex, Input, Text, Textarea } from "@chakra-ui/react";
import type { ReportCategory, ReportPayload } from "../../types";

const REPORT_OPTIONS: Array<{ value: ReportCategory; label: string }> = [
    { value: "spam", label: "Spam o repetido" },
    { value: "harassment", label: "Acoso" },
    { value: "hate_speech", label: "Discurso de odio" },
    { value: "violence", label: "Violencia o amenaza" },
    { value: "sexual_content", label: "Contenido sexual" },
    { value: "scam", label: "Estafa o suplantacion" },
    { value: "privacy", label: "Datos personales" },
    { value: "misinformation", label: "Informacion falsa" },
    { value: "illegal_activity", label: "Actividad ilegal" },
    { value: "other", label: "Otro" },
];

const isValidEvidenceUrl = (value: string) => {
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

interface ReportModalProps {
    isOpen: boolean;
    targetLabel?: string;
    onClose: () => void;
    onSubmit: (payload: ReportPayload) => Promise<void>;
}

export default function ReportModal({ isOpen, targetLabel, onClose, onSubmit }: ReportModalProps) {
    const [category, setCategory] = useState<ReportCategory | null>(null);
    const [details, setDetails] = useState("");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCategory(null);
            setDetails("");
            setEvidenceUrl("");
            setError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const submitReport = async () => {
        if (!category) {
            setError("Selecciona una razon para el reporte.");
            return;
        }

        if (category === "other" && details.trim().length < 20) {
            setError("Describe que paso con al menos 20 caracteres.");
            return;
        }

        const normalizedEvidenceUrl = evidenceUrl.trim();
        if (normalizedEvidenceUrl && !isValidEvidenceUrl(normalizedEvidenceUrl)) {
            setError("La evidencia debe ser una URL HTTPS valida.");
            return;
        }

        setError("");
        setIsSubmitting(true);
        try {
            await onSubmit({
                category,
                details: details.trim(),
                evidenceUrl: normalizedEvidenceUrl || undefined,
            });
            onClose();
        } catch {
            setError("No pudimos enviar el reporte. Intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center" closeOnInteractOutside={!isSubmitting}>
            <Dialog.Backdrop bg="rgba(0,0,0,0.82)" />
            <Dialog.Positioner>
                <Dialog.Content
                    bg="var(--modal-bg)"
                    border="1px solid var(--border-color)"
                    boxShadow="0 20px 60px rgba(0,0,0,0.6)"
                    borderRadius="md"
                    p={5}
                    color="var(--text-color)"
                    w="92%"
                    maxW="560px"
                    maxH="90dvh"
                    overflowY="auto"
                >
                    <Dialog.Header p={0} mb={4}>
                        <Dialog.Title fontSize="xl" fontWeight="700">Reportar contenido</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body p={0}>
                        {targetLabel && (
                            <Box
                                border="1px solid var(--border-color)"
                                borderRadius="md"
                                px={3}
                                py={2}
                                mb={4}
                                color="var(--muted-color)"
                                fontSize="sm"
                                overflowWrap="anywhere"
                            >
                                {targetLabel}
                            </Box>
                        )}

                        <Text fontWeight="700" mb={2}>Motivo</Text>
                        <Flex gap={2} wrap="wrap" mb={4}>
                            {REPORT_OPTIONS.map((option) => {
                                const isSelected = category === option.value;
                                return (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        size="sm"
                                        borderRadius="full"
                                        bg={isSelected ? "var(--button-bg)" : "transparent"}
                                        color={isSelected ? "var(--button-text)" : "var(--text-color)"}
                                        border="1px solid var(--border-color)"
                                        onClick={() => {
                                            setCategory(option.value);
                                            setError("");
                                        }}
                                        _hover={{ bg: isSelected ? "var(--button-bg)" : "var(--surface-hover)" }}
                                    >
                                        {option.label}
                                    </Button>
                                );
                            })}
                        </Flex>

                        <Text fontWeight="700" mb={2}>Detalles</Text>
                        <Textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder={category === "other" ? "Describe con claridad que paso." : "Agrega contexto que ayude a moderacion."}
                            minH="110px"
                            resize="vertical"
                            bg="var(--input-bg)"
                            color="var(--input-text)"
                            borderColor="var(--input-border)"
                            borderRadius="md"
                            _placeholder={{ color: "gray.400" }}
                            mb={3}
                        />

                        <Text fontWeight="700" mb={2}>Evidencia adicional</Text>
                        <Input
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="URL opcional"
                            bg="var(--input-bg)"
                            color="var(--input-text)"
                            borderColor="var(--input-border)"
                            borderRadius="md"
                            mb={3}
                        />

                        {error && <Text color="red.400" fontSize="sm" mb={3}>{error}</Text>}

                        <Flex justify="flex-end" gap={3} mt={5}>
                            <Button
                                type="button"
                                variant="ghost"
                                color="var(--text-color)"
                                onClick={onClose}
                                disabled={isSubmitting}
                                _hover={{ bg: "var(--surface-hover)" }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                bg="red.500"
                                color="white"
                                onClick={submitReport}
                                loading={isSubmitting}
                                _hover={{ bg: "red.600" }}
                            >
                                Enviar reporte
                            </Button>
                        </Flex>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
