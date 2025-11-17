import { useRef, useState, useEffect } from "react";
import { goTo } from "../utils/globalVariables";
import { useReportData } from "../utils/ReportStore";
import { usePublicationData } from "../utils/PublicationStore";
import { ServiceCodes, ServiceNames, type ServiceCode } from "../enums/ServiceEnum";
import { UrgencyCodes, UrgencyNames, type UrgencyCode } from "../enums/UrgencyEnum";

function CreateReport() {
    const { resetPublication } = usePublicationData();
    const {
        Servicio_reporte,
        Descripcion_problema,
        Direccion,
        Nivel_urgencia,
        Foto_evidencia,
        Nombre_reportante,
        Contacto_reportante,
        setServicio,
        setDescripcion,
        setDireccion,
        setUrgencia,
        setFoto,
        setNombre,
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


    const [name, setName] = useState("");
    const [contact, setContact] = useState("");

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
    }, []);

    const goToPreview = () => {
        resetPublication();
        setServicio(service);
        setUrgencia(urgency);
        setDescripcion(textareaRef.current?.value ?? null);
        setDireccion(location);
        setFoto(evidenceImage);
        setNombre(name);
        setContacto(contact);
        goTo("/preview-report");
    };

    const openImageSelector = () => fileInputRef.current?.click();

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
        if (!location.trim()) {
            setLocationError("No ha escrito la dirección");
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

    return (
        <div className="w-75 mx-auto d-flex flex-column min-vh-100">
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
                                { v: ServiceCodes.OT, t: "Otros" },
                            ].map(o => (
                                <div key={o.v} className="p-2 hover-bg cursor-pointer" onClick={() => { setService(o.v); setIsServiceValid(null); setServiceError("Qué servicio desea reportar *"); setIsServiceSelectOpen(false); }}>
                                    {o.t}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
            <p className={`text-white ${isLocationValid === false ? "text-error" : ""}`}>{locationError}</p>
            <input className={`text-input w-100 mb-4 ${isLocationValid === false ? "input-error" : ""}`} type="email" value={location}
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
            <input className="text-input w-100 mb-4" type="email" value={name}
                onChange={(e) => { setName(e.target.value) }} />

            <p className="text-white">Contacto del reportante</p>
            <input className="text-input w-100 mb-4" type="email" value={contact}
                onChange={(e) => { setContact(e.target.value) }} />

            <div className="publication-actions nav-bar w-100 d-flex justify-content-center align-items-center">
                <div className="w-50 text-start">
                    <button className="white-button" onClick={handleValidatePublication}>Previsualizar</button>
                </div>
                <div className="w-50 text-end">
                    <button className="white-button">Publicar</button>
                </div>
            </div>
        </div>
    );
}

export default CreateReport;
