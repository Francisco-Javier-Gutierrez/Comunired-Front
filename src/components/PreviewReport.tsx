import React, { useState, useEffect } from "react";
import { useUserData } from "../utils/UserStore";
import { useReportData } from "../utils/ReportStore";
import { goTo, BackendApi } from "../utils/globalVariables";
import { formatFecha } from "../utils/globalVariables";
import axios from "axios";
import { ServiceNames, type ServiceCode } from "../enums/ServiceEnum";

function PreviewReport() {
    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url, {}, { withCredentials: true })
            .catch(() => {
                goTo("/login");
            });
    }, []);

    const { name, profilePictureUrl } = useUserData();

    const {
        Servicio_reporte,
        Descripcion_problema,
        Direccion,
        Foto_evidencia
    } = useReportData();

    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    return (
        <div className="w-75 min-dvh-70 mx-auto home-container d-flex flex-column">
            <React.Fragment>
                <div className="d-flex my-3">
                    <div>
                        <img
                            src={profilePictureUrl ?? "/Profile.svg"}
                            alt={name ?? "Usuario"}
                            className="cursor-pointer no-select rounded-circle me-1 user-image"
                            onClick={() => setImagenSeleccionada(profilePictureUrl)}
                        />
                    </div>

                    <div className="text-white flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="no-select">{name ?? "Usuario"}</span>
                            <span>{formatFecha(new Date().toISOString().split("T")[0])}</span>
                        </div>
                        <p className="mb-1">{Direccion}</p>
                        <p className="mb-1">
                            <strong>Servicio:</strong>{" "}
                            {ServiceNames[Servicio_reporte as ServiceCode] ?? null}
                        </p>
                        <p className="mb-3">{Descripcion_problema}</p>
                        {Foto_evidencia && (
                            <img
                                src={Foto_evidencia}
                                alt="evidencia"
                                className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto"
                                onClick={() => setImagenSeleccionada(Foto_evidencia)}
                            />
                        )}

                        <div className="d-flex no-select justify-content-between text-center mt-2">
                            <div className="cursor-pointer d-flex align-items-center justify-content-center">
                                <img src="Like.svg" width={20} className="me-1" alt="Like" />
                                <span>0</span>
                            </div>
                            <div>
                                <img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />
                                0
                            </div>
                            <div>
                                <img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />
                                0
                            </div>
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
                                <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid w-75 rounded-3 selected-image" />
                                <button
                                    type="button"
                                    className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle"
                                    onClick={() => setImagenSeleccionada(null)}
                                ></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="publication-actions nav-bar w-100 mt-auto d-flex justify-content-center align-items-center">
                <div className="w-50 text-start">
                    <button className="white-button" onClick={() => goTo("/create-report")}>Regresar</button>
                </div>
                <div className="w-50 text-end">
                    <button className="white-button">Publicar</button>
                </div>
            </div>
        </div>
    );
}

export default PreviewReport;
