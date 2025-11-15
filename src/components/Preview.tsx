import React, { useState } from "react";
import { useUserData } from "../utils/UserStore";
import { usePublicationData } from "../utils/PublicationStore";

function Preview() {
    const name = useUserData((state) => state.name);
    const text = usePublicationData((state) => state.text);
    const image = usePublicationData((state) => state.image);
    const profilePictureUrl = useUserData((state) => state.profilePictureUrl);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    console.log(text)

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75 home-container">
                <React.Fragment>
                    <div className="d-flex my-3">
                        <div>
                            <img src={profilePictureUrl ?? "/Profile.svg"} alt={name ?? "Usuario"} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(profilePictureUrl ?? "/Profile.svg")} />
                        </div>
                        <div className="text-white flex-grow-1">
                            <div className="d-flex align-items-center no-select mb-3"><span className="mb-0">{name ?? "Usuario"}</span></div>
                            <p className="mb-3">{text}</p>
                            {image && (<img src={image ?? "/Profile.svg"} alt="imagen publicación" className="rounded-3 mb-3 w-100 cursor-pointer" onClick={() => setImagenSeleccionada(image ?? "/Profile.svg")} />)}

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
                    <hr className="text-white m-0" />
                </React.Fragment>

                {imagenSeleccionada && (
                    <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content bg-transparent border-0">
                                <div className="modal-body p-0 text-center position-relative">
                                    <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid rounded-3 selected-image" />
                                    <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Preview;
