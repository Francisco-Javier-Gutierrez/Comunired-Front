import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import { usePublicationData } from "../utils/PublicationStore";
import { uploadFile } from "../utils/UploadUtils";
import LocationPicker from "./LocationPicker";
import ConfirmModal from "./modals/ConfirmModal";

function CreatePublication() {
    const navigate = useNavigate();
    const { name, profilePictureUrl } = useUserData();
    const {
        text, setText,
        image, setImage,
        video, setVideo,
        latitude, setLatitude,
        longitude, setLongitude,
        resetPublication
    } = usePublicationData();
    const [textMessage, setTextMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputVideoRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isValidText, setIsValidText] = useState<boolean | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewVideo, setPreviewVideo] = useState<string | null>(null);
    const [imageError, setImageError] = useState("");
    const [videoError, setVideoError] = useState("");
    const [isValidImage, setIsValidImage] = useState<boolean | null>(null);
    const [isValidVideo, setIsValidVideo] = useState<boolean | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isSendingForm, setIsSendingForm] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const [modalData, setModalData] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { }
    });

    useEffect(() => {
        if (text && textareaRef.current) {
            textareaRef.current.value = text;
            autoResize();
        }
        if (image) setPreviewImage(image);
        if (video) setPreviewVideo(video);
        if (latitude && longitude) setShowMap(true);
    }, []);

    useEffect(() => {
        if (text === null && image === null && video === null && latitude === null && longitude === null) {
            if (textareaRef.current) textareaRef.current.value = "";
            setPreviewImage(null);
            setPreviewVideo(null);
            setShowMap(false);
        }
    }, [text, image, video, latitude, longitude]);

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
    const openVideoSelector = () => fileInputVideoRef.current?.click();

    const toggleLocation = () => {
        if (!showMap && (image || video)) {
            setModalData({
                isOpen: true,
                title: "¿Agregar ubicación?",
                description: `Al agregar una ubicación, se eliminará ${image ? "la foto" : "el video"} seleccionado.`,
                onConfirm: () => {
                    setImage(null);
                    setPreviewImage(null);
                    setVideo(null);
                    setPreviewVideo(null);
                    setShowMap(true);
                    setModalData(prev => ({ ...prev, isOpen: false }));
                }
            });
        } else {
            if (!showMap) {
                setImage(null);
                setPreviewImage(null);
                setVideo(null);
                setPreviewVideo(null);
            }
            setShowMap(!showMap);
        }
    };

    const handleAddImage = () => {
        if (video || showMap) {
            setModalData({
                isOpen: true,
                title: "¿Agregar foto?",
                description: `Al agregar una foto, se eliminará ${video ? "el video" : "la ubicación"} seleccionada.`,
                onConfirm: () => {
                    setVideo(null);
                    setPreviewVideo(null);
                    setShowMap(false);
                    setLatitude(null);
                    setLongitude(null);
                    openImageSelector();
                    setModalData(prev => ({ ...prev, isOpen: false }));
                }
            });
        } else {
            openImageSelector();
        }
    };

    const handleAddVideo = () => {
        if (image || showMap) {
            setModalData({
                isOpen: true,
                title: "¿Agregar video?",
                description: `Al agregar un video, se eliminará ${image ? "la foto" : "la ubicación"} seleccionada.`,
                onConfirm: () => {
                    setImage(null);
                    setPreviewImage(null);
                    setShowMap(false);
                    setLatitude(null);
                    setLongitude(null);
                    openVideoSelector();
                    setModalData(prev => ({ ...prev, isOpen: false }));
                }
            });
        } else {
            openVideoSelector();
        }
    };


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

        setVideo(null);
        setPreviewVideo(null);
        setIsValidVideo(null);
        setVideoError("");

        setShowMap(false);
        setLatitude(null);
        setLongitude(null);

        const blobUrl = URL.createObjectURL(file);
        setPreviewImage(blobUrl);

        setIsUploadingImage(true);
        try {
            const fileUrl = await uploadFile(file, "publications");
            if (fileUrl) {
                setPreviewImage(fileUrl);
                setImage(fileUrl);
            }
        } catch (err) {
            console.error("Error subiendo imagen:", err);
            setImageError("Error subiendo imagen, intenta de nuevo");
            setIsValidImage(false);
            setPreviewImage(null);
            setImage(null);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingImage(false);
        }
    };

    const handleVideoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            setVideoError("El video es demasiado pesado (máx 500MB)");
            setIsValidVideo(false);
            return;
        }

        setIsValidVideo(true);
        setVideoError("");

        setImage(null);
        setPreviewImage(null);
        setIsValidImage(null);
        setImageError("");

        setShowMap(false);
        setLatitude(null);
        setLongitude(null);

        const blobUrl = URL.createObjectURL(file);
        setPreviewVideo(blobUrl);

        setIsUploadingVideo(true);
        try {
            const fileUrl = await uploadFile(file, "publications");
            if (fileUrl) {
                setPreviewVideo(fileUrl);
                setVideo(fileUrl);
            }
        } catch (err) {
            console.error("Error subiendo video:", err);
            setVideoError("Error subiendo video, intenta de nuevo");
            setIsValidVideo(false);
            setPreviewVideo(null);
            setVideo(null);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingVideo(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewImage(null);
        setIsValidImage(null);
        setImageError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveVideo = () => {
        setVideo(null);
        setPreviewVideo(null);
        setIsValidVideo(null);
        setVideoError("");
        if (fileInputVideoRef.current) fileInputVideoRef.current.value = "";
    };

    const handleRemoveLocation = () => {
        setLatitude(null);
        setLongitude(null);
        setShowMap(false);
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

    const handleValidatePublicatePublication = async () => {
        const textIsValid = validateText();
        if (!textIsValid || isValidImage === false || isValidVideo === false) return;

        setIsSendingForm(true);
        try {
            const realText = textareaRef.current?.value || "";
            const token = await getToken();

            await axios.post(
                apiRoutes.create_publication_url,
                {
                    Contenido: realText,
                    Url_imagen: image,
                    Url_video: video,
                    Lat: latitude,
                    Long: longitude
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            resetPublication();
            setPreviewImage(null);
            setPreviewVideo(null);
            setShowMap(false);
            navigate("/my-profile");
        } catch (err) {
            console.error("Error publicando:", err);
        } finally {
            setIsSendingForm(false);
        }
    };

    const handleValidatePreviewPublication = async () => {
        const textIsValid = validateText();
        if (!textIsValid || isValidImage === false || isValidVideo === false) return;
        navigate("/preview-publication");
    };

    return (
        <div className={`${isSendingForm || isUploadingImage || isUploadingVideo ? "disabled-form no-select" : ""}`}>
            <div className="w-75 mx-auto d-flex flex-column min-dvh-100">
                <img className="footer-image d-md-none cursor-pointer my-4" src="Back.svg" alt="Regresar" onClick={() => navigate(-1)} />

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
                    onChange={(e) => { setIsValidText(null); setTextMessage(""); setText(e.target.value); }}
                    style={{ overflow: "hidden", resize: "none", minHeight: "80px" }}
                />

                <div className="d-flex align-items-center mb-3">
                    <img src="/AddImage.svg" alt="Agregar imagen" className="create-publication-image cursor-pointer me-4" onClick={handleAddImage} />
                    <img src="/AddVideo.svg" alt="Agregar video" className="create-publication-image cursor-pointer me-4" onClick={handleAddVideo} />
                    <img src="/AddLocation.svg" alt="Agregar ubicación" className="create-publication-image cursor-pointer me-4" onClick={toggleLocation} />
                </div>

                {imageError && <span className="text-error text-center d-block mt-2">{imageError}</span>}
                {videoError && <span className="text-error text-center d-block mt-2">{videoError}</span>}
                {(isUploadingImage || isUploadingVideo) && <span className="text-white d-block mt-2">Subiendo archivo...</span>}

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelected} style={{ display: "none" }} />
                <input type="file" accept="video/*" ref={fileInputVideoRef} onChange={handleVideoSelected} style={{ display: "none" }} />

                {showMap && (
                    <div className="mb-4 position-relative">
                        <LocationPicker
                            latitude={latitude}
                            longitude={longitude}
                            setLocation={(lat: number | null, lng: number | null) => {
                                setLatitude(lat);
                                setLongitude(lng);
                            }}
                        />
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2 bg-light rounded-circle"
                            onClick={handleRemoveLocation}
                            style={{ zIndex: 1000 }}
                        />
                    </div>
                )}

                {previewImage && (
                    <div className="position-relative w-75 mx-auto mt-4">
                        <img src={previewImage} alt="Vista previa" className="d-block w-100 rounded preview-image" />
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2 bg-light rounded-circle"
                            onClick={handleRemoveImage}
                        />
                    </div>
                )}

                {previewVideo && (
                    <div className="position-relative w-75 mx-auto mt-4">
                        <video src={previewVideo} controls className="d-block w-100 rounded" />
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2 bg-light rounded-circle"
                            onClick={handleRemoveVideo}
                            style={{ zIndex: 1 }}
                        />
                    </div>
                )}

                <div className="publication-actions w-100 mt-5 d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                        <button className="white-button" onClick={handleValidatePreviewPublication} disabled={isUploadingImage || isUploadingVideo || isSendingForm}>Previsualizar</button>
                    </div>
                    <div className="w-50 text-end">
                        <button className="white-button" onClick={handleValidatePublicatePublication} disabled={isUploadingImage || isUploadingVideo || isSendingForm}>
                            {!isSendingForm ? "Publicar" : (<div className="d-flex justify-content-center"><span>Publicando...</span><div className="loader ms-3"></div></div>)}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalData.isOpen}
                title={modalData.title}
                description={modalData.description}
                onConfirm={modalData.onConfirm}
                onCancel={() => setModalData(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default CreatePublication;
