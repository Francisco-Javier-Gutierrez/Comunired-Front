import { api } from "../services/api";

const allowedFileTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
]);

export const sanitizeFileName = (fileName: string): string => {
    return fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase();
};

export const uploadFile = async (file: File, type: "publications" | "profile"): Promise<string> => {
    if (!allowedFileTypes.has(file.type)) {
        throw new Error("Tipo de archivo no permitido");
    }

    const { uploadUrl, fileUrl } = await api.media.getPresignedUrl(
        sanitizeFileName(file.name),
        file.type,
        type
    );

    const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    });

    if (!response.ok) {
        throw new Error(`No se pudo subir el archivo (${response.status})`);
    }

    return fileUrl;
};
