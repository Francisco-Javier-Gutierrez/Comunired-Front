export const UrgencyCodes = {
  MUY: "MUY",
  URG: "URG",
  MED: "MED",
  POC: "POC",
  NAD: "NAD"
} as const;

export type UrgencyCode = keyof typeof UrgencyCodes;

export const UrgencyNames: Record<UrgencyCode, string> = {
  MUY: "Muy urgente",
  URG: "Urgente",
  MED: "Medianamente urgente",
  POC: "Poco urgente",
  NAD: "Nada urgente"
};
