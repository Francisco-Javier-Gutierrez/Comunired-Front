import axios from "axios";
import { apiRoutes, getToken } from "./GlobalVariables";

export const sanitizeFileName = (fileName: string): string => {
    return fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase();
};

export const uploadFile = async (file: File, type: "publications" | "profile"): Promise<string | null> => {
    try {
        const token = await getToken();
        if (!token) throw new Error("No se pudo obtener el token de autenticación");

        const { data } = await axios.post(
            apiRoutes.push_resouce_url,
            {
                fileName: sanitizeFileName(file.name),
                fileType: file.type,
                type: type
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const { uploadUrl, fileUrl } = data;

        await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        return fileUrl;
    } catch (err) {
        throw err;
    }
};
