export const ServiceCodes = {
  EE: "EE",
  ST: "ST",
  IV: "IV",
  SEG: "SEG",
  SM: "SM",
  AG: "AG",
  OT: "OT"
} as const;

export type ServiceCode = keyof typeof ServiceCodes;

export const ServiceNames: Record<ServiceCode, string> = {
  EE: "Energía eléctrica",
  ST: "Señal telefónica",
  IV: "Infraestructura / vialidad",
  SEG: "Seguridad",
  SM: "Servicios municipales",
  AG: "Agua",
  OT: "Otros"
};
