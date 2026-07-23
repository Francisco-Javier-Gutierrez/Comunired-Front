import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Text, Textarea } from "@chakra-ui/react";
import { FiRefreshCw, FiShield, FiExternalLink } from "react-icons/fi";
import { api } from "../services/api";
import { formatFecha } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import type { ReportModerationAction, ReportStatus, SocialReport } from "../types";

const STATUSES: Array<{ value: ReportStatus; label: string }> = [
    { value: "open", label: "Abiertos" },
    { value: "reviewing", label: "En revision" },
    { value: "resolved", label: "Resueltos" },
    { value: "dismissed", label: "Descartados" },
];

const ACTION_LABELS: Record<ReportModerationAction, string> = {
    none: "Marcar en revision",
    dismiss: "Descartar reporte",
    delete_publication: "Eliminar publicacion",
    ban_user: "Banear cuenta",
    delete_user: "Eliminar cuenta",
};

const statusForAction = (action: ReportModerationAction): ReportStatus => {
    if (action === "dismiss") return "dismissed";
    if (action === "none") return "reviewing";
    return "resolved";
};

const targetTypeLabel = (type: SocialReport["targetType"]) => ({
    publication: "Publicacion",
    comment: "Comentario",
    user: "Usuario",
}[type]);

const isSafeEvidenceUrl = (value?: string | null) => {
    if (!value) return false;

    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

const availableActions = (report: SocialReport): ReportModerationAction[] => {
    const actions: ReportModerationAction[] = ["none", "dismiss"];
    if (report.targetType === "publication") actions.push("delete_publication");
    if (report.targetOwnerEmail || report.targetType === "user") actions.push("ban_user", "delete_user");
    return actions;
};

export default function AdminReports() {
    const { role } = useUserData();
    const isPrivileged = role === "admin" || role === "moderator";
    const [status, setStatus] = useState<ReportStatus>("open");
    const [reports, setReports] = useState<SocialReport[]>([]);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [actionById, setActionById] = useState<Record<string, ReportModerationAction>>({});
    const [noteById, setNoteById] = useState<Record<string, string>>({});
    const [busyReportId, setBusyReportId] = useState<string | null>(null);

    const loadReports = useCallback(async (replace = true, paginationToken: string | null = null) => {
        if (!isPrivileged) return;
        setIsLoading(true);
        setFeedback("");
        try {
            const res = await api.admin.listReports(status, 20, replace ? null : paginationToken);
            setReports(prev => replace ? res.items : [...prev, ...res.items]);
            setNextToken(res.nextToken ?? null);
        } catch {
            setFeedback("No pudimos cargar los reportes.");
        } finally {
            setIsLoading(false);
        }
    }, [isPrivileged, status]);

    useEffect(() => {
        loadReports(true);
    }, [loadReports]);

    const actionOptionsByReport = useMemo(() => {
        return reports.reduce<Record<string, ReportModerationAction[]>>((acc, report) => {
            acc[report.id] = availableActions(report);
            return acc;
        }, {});
    }, [reports]);

    const resolveReport = async (report: SocialReport) => {
        const action = actionById[report.id] || "none";
        setBusyReportId(report.id);
        setFeedback("");
        try {
            await api.admin.updateReport({
                id: report.id,
                action,
                status: statusForAction(action),
                moderatorNote: noteById[report.id]?.trim() || undefined,
            });
            setReports(prev => prev.filter(item => item.id !== report.id));
            setFeedback("Reporte actualizado.");
        } catch {
            setFeedback("No pudimos aplicar la resolucion.");
        } finally {
            setBusyReportId(null);
        }
    };

    if (!isPrivileged) {
        return (
            <Flex minH="70dvh" align="center" justify="center" px={4}>
                <Box textAlign="center" color="var(--text-color)">
                    <Heading size="2xl" mb={3}>Acceso restringido</Heading>
                    <Text color="var(--muted-color)">Solo administradores y moderadores pueden revisar reportes.</Text>
                </Box>
            </Flex>
        );
    }

    return (
        <Box w={["92%", "84%"]} maxW="980px" mx="auto" py={5} color="var(--text-color)">
            <Flex justify="space-between" align="center" gap={3} mb={4} wrap="wrap">
                <Box>
                    <Heading as="h1" size={["2xl", "3xl"]}>Reportes</Heading>
                    <Text color="var(--muted-color)" fontSize="sm">Cola de moderacion y resoluciones</Text>
                </Box>
                <Button size="sm" variant="ghost" color="var(--text-color)" onClick={() => loadReports(true)} disabled={isLoading} _hover={{ bg: "var(--surface-hover)" }}>
                    <FiRefreshCw />
                    Actualizar
                </Button>
            </Flex>

            <Flex gap={2} wrap="wrap" mb={4}>
                {STATUSES.map(option => (
                    <Button
                        key={option.value}
                        size="sm"
                        borderRadius="full"
                        bg={status === option.value ? "var(--button-bg)" : "transparent"}
                        color={status === option.value ? "var(--button-text)" : "var(--text-color)"}
                        border="1px solid var(--border-color)"
                        onClick={() => setStatus(option.value)}
                        _hover={{ bg: status === option.value ? "var(--button-bg)" : "var(--surface-hover)" }}
                    >
                        {option.label}
                    </Button>
                ))}
            </Flex>

            {feedback && (
                <Box mb={4} px={4} py={3} border="1px solid var(--border-color)" borderRadius="md" bg="var(--card-bg)">
                    {feedback}
                </Box>
            )}

            {isLoading && reports.length === 0 && <Text color="var(--muted-color)">Cargando reportes...</Text>}
            {!isLoading && reports.length === 0 && <Text color="var(--muted-color)">No hay reportes en esta bandeja.</Text>}

            <Flex direction="column" gap={4}>
                {reports.map(report => {
                    const actions = actionOptionsByReport[report.id] || ["none"];
                    const selectedAction = actionById[report.id] || actions[0];
                    const snapshot = report.targetSnapshot;
                    const evidenceUrl = isSafeEvidenceUrl(report.evidenceUrl) ? report.evidenceUrl : null;

                    return (
                        <Box key={report.id} border="1px solid var(--border-color)" borderRadius="md" bg="var(--card-bg)" p={4}>
                            <Flex justify="space-between" gap={3} align="start" wrap="wrap" mb={3}>
                                <Box>
                                    <Flex align="center" gap={2} mb={1}>
                                        <FiShield />
                                        <Text fontWeight="700">{report.categoryLabel || report.reason}</Text>
                                    </Flex>
                                    <Text color="var(--muted-color)" fontSize="sm">
                                        {targetTypeLabel(report.targetType)} #{report.targetId} - {formatFecha(report.createdAt)}
                                    </Text>
                                </Box>
                                <Text color="var(--muted-color)" fontSize="sm">Reportado por {report.reporterEmail}</Text>
                            </Flex>

                            {report.details && <Text mb={3} whiteSpace="pre-wrap" overflowWrap="anywhere">{report.details}</Text>}

                            {snapshot && (
                                <Box border="1px solid var(--border-color)" borderRadius="md" p={3} mb={3}>
                                    <Text color="var(--muted-color)" fontSize="sm" mb={1}>Objetivo reportado</Text>
                                    <Text fontSize="sm" overflowWrap="anywhere">{snapshot.authorEmail || snapshot.email || report.targetOwnerEmail || "Sin autor"}</Text>
                                    {snapshot.username && <Text fontSize="sm">{snapshot.username}</Text>}
                                    {snapshot.content && <Text mt={2} whiteSpace="pre-wrap" overflowWrap="anywhere">{snapshot.content}</Text>}
                                </Box>
                            )}

                            {evidenceUrl && (
                                <a
                                    href={evidenceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        color: "var(--text-color)",
                                        fontSize: "0.75rem",
                                        marginBottom: "0.75rem",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        textDecoration: "none",
                                    }}
                                >
                                    <FiExternalLink />
                                    Ver evidencia
                                </a>
                            )}

                            <Flex gap={3} wrap="wrap" align="end">
                                <Box flex="1" minW="210px">
                                    <Text fontWeight="700" fontSize="sm" mb={1}>Resolucion</Text>
                                    <select
                                        value={selectedAction}
                                        onChange={(e) => setActionById(prev => ({ ...prev, [report.id]: e.target.value as ReportModerationAction }))}
                                        style={{
                                            width: "100%",
                                            background: "var(--input-bg)",
                                            color: "var(--input-text)",
                                            border: "1px solid var(--input-border)",
                                            borderRadius: "0.375rem",
                                            padding: "0.5rem 0.75rem",
                                        }}
                                    >
                                        {actions.map(action => <option key={action} value={action}>{ACTION_LABELS[action]}</option>)}
                                    </select>
                                </Box>
                                <Box flex="2" minW="260px">
                                    <Text fontWeight="700" fontSize="sm" mb={1}>Nota interna</Text>
                                    <Textarea
                                        value={noteById[report.id] || ""}
                                        onChange={(e) => setNoteById(prev => ({ ...prev, [report.id]: e.target.value }))}
                                        bg="var(--input-bg)"
                                        color="var(--input-text)"
                                        borderColor="var(--input-border)"
                                        borderRadius="md"
                                        minH="42px"
                                        placeholder="Criterio usado para resolver"
                                    />
                                </Box>
                                <Button
                                    bg="var(--button-bg)"
                                    color="var(--button-text)"
                                    onClick={() => resolveReport(report)}
                                    loading={busyReportId === report.id}
                                    _hover={{ bg: "var(--button-hover-bg)" }}
                                >
                                    Aplicar
                                </Button>
                            </Flex>
                        </Box>
                    );
                })}
            </Flex>

            {nextToken && (
                <Flex justify="center" mt={5}>
                    <Button variant="ghost" color="var(--text-color)" onClick={() => loadReports(false, nextToken)} loading={isLoading} _hover={{ bg: "var(--surface-hover)" }}>
                        Cargar mas
                    </Button>
                </Flex>
            )}
        </Box>
    );
}
