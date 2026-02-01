import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { goTo, BackendApi, getToken } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import { usePublicationData } from "../utils/PublicationStore";

function CreatePublication() {
    const { name, profilePictureUrl } = useUserData();
    const { text, image, setImage, resetPublication } = usePublicationData();
    const [textMessage, setTextMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isValidText, setIsValidText] = useState<boolean | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState("");
    const [isValidImage, setIsValidImage] = useState<boolean | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);

    useEffect(() => {
        if (text && textareaRef.current) {
            textareaRef.current.value = text;
            autoResize();
        }
        if (image) setPreviewImage(image);
    }, []);

    useEffect(() => {
        if (text === null && image === null) {
            if (textareaRef.current) textareaRef.current.value = "";
            setPreviewImage(null);
        }
    }, [text, image]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        const maxHeight = window.innerHeight * 0.5;
        const newHeight = el.scrollHeight;
        if (newHeight < maxHeight) {
            el.style.overflowY = "hidden";
            el.style.height = newHeight + "px";
        } else {
            el.style.overflowY = "auto";
            el.style.height = maxHeight + "px";
        }
    };

    const openImageSelector = () => fileInputRef.current?.click();

    function sanitizeFileName(name: string) {
        return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9.-]/g, "").replace(/-+/g, "-");
    }

    const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError("La imagen está demasiado pesada (máx 10MB)");
            setIsValidImage(false);
            return;
        }

        setIsValidImage(true);
        setImageError("");

        const blobUrl = URL.createObjectURL(file);
        setPreviewImage(blobUrl);

        setIsUploadingImage(true);
        try {
            const token = await getToken();
            const { data } = await axios.post(
                BackendApi.push_resouce_url,
                { fileName: sanitizeFileName(file.name), fileType: file.type },
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

            setPreviewImage(fileUrl);
            setImage(fileUrl);
        } catch (err) {
            console.error("Error subiendo imagen:", err);
            setImageError("Error subiendo imagen, intenta de nuevo");
            setIsValidImage(false);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingImage(false);
        }
    };

    const validateText = () => {
        const realText = textareaRef.current?.value || "";
        if (!realText.trim()) {
            setTextMessage("No ha colocado un texto para la publicación");
            setIsValidText(false);
            return false;
        }
        setTextMessage("");
        setIsValidText(true);
        return true;
    };

    const handleValidatePublicationPublicate = async () => {
        const textIsValid = validateText();
        if (!textIsValid || isValidImage === false) return;

        setIsSendingForm(true);
        try {
            const realText = textareaRef.current?.value || "";
            const token = await getToken();

            await axios.post(
                BackendApi.create_publication_url,
                { Contenido: realText, Url_imagen: image },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            resetPublication();
            setPreviewImage(null);
            goTo("/my-profile");
        } catch (err) {
            console.error("Error publicando:", err);
        } finally {
            setIsSendingForm(false);
        }
    };

    return (
        <div className={`${isSendingForm || isUploadingImage ? "disabled-form no-select" : ""}`}>
            <div className="w-75 mx-auto d-flex flex-column min-dvh-70">
                <img className="footer-image d-md-none cursor-pointer my-4" src="Back.svg" alt="Regresar" onClick={() => goTo("/choose")} />

                <h1 className="text-white text-center mb-4">Nueva publicación</h1>

                <div className="no-select my-3">
                    <img src={profilePictureUrl ?? "/Profile.svg"} alt="Foto de perfil" className="rounded-circle me-1 user-image" />
                    <span className="text-white">{name ?? "Usuario"} &gt; <span className="text-grey">Publicación</span></span>
                </div>

                <span className="text-error">{textMessage}</span>
                <textarea
                    ref={textareaRef}
                    className={`textarea-input mb-3 ${isValidText === false && "input-error"}`}
                    placeholder="Expresa tu idea u opinión aquí"
                    onInput={autoResize}
                    onChange={() => { setIsValidText(null); setTextMessage(""); }}
                    style={{ overflow: "hidden", resize: "none", minHeight: "80px" }}
                />

                <div>
                    <img src="/AddImage.svg" alt="Agregar imagen" className="create-publication-image cursor-pointer me-4" onClick={openImageSelector} />
                    {imageError && <span className="text-error text-center d-block mt-2">{imageError}</span>}
                    {isUploadingImage && <span className="text-white d-block mt-2">Subiendo imagen...</span>}
                </div>

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelected} style={{ display: "none" }} />

                {previewImage && (
                    <img src={previewImage} alt="Vista previa" className="mt-4 d-block w-75 mx-auto rounded preview-image" />
                )}

                <div className="publication-actions w-100 mt-5 d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                        <button className="white-button" onClick={() => goTo("/preview-publication")} disabled={isUploadingImage || isSendingForm}>Previsualizar</button>
                    </div>
                    <div className="w-50 text-end">
                        <button className="white-button" onClick={handleValidatePublicationPublicate} disabled={isUploadingImage || isSendingForm}>
                            {!isSendingForm ? "Publicar" : (<div className="d-flex justify-content-center"><span>Publicando...</span><div className="loader ms-3"></div></div>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePublication;
