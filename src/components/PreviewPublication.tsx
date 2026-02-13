import { useState } from "react";
import axios from "axios";
import { usePublicationData } from "../utils/PublicationStore";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import { useUserData } from "../utils/UserStore";
import { useNavigate } from "react-router-dom";

function PreviewPublication() {
    const navigate = useNavigate();
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const { text, image, video, latitude, longitude, setText, setImage, setVideo, resetPublication } = usePublicationData();
    const { email: userEmail, name: userName, profilePictureUrl } = useUserData();
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const handleValidatePublicationPublicate = async () => {
        if (!text?.trim()) return;

        setIsSendingForm(true);

        const token = await getToken();
        axios.post(apiRoutes.create_publication_url, { Contenido: text, Url_imagen: image, Url_video: video, Lat: latitude, Long: longitude }, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setText(null);
                setImage(null);
                setVideo(null);
                resetPublication();
                navigate("/my-profile");
            })
            .catch(() => { })
            .finally(() => {
                setIsSendingForm(false);
            });
    };

    return (

        <div className={`min-dvh-100 ${isSendingForm ? "disabled-form no-select" : ""}`}>
            <div className="w-75 min-dvh-70 mx-auto home-container d-flex flex-column">
                <PublicationCard
                    key={0}
                    isPreview={true}
                    post={{
                        Id_publicacion: 0,
                        Usuario: {
                            Correo_electronico: userEmail,
                            nombre_usuario: userName,
                            Url_foto_perfil: profilePictureUrl
                        },
                        Fecha_publicacion: new Date().toISOString().split("T")[0],
                        Contenido: text,
                        Url_imagen: image,
                        Url_video: video,
                        Lat: latitude,
                        Long: longitude,
                        Me_gusta: 0,
                        Comentarios: 0,
                        Compartidos: 0
                    }}
                    onImageClick={setImagenSeleccionada}
                />

                <ImageModal
                    image={imagenSeleccionada}
                    onClose={() => setImagenSeleccionada(null)}
                />

                <div className="publication-actions w-100 mt-5 d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                        <button className="white-button" onClick={() => navigate("/create-publication")}>Regresar</button>
                    </div>
                    <div className="w-50 text-end">
                        <button className="white-button" onClick={handleValidatePublicationPublicate}>
                            {!isSendingForm ? "Publicar" : (<div className="d-flex justify-content-center"><span>Publicando...</span><div className="loader"></div></div>)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PreviewPublication;
