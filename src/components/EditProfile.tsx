import { useRef, useState, useEffect } from "react";
import { goTo } from "../utils/globalVariables";
import { BackendApi } from "../utils/globalVariables";
import axios from "axios";

function EditProfile() {

    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url, {}, { withCredentials: true })
            .catch(() => {
                goTo("/login");
            });
    }, []);

    const [name, setName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [imageError, setImageError] = useState<string | null>("Foto de perfil");
    const [isValidImage, setIsValidImage] = useState<boolean | null>(true);


    const MAX_MB = 2;
    const MAX_BYTES = MAX_MB * 1024 * 1024;

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImage = async (file: File) => {
        if (!file) return;

        if (file.size > MAX_BYTES) {
            setImageError(`La imagen supera ${MAX_MB}MB`);
            setIsValidImage(false);
            setProfileImage(null);
            return;
        }
        setImageError("Foto de perfil");
        setIsValidImage(true);
        const base64 = await convertToBase64(file);
        setProfileImage(base64);
    };

    const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        handleImage(file);
    };

    const openImageSelector = () => fileInputRef.current?.click();

    const handleDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        handleImage(file);
    };

    const handleSave = async () => {
        if (!name.trim() && !profileImage) {
            setErrorMessage("Debes cambiar tu nombre o actualizar tu foto antes de guardar");
            return;
        }

        if (name.trim().length > 0 && name.trim().length < 3) {
            setErrorMessage("El nombre debe tener al menos 3 caracteres");
            return;
        }

        setErrorMessage("");

        const bodyData = {
            Nombre_usuario: name.trim().length > 0 ? name : null,
            Url_foto_perfil: profileImage || null,
        };

        setIsSendingForm(true);

        await axios
            .post(BackendApi.edit_account_url, bodyData, { withCredentials: true })
            .then(() => {
                goTo("/my-profile");
            })
            .catch(() => { })
            .finally(() => { setIsSendingForm(false) });
    };

    return (
        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <div className="w-75 mx-auto d-flex flex-column min-vh-100">
                <img className="footer-image d-md-none cursor-pointer my-4"
                    src="Back.svg" alt="Regresar"
                    onClick={() => goTo("/home")}
                />

                <h1 className="text-white text-center mb-4">Actualizar mis datos</h1>

                <h6 className="text-error">{errorMessage}</h6>

                <p className={`text-white ${isValidImage ? "" : "text-error"}`}>{imageError}</p>

                <div
                    className={`text-center mb-4 info-report w-100 cursor-pointer ${isDragging ? "drag-active" : ""}`}
                    onClick={openImageSelector}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropImage}
                >
                    {profileImage ? (
                        <img src={profileImage} alt="Vista previa" className="d-block w-75 mx-auto rounded preview-image" />
                    ) : (
                        <>
                            <p className="d-block text-white">Haz click o arrastra una imagen aquí</p>
                            <img src="/AddImage.svg" alt="Agregar imagen" className="report-add-image mb-2" />
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
                />

                <div className="publication-actions nav-bar w-100 d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                        <button className="white-button"
                            onClick={() => { goTo("/edit-password") }}>Cambiar contraseña</button>
                    </div>
                    <div className="w-50 text-end">
                        <button className="white-button" onClick={handleSave}>
                            {!isSendingForm ? "Actualizar" : (<div className="d-flex justify-content-center"><span>Actualizando...</span><div className="loader ms-3"></div></div>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
