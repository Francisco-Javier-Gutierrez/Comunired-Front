import { create } from "zustand";

export interface ReportData {
  Servicio_reporte: string | null;
  Descripcion_problema: string | null;
  Direccion: string | null;
  Nivel_urgencia: string | null;
  Foto_evidencia: string | null;
  Nombre_reportante: string | null;
  Correo_problema: string | null;
  Tipo_senal: string | null;
  Contacto_reportante: string | null;
}

export interface ReportStore extends ReportData {
  setServicio: (val: string | null) => void;
  setDescripcion: (val: string | null) => void;
  setDireccion: (val: string | null) => void;
  setUrgencia: (val: string | null) => void;
  setFoto: (val: string | null) => void;
  setNombre: (val: string | null) => void;
  setContacto: (val: string | null) => void;
  setCorreoProblema: (val: string | null) => void;
  setSenal: (val: string | null) => void;
  resetReport: () => void;
}

export const useReportData = create<ReportStore>()((set) => ({
  Servicio_reporte: null,
  Descripcion_problema: null,
  Direccion: null,
  Nivel_urgencia: null,
  Foto_evidencia: null,
  Correo_problema: null,
  Tipo_senal: null,
  Nombre_reportante: null,
  Contacto_reportante: null,

  setServicio: (Servicio_reporte) => set({ Servicio_reporte }),
  setDescripcion: (Descripcion_problema) => set({ Descripcion_problema }),
  setDireccion: (Direccion) => set({ Direccion }),
  setUrgencia: (Nivel_urgencia) => set({ Nivel_urgencia }),
  setFoto: (Foto_evidencia) => set({ Foto_evidencia }),
  setNombre: (Nombre_reportante) => set({ Nombre_reportante }),
  setContacto: (Contacto_reportante) => set({ Contacto_reportante }),

  setCorreoProblema: (Correo_problema) => set({ Correo_problema }),
  setSenal: (Tipo_senal) => set({ Tipo_senal }),

  resetReport: () =>
    set({
      Servicio_reporte: null,
      Descripcion_problema: null,
      Direccion: null,
      Nivel_urgencia: null,
      Foto_evidencia: null,
      Correo_problema: null,
      Tipo_senal: null,
      Nombre_reportante: null,
      Contacto_reportante: null,
    }),
}));
