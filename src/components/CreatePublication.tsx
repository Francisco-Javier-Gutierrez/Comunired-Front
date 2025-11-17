import { useRef, useState, useEffect } from "react";
import { goTo } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import { usePublicationData } from "../utils/PublicationStore";
import { useReportData } from "../utils/ReportStore";

function CreatePublication() {
    const { name, profilePictureUrl } = useUserData();
    const { text, image, setText, setImage } = usePublicationData();
    const { resetReport } = useReportData();
    const [textMessage, setTextMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isValidText, setIsValidText] = useState<boolean | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState("");
    const [isValidImage, setIsValidImage] = useState<boolean | null>(null);

    useEffect(() => {
        if (text && textareaRef.current) {
            textareaRef.current.value = text;
            autoResize();
        }
        if (image) {
            setPreviewImage(image);
        }
    }, []);

    const goToPreview = () => {
        resetReport();
        const realText = textareaRef.current?.value || "";
        setText(realText);
        setImage(previewImage);
        console.log(realText)
        goTo("/preview-publication");
    };

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

    const openImageSelector = () => {
        fileInputRef.current?.click();
    };

    const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const maxSize = 2 * 1024 * 1024;

        if (file.size > maxSize) {
            setImageError("La imagen es demasiado pesada (máximo 2 MB).");
            setPreviewImage(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImageError("");
            setPreviewImage(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleValidatePublication = () => {
        const textIsValid = validateText();
        if (isValidImage === false) return;

        if (textIsValid) goToPreview();
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

    return (
        <div className="w-75 mx-auto d-flex flex-column min-vh-100">
            <img className="footer-image d-md-none cursor-pointer my-4" src="Back.svg" alt="Regresar"
                onClick={() => goTo("/choose")} />

            <h1 className="text-white text-center mb-4">Nueva publicación</h1>

            <div className="no-select my-3">
                <img src={profilePictureUrl ?? "/Profile.svg"} alt="Foto de perfil" className="rounded-circle me-1 user-image" />
                <span className="text-white">
                    {name ?? "Usuario"} &gt; <span className="text-grey">Publicación</span>
                </span>
            </div>

            <span className="text-error">{textMessage}</span>
            <textarea
                ref={textareaRef}
                className={`textarea-input mb-3 ${isValidText === false && "input-error"}`}
                placeholder="Expresa tu idea u opinión aquí"
                onInput={autoResize}
                onChange={() => { setIsValidText(null); setTextMessage("") }}
                style={{
                    overflow: "hidden",
                    resize: "none",
                    minHeight: "80px"
                }}
            ></textarea>

            <div>
                <img src="/AddImage.svg" alt="Agregar imagen" className="create-publication-image cursor-pointer me-4"
                    onClick={openImageSelector} />

                <img src="/AddGif.svg" alt="Agregar Gif" className="create-publication-image cursor-pointer"
                    onClick={openImageSelector} />
                {imageError && <span className="text-error text-center d-block mt-2">{imageError}</span>}
            </div>

            <input type="file" accept="image/*" ref={fileInputRef}
                onChange={handleImageSelected} style={{ display: "none" }} />

            {previewImage && (
                <img src={previewImage} alt="Vista previa" className="mt-4 d-block w-75 mx-auto rounded preview-image" />
            )}

            <div className="publication-actions nav-bar w-100 d-flex justify-content-center align-items-center">
                <div className="w-50 text-start">
                    <button className="white-button" onClick={handleValidatePublication}>Previsualizar</button>
                </div>
                <div className="w-50 text-end">
                    <button className="white-button">Publicar</button>
                </div>
            </div>

        </div>
    );
}

export default CreatePublication;
