import { useRef, useState, useEffect } from "react";
import { goTo, BackendApi, BanMessaje } from "../utils/globalVariables";
import axios from "axios";
import { useReportData } from "../utils/ReportStore";
import { ServiceCodes, ServiceNames, type ServiceCode } from "../enums/ServiceEnum";
import { UrgencyCodes, UrgencyNames, type UrgencyCode } from "../enums/UrgencyEnum";
import { SignalNames, type SignalCode } from "../enums/SignalEnum";

const municipiosValidos = [
    "Almoloya de Alquisiras",
    "Amanalco",
    "Amatepec",
    "Coatepec Harinas",
    "Donato Guerra",
    "Ixtapan de la Sal",
    "Ixtapan del Oro",
    "Joquicingo",
    "Luvianos",
    "Malinalco",
    "Ocuilan",
    "Otzoloapan",
    "Rayón",
    "San Martín Otzoloapan",
    "San Simón de Guerrero",
    "Santo Tomás de los Plátanos",
    "Sultepec",
    "Tejupilco",
    "Tenancingo",
    "Tenango del Valle",
    "Temascaltepec",
    "Texcaltitlán",
    "Tlatlaya",
    "Tonatico",
    "Valle de Bravo",
    "Villa de Allende",
    "Villa Guerrero",
    "Zacazonapan",
    "Zacualpan",
    "Zumpahuacán"
];

function CreateReport() {
    const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);
    const [isSendingForm, setIsSendingForm] = useState<boolean | null>(null);

    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url, {}, { withCredentials: true })
            .catch((err: any) => {
                if (err?.response?.status === 403) {
                    setIsBannedUser(true);
                } else if (err?.response?.status === 401) {
                    goTo("/login");
                } else {
                    console.error("Error inesperado:", err);
                }
            });
    }, []);

    const {
        Servicio_reporte,
        Descripcion_problema,
        Direccion,
        Nivel_urgencia,
        Foto_evidencia,
        Nombre_reportante,
        Contacto_reportante,
        Tipo_senal,
        Correo_problema,
        setServicio,
        setDescripcion,
        setDireccion,
        setUrgencia,
        setFoto,
        setNombre,
        setCorreoProblema,
        setSenal,
        setContacto,
    } = useReportData();

    const serviceRef = useRef<HTMLDivElement | null>(null);
    const urgencyRef = useRef<HTMLDivElement | null>(null);

    const [service, setService] = useState("");
    const [isServiceSelectOpen, setIsServiceSelectOpen] = useState(false);
    const [serviceError, setServiceError] = useState("Qué servicio desea reportar *");
    const [isServiceValid, setIsServiceValid] = useState<boolean | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [descriptionError, setDescriptionError] = useState("Descripción del problema *");
    const [isDescriptionValid, setIsDescriptionValid] = useState<boolean | null>(null);

    const [location, setLocation] = useState("");
    const [locationError, setLocationError] = useState("Dirección *");
    const [isLocationValid, setIsLocationValid] = useState<boolean | null>(null);

    const [urgency, setUrgency] = useState("");
    const [isUrgencySelectOpen, setIsUrgencySelectOpen] = useState(false);
    const [urgencyError, setUrgencyError] = useState("Nivel de urgencia *");
    const [isUrgencyValid, setIsUrgencyValid] = useState<boolean | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
    const [evidenceError, setEvidenceError] = useState<string | null>("Evidencia");
    const [isEvidenceValid, setIsEvidenceValid] = useState<boolean | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [selectedCarrier, setSelectedCarrier] = useState("");
    const [customEmail, setCustomEmail] = useState("");

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");

    const [isSignalSelectOpen, setIsSignalSelectOpen] = useState(false);
    const [isSignalValid, setIsSignalValid] = useState(null);
    const signalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
                setIsServiceSelectOpen(false);
            }
            if (urgencyRef.current && !urgencyRef.current.contains(event.target as Node)) {
                setIsUrgencySelectOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (Servicio_reporte) setService(Servicio_reporte);

        if (Descripcion_problema && textareaRef.current) {
            textareaRef.current.value = Descripcion_problema;
            autoResize();
        }

        if (Direccion) setLocation(Direccion);
        if (Nivel_urgencia) setUrgency(Nivel_urgencia);
        if (Foto_evidencia) setEvidenceImage(Foto_evidencia);
        if (Nombre_reportante) setName(Nombre_reportante);
        if (Contacto_reportante) setContact(Contacto_reportante);
        if (Servicio_reporte === ServiceCodes.OT && Correo_problema) {
            setCustomEmail(Correo_problema);
        }
        if (Servicio_reporte === ServiceCodes.ST && Tipo_senal) {
            setSelectedCarrier(Tipo_senal);
        }
    }, []);

    if (isBannedUser) return (
        <h1 className="text-danger text-break fw-bold mt-5 w-75 mx-auto">
            {BanMessaje}
        </h1>
    );

    const goToPreview = () => {
        setServicio(service);
        setUrgencia(urgency);
        setDescripcion(textareaRef.current?.value ?? null);
        setDireccion(location);
        setFoto(evidenceImage);
        setNombre(name);
        setContacto(contact);

        if (service === ServiceCodes.OT) {
            setCorreoProblema(customEmail?.trim() || null);
        } else {
            setCorreoProblema(null);
        }
        if (service === ServiceCodes.ST) {
            setSenal(selectedCarrier?.trim() || null);
        } else {
            setSenal(null);
        }
        goTo("/preview-report");
    };

    const openImageSelector = () => fileInputRef.current?.click();

    const MAX_MB = 10;
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
            setEvidenceError(`La imagen está demasiado pesada, el máximo permitido es: ${MAX_MB}MB`);
            setIsEvidenceValid(false);
            setEvidenceImage(null);
            return;
        }
        setEvidenceError("Evidencia");
        setIsEvidenceValid(true);

        const base64 = await convertToBase64(file);
        setEvidenceImage(base64);
    };

    const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        handleImage(file);
    };

    const handleValidatePublication = () => {
        const validService = validateService();
        const validUrgency = validateUrgency();
        const validAddress = validateLocation();
        const validDescription = validateDescription();
        validAddress && validUrgency && validService && validDescription && goToPreview();
    };

    const validateService = () => {
        if (!service.trim()) {
            setServiceError("No ha seleccionado un servicio para reportar");
            setIsServiceValid(false);
            return false;
        }
        setIsServiceValid(true);
        return true;
    };

    const validateDescription = () => {
        const realText = textareaRef.current?.value || "";
        if (!realText.trim()) {
            setDescriptionError("No ha descrito el problema");
            setIsDescriptionValid(false);
            return false;
        }
        setIsDescriptionValid(true);
        return true;
    };

    const validateLocation = () => {
        const value = location.trim();

        if (!value) {
            setLocationError("No ha escrito la dirección");
            setIsLocationValid(false);
            return false;
        }

        if (value.length < 5) {
            setLocationError("La dirección es demasiado corta");
            setIsLocationValid(false);
            return false;
        }

        if (/^\d+$/.test(value)) {
            setLocationError("La dirección no puede ser solo números");
            setIsLocationValid(false);
            return false;
        }

        if (/^[^a-zA-Z0-9áéíóúüÁÉÍÓÚÜ\s]{3,}$/.test(value)) {
            setLocationError("La dirección no es válida");
            setIsLocationValid(false);
            return false;
        }

        const parts = value.split(",").map(p => p.trim());

        if (parts.length !== 6) {
            setLocationError("Formato incorrecto. Debe ser: calle, número, CP, municipio, Estado de México, México");
            setIsLocationValid(false);
            return false;
        }

        const [calle, numero, cp, municipio, estado, pais] = parts;

        if (!/^[A-Za-z0-9áéíóúüÁÉÍÓÚÜ\s\.\-]+$/.test(calle)) {
            setLocationError("La calle no es válida");
            setIsLocationValid(false);
            return false;
        }

        if (!/^(\d+|N\/A|S\/N)$/i.test(numero)) {
            setLocationError("El número debe ser un número, N/A o S/N");
            setIsLocationValid(false);
            return false;
        }

        if (!/^\d{5}$/.test(cp)) {
            setLocationError("El código postal debe tener 5 dígitos");
            setIsLocationValid(false);
            return false;
        }

        if (!/^[A-Za-záéíóúüÁÉÍÓÚÜ\s\.\-]+$/.test(municipio)) {
            setLocationError("El municipio no es válido");
            setIsLocationValid(false);
            return false;
        }

        const municipioNormalizado = municipio.toLowerCase();
        const esValido = municipiosValidos.some(m => m.toLowerCase() === municipioNormalizado);

        if (!esValido) {
            setLocationError("El municipio no pertenece a la zona válida");
            setIsLocationValid(false);
            return false;
        }

        if (estado.toLowerCase() !== "estado de méxico") {
            setLocationError("El estado debe ser 'Estado de México'");
            setIsLocationValid(false);
            return false;
        }

        if (pais.toLowerCase() !== "méxico") {
            setLocationError("El país debe ser 'México'");
            setIsLocationValid(false);
            return false;
        }

        setIsLocationValid(true);
        return true;
    };

    const validateUrgency = () => {
        if (!urgency.trim()) {
            setUrgencyError("No ha seleccionado un nivel de urgencia");
            setIsUrgencyValid(false);
            return false;
        }
        setIsUrgencyValid(true);
        return true;
    };

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "auto";
        const maxHeight = window.innerHeight * 0.3;
        const newHeight = el.scrollHeight;

        if (newHeight < maxHeight) {
            el.style.overflowY = "hidden";
            el.style.height = newHeight + "px";
        } else {
            el.style.overflowY = "auto";
            el.style.height = maxHeight + "px";
        }
    };

    const handleDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;
        handleImage(file);
    };

    const handleCreateReport = () => {
        setIsSendingForm(true);
        const payload: any = {
            Servicio_reporte: service,
            Descripcion_problema: textareaRef.current?.value.trim(),
            Direccion: location,
            Nivel_urgencia: urgency
        };

        if (service === ServiceCodes.OT && customEmail.trim()) {
            payload.Correo_problema = customEmail.trim();
        }

        if (service === ServiceCodes.ST && selectedCarrier === "OTR" && customEmail.trim()) {
            payload.Correo_problema = customEmail.trim();
        }

        if (evidenceImage) payload.Foto_evidencia = evidenceImage;
        if (name.trim()) payload.Nombre_reportante = name.trim();
        if (contact.trim()) payload.Contacto_reportante = contact.trim();

        console.log(payload);

        axios.post(
            BackendApi.create_report_url,
            payload,
            { withCredentials: true }
        )
            .then((res) => {
                console.log("Reporte creado:", res.data);
            })
            .catch((err) => {
                console.error("Error creando reporte", err);
            })
            .finally(() => {
                setIsSendingForm(false)
                goTo("/");
            });
    };

    return (
        <div className={`w-75 mx-auto d-flex flex-column min-dvh-100 ${isSendingForm ? "disabled-form no-select" : ""}`}>
            <img className="footer-image d-md-none cursor-pointer my-4" src="Back.svg" alt="Regresar"
                onClick={() => goTo("/choose")} />

            <h1 className="text-white text-center mb-4">Nuevo reporte</h1>

            <div className="d-flex justify-content-center align-items-center mb-5 info-report w-100">
                <img src="/Info.svg" className="info-image m-2" alt="Info image" />
                <h6 className="fw-bold ms-3 my-0 text-white">Los campos marcados con * son obligatorios</h6>
            </div>

            <p className={`text-white ${isServiceValid === false ? "text-error" : ""}`}>
                {serviceError}
            </p>

            <div ref={serviceRef} className={`custom-select-container w-100 mb-4 ${isServiceValid === false ? "input-error" : ""}`}>
                <div className="relative w-100">
                    <div className="text-white border rounded d-flex justify-content-between align-items-center cursor-pointer" onClick={() => setIsServiceSelectOpen(!isServiceSelectOpen)}>
                        <span>{(ServiceNames[service as ServiceCode] ?? null) || "Seleccione un servicio"}</span>
                        <span>{isServiceSelectOpen ? "▲" : "▼"}</span>
                    </div>

                    {isServiceSelectOpen && (
                        <div className="position-absolute bg-grey text-white border rounded pt-1 w-100" style={{ zIndex: 20 }}>
                            {[
                                { v: ServiceCodes.EE, t: "Energía eléctrica" },
                                { v: ServiceCodes.ST, t: "Señal telefónica" },
                                { v: ServiceCodes.IV, t: "Infraestructura / Vialidad" },
                                { v: ServiceCodes.SEG, t: "Seguridad" },
                                { v: ServiceCodes.SM, t: "Servicios municipales" },
                                { v: ServiceCodes.AG, t: "Agua" },
                                { v: ServiceCodes.OT, t: "Otro" },
                            ].map(o => (
                                <div key={o.v} className="p-2 hover-bg cursor-pointer" onClick={() => { setService(o.v); setIsServiceValid(null); setServiceError("Qué servicio desea reportar *"); setIsServiceSelectOpen(false); }}>
                                    {o.t}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {service === ServiceCodes.OT && (
                <div className="mb-4">
                    <p className="text-white">Correo del responsable del servicio*</p>
                    <input
                        type="text"
                        className="text-input w-100"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                    />
                </div>
            )}

            {service === ServiceCodes.ST && (
                <>
                    <p className={`text-white ${isServiceValid === false ? "text-error" : ""}`}>Ingrese el proveedor de señal</p>
                    <div
                        ref={signalRef}
                        className={`custom-select-container w-100 mb-4 ${isSignalValid === false ? "input-error" : ""}`}
                    >
                        <div className="relative w-100">
                            <div
                                className="text-white border rounded d-flex justify-content-between align-items-center cursor-pointer"
                                onClick={() => setIsSignalSelectOpen(!isSignalSelectOpen)}
                            >
                                <span>
                                    {SignalNames[selectedCarrier as SignalCode] || "Seleccione el tipo de señal"}
                                </span>
                                <span>{isSignalSelectOpen ? "▲" : "▼"}</span>
                            </div>

                            {isSignalSelectOpen && (
                                <div
                                    className="position-absolute bg-grey text-white border rounded pt-1 w-100"
                                    style={{ zIndex: 20 }}
                                >
                                    {Object.entries(SignalNames).map(([code, label]) => (
                                        <div
                                            key={code}
                                            className="p-2 hover-bg cursor-pointer"
                                            onClick={() => {
                                                setSelectedCarrier(code as SignalCode);
                                                setIsSignalValid(null);
                                                setIsSignalSelectOpen(false);
                                            }}
                                        >
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {service === ServiceCodes.ST && selectedCarrier === "OTR" && (
                <div className="mb-4">
                    <p className="text-white">Correo del proveedor *</p>
                    <input
                        type="text"
                        className="text-input w-100"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                    />
                </div>
            )}

            <div>

            </div>

            <p className={`text-white ${isDescriptionValid === false ? "text-error" : ""}`}>{descriptionError}</p>
            <textarea
                ref={textareaRef}
                className={`textarea-input mb-3 ${isDescriptionValid === false && "input-error"}`}
                onInput={autoResize}
                onChange={() => { setIsDescriptionValid(null); setDescriptionError("Descripción del problema *") }}
                style={{
                    overflow: "hidden",
                    resize: "none",
                    minHeight: "80px"
                }}
            ></textarea>
            <div className="d-flex align-items-center">
                <p className={`text-white m-1 ${isLocationValid === false ? "text-error" : ""}`}>{locationError}</p>

                <img
                    src="/Info.svg"
                    style={{ width: "1rem", cursor: "pointer" }}
                    alt="Info image"
                    onClick={() => setIsAddressModalOpen(true)}
                />
            </div>
            <input className={`text-input w-100 mb-4 ${isLocationValid === false ? "input-error" : ""}`} type="text" value={location}
                onChange={(e) => { setLocation(e.target.value); if (isLocationValid === false) { setIsLocationValid(null); setLocationError("Dirección *"); } }} />

            <p className={`text-white ${isUrgencyValid === false ? "text-error" : ""}`}>{urgencyError}</p>
            <div ref={urgencyRef} className={`custom-select-container w-100 mb-4 ${isUrgencyValid === false ? "input-error" : ""}`}>
                <div className="relative w-100">
                    <div className="text-white border rounded d-flex justify-content-between align-items-center cursor-pointer" onClick={() => setIsUrgencySelectOpen(!isUrgencySelectOpen)}>
                        <span>{(UrgencyNames[urgency as UrgencyCode] ?? null) || "Seleccione nivel de urgencia"}</span>
                        <span>{isUrgencySelectOpen ? "▲" : "▼"}</span>
                    </div>

                    {isUrgencySelectOpen && (
                        <div className="position-absolute bg-grey text-white border rounded pt-1 w-100" style={{ zIndex: 20 }}>
                            {[
                                { v: UrgencyCodes.MUY, t: "Muy urgente" },
                                { v: UrgencyCodes.URG, t: "Urgente" },
                                { v: UrgencyCodes.MED, t: "Medianamente urgente" },
                                { v: UrgencyCodes.POC, t: "Poco urgente" },
                                { v: UrgencyCodes.NAD, t: "Nada urgente" },
                            ].map(o => (
                                <div key={o.v} className="p-2 hover-bg cursor-pointer" onClick={() => { setUrgency(o.v); setIsUrgencyValid(null); setUrgencyError("Nivel de urgencia *"); setIsUrgencySelectOpen(false); }}>
                                    {o.t}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            <p className={`text-white ${isEvidenceValid === false ? "text-error" : ""}`}>{evidenceError}</p>
            <div
                className={`text-center mb-4 info-report w-100 cursor-pointer ${isDragging ? "drag-active" : ""}`}
                onClick={openImageSelector}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropImage}
            >
                {evidenceImage ? (
                    <img src={evidenceImage} alt="Vista previa" className="d-block w-75 mx-auto rounded preview-image" />
                ) : (
                    <>
                        <p className="d-block text-white">Haz click o arrastra una imagen aquí</p>
                        <img src="/AddImage.svg" alt="Agregar imagen" className="report-add-image mb-2" />
                    </>
                )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef}
                onChange={handleImageSelected} style={{ display: "none" }} />

            <p className="text-white">Nombre del reportante</p>
            <input className="text-input w-100 mb-4" type="text" value={name}
                onChange={(e) => { setName(e.target.value) }} />

            <p className="text-white">Contacto del reportante</p>
            <input className="text-input w-100 mb-4" type="text" value={contact}
                onChange={(e) => { setContact(e.target.value) }} />

            {isAddressModalOpen && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000
                    }}
                >
                    <div
                        className="modal-content bg-dark text-white p-4 rounded"
                        style={{
                            width: "90%",
                            maxWidth: "450px",
                            border: "1px solid #666"
                        }}
                    >
                        <h4 className="mb-3">Ejemplos de cómo llenar la dirección</h4>

                        <p className="small mb-1">Debe tener exactamente este formato:</p>
                        <p className="text-info small mb-3">
                            <strong>calle, número, CP, municipio, Estado de México, México</strong>
                        </p>

                        <p className="mb-1">Ejemplos válidos:</p>
                        <ul className="small">
                            <li>Av. Benito Juárez, 54, 54910, Tultitlán, Estado de México, México</li>
                            <li>Calle Hidalgo, S/N, 55070, Ecatepec, Estado de México, México</li>
                            <li>Calle Reforma, N/A, 52140, Metepec, Estado de México, México</li>
                        </ul>

                        <button
                            className="btn btn-light mt-3 w-100 fw-bold"
                            onClick={() => setIsAddressModalOpen(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            <div className="publication-actions w-100 d-flex justify-content-center align-items-center">
                <div className="w-50 text-start">
                    <button className="white-button" onClick={handleValidatePublication}>Previsualizar</button>
                </div>
                <div className="w-50 text-end">
                    <button className="white-button"
                        onClick={handleCreateReport}>
                        {!isSendingForm ? "Publicar" : (<div className="d-flex justify-content-center"><span>Publicando...</span><div className="loader ms-3"></div></div>)}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateReport;
