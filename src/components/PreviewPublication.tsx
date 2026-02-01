import { useState } from "react";
import axios from "axios";
import { usePublicationData } from "../utils/PublicationStore";
import { goTo, BackendApi } from "../utils/globalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./ImageModal";

function PreviewPublication() {
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);
    const { text, image, setText, setImage, resetPublication } = usePublicationData();
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const handleValidatePublicationPublicate = () => {
        if (!text?.trim()) return;

        setIsSendingForm(true);

        axios.post(BackendApi.create_publication_url, { Contenido: text, Url_imagen: image }, { withCredentials: true })
            .then(() => {
                setText(null);
                setImage(null);
                resetPublication();
                goTo("/my-profile");
            })
            .catch(() => { })
            .finally(() => {
                setIsSendingForm(false);
            });
    };

    return (

        <div className={`${isSendingForm ? "disabled-form no-select" : ""}`}>
            <div className="w-75 min-dvh-70 mx-auto home-container d-flex flex-column">
                <PublicationCard
                    key={0}
                    post={{
                        Id_publicacion: 0,
                        Nombre: "Usuario",
                        Fecha_publicacion: new Date().toISOString().split("T")[0],
                        Contenido: text,
                        Url_imagen: image,
                        Me_gusta: 0,
                        Comentarios: 0,
                        Compartidos: 0,
                        Url_foto_perfil: "/Profile.svg"
                    }}
                    onImageClick={setImagenSeleccionada}
                />

                <ImageModal
                    image={imagenSeleccionada}
                    onClose={() => setImagenSeleccionada(null)}
                />

                <div className="publication-actions nav-bar w-100 mt-auto d-flex justify-content-center align-items-center">
                    <div className="w-50 text-start">
                        <button className="white-button" onClick={() => goTo("/create-publication")}>Regresar</button>
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
