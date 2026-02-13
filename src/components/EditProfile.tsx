import { useRef, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { uploadFile } from "../utils/UploadUtils";
import { updateUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { useUserData } from "../utils/UserStore";
import type { AuthContext } from "./layouts/LoggedLayout";

function EditProfile() {
    const navigate = useNavigate();
    const authContext = useOutletContext<AuthContext>();
    const { setName: setGlobalName, setProfilePictureUrl } = useUserData();

    const [name, setName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean>(false);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [imageError, setImageError] = useState<string>("");
    const [isValidImage, setIsValidImage] = useState<boolean>(true);

    const MAX_MB = 5;
    const MAX_BYTES = MAX_MB * 1024 * 1024;

    useEffect(() => {
        if (authContext.name) setName(authContext.name);
        if (authContext.picture) {
            setPreviewImage(authContext.picture);
            setProfileImage(authContext.picture);
        }
    }, [authContext]);


    const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await handleImage(file);
    };

    const handleImage = async (file: File) => {
        if (!file) return;

        if (file.size > MAX_BYTES) {
            setImageError(`La imagen supera ${MAX_MB}MB`);
            setIsValidImage(false);
            setPreviewImage(null);
            setProfileImage(null);
            return;
        }

        setIsValidImage(true);
        setImageError("");

        const blobUrl = URL.createObjectURL(file);
        setPreviewImage(blobUrl);

        setIsUploadingImage(true);
        try {
            const fileUrl = await uploadFile(file, "profile");
            if (fileUrl) {
                setPreviewImage(fileUrl);
                setProfileImage(fileUrl);
            }
        } catch (err) {
            console.error("Error subiendo imagen:", err);
            setImageError("Error subiendo imagen, intenta de nuevo");
            setIsValidImage(false);
            setPreviewImage(null);
            setProfileImage(null);
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
            setIsUploadingImage(false);
        }
    };

    const openImageSelector = () => fileInputRef.current?.click();

    const handleDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        await handleImage(file);
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        const hasNameChange = trimmedName && trimmedName !== authContext.name;
        const hasPictureChange = profileImage && profileImage !== authContext.picture;

        if (!hasNameChange && !hasPictureChange) {
            setErrorMessage("Debes cambiar tu nombre o actualizar tu foto antes de guardar");
            return;
        }

        if (trimmedName.length > 0 && trimmedName.length < 3) {
            setErrorMessage("El nombre debe tener al menos 3 caracteres");
            return;
        }

        setErrorMessage("");
        setIsSendingForm(true);

        try {
            const userAttributes: Record<string, string> = {};

            if (hasNameChange) {
                userAttributes.name = trimmedName;
            }

            if (hasPictureChange && profileImage) {
                userAttributes.picture = profileImage;
            }

            await updateUserAttributes({ userAttributes });

            await fetchAuthSession({ forceRefresh: true });

            if (hasNameChange) setGlobalName(trimmedName);
            if (hasPictureChange && profileImage) setProfilePictureUrl(profileImage);

            navigate("/my-profile");
        } catch (err: any) {
            console.error("Error actualizando perfil:", err);
            setErrorMessage(err.message || "Error al actualizar el perfil");
        } finally {
            setIsSendingForm(false);
        }
    };

    const isFormDisabled = isSendingForm || isUploadingImage;

    return (
        <div className={`${isFormDisabled ? "disabled-form no-select" : ""}`}>
            <div className="w-75 mx-auto d-flex flex-column min-dvh-100">
                <img
                    className="footer-image d-md-none cursor-pointer my-4"
                    src="Back.svg"
                    alt="Regresar"
                    onClick={() => navigate("/my-profile")}
                />

                <h1 className="text-white text-center mb-4">Actualizar mis datos</h1>

                {errorMessage && <h6 className="text-error">{errorMessage}</h6>}

                <p className={`text-white ${!isValidImage ? "text-error" : ""}`}>
                    {imageError || "Foto de perfil"}
                </p>

                <div
                    className={`text-center mb-4 info-publication w-100 cursor-pointer ${isDragging ? "drag-active" : ""}`}
                    onClick={openImageSelector}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropImage}
                >
                    {isUploadingImage ? (
                        <div className="d-flex flex-column align-items-center py-4">
                            <div className="loader mb-2"></div>
                            <p className="text-white">Subiendo imagen...</p>
                        </div>
                    ) : previewImage ? (
                        <img
                            src={previewImage}
                            alt="Vista previa"
                            className="d-block w-75 mx-auto rounded preview-image"
                        />
                    ) : (
                        <>
                            <p className="d-block text-white">Haz click o arrastra una imagen aquí</p>
                            <img src="/AddImage.svg" alt="Agregar imagen" className="publication-add-image mb-2" />
                        </>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelected}
                    style={{ display: "none" }}
                />

                <p className="text-white">Nombre</p>
                <input
                    className="text-input w-100 mb-4"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={authContext.name || "Tu nombre"}
                />

                <div className="publication-actions nav-bar w-100 d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                        <button
                            className="white-button"
                            onClick={() => navigate("/edit-password")}
                        >
                            Cambiar contraseña
                        </button>
                    </div>
                    <div className="w-50 text-end">
                        <button className="white-button" onClick={handleSave} disabled={isFormDisabled}>
                            {!isSendingForm ? (
                                "Actualizar"
                            ) : (
                                <div className="d-flex justify-content-center">
                                    <span>Actualizando...</span>
                                    <div className="loader ms-3"></div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
