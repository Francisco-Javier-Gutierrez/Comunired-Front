import { useRef, useState } from "react";
import { goTo } from "../utils/globalVariables";
import { BackendApi } from "../utils/globalVariables";
import axios from "axios";

function EditProfile() {
    const [name, setName] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>("Foto de perfil");
    const [isDragging, setIsDragging] = useState(false);

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
            setProfileImage(null);
            return;
        }
        setImageError("Foto de perfil");
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
        const bodyData = {
            Nombre_usuario: name,
            Url_foto_perfil: profileImage
        };

        await axios.post(BackendApi.edit_account_url, bodyData, {
            withCredentials: true
        })
            .catch(error => {
                console.error(error.response?.data);
            });
    };

    return (
        <div className="w-75 mx-auto d-flex flex-column min-vh-100">
            <img className="footer-image d-md-none cursor-pointer my-4"
                src="Back.svg" alt="Regresar"
                onClick={() => goTo("/home")}
            />

            <h1 className="text-white text-center mb-4">Actualizar mis datos</h1>

            <p className="text-white">{imageError}</p>

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
                    <button className="white-button">Cambiar contraseña</button>
                </div>
                <div className="w-50 text-end">
                    <button className="white-button" onClick={handleSave}>Actualizar</button>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
