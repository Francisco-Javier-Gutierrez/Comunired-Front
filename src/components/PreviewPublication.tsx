import React, { useState, useEffect } from "react";
import { useUserData } from "../utils/UserStore";
import axios from "axios";
import { usePublicationData } from "../utils/PublicationStore";
import { goTo, BackendApi } from "../utils/globalVariables";

function PreviewPublication() {
    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url, {}, { withCredentials: true })
            .catch(() => {
                goTo("/login");
            });
    }, []);

    const { name, profilePictureUrl } = useUserData();
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
                <React.Fragment>
                    <div className="d-flex my-3">
                        <div>
                            <img src={profilePictureUrl ?? "/Profile.svg"} alt={name ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(profilePictureUrl ?? "/Profile.svg")} />
                        </div>
                        <div className="text-white flex-grow-1">
                            <div className="d-flex align-items-center justify-content-between no-select mb-3">
                                <span className="mb-0">{name ?? "Usuario"}</span>
                                <span className="mb-0">{new Date().toISOString().split("T")[0]}</span>
                            </div>
                            <p className="mb-3">{text}</p>
                            {image && (
                                <img src={image} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto"
                                    onClick={() => setImagenSeleccionada(image)} />
                            )}
                            <div className="d-flex no-select justify-content-between text-center mt-2">
                                <div className="cursor-pointer d-flex align-items-center justify-content-center">
                                    <img src="Like.svg" width={20} className="me-1" alt="Like" />
                                    <span>0</span>
                                </div>
                                <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />0</div>
                                <div><img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />0</div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>

                {imagenSeleccionada && (
                    <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content bg-transparent border-0">
                                <div className="modal-body p-0 text-center position-relative">
                                    <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid w-75 rounded-3 selected-image" />
                                    <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
