export const SignalCodes = {
    ATT: "ATT",
    TELC: "TELC",
    TEL: "TEL",
    MEG: "MEG",
    MOV: "MOV",
    OTR: "OTR"
} as const;

export type SignalCode = keyof typeof SignalCodes;

export const SignalNames: Record<SignalCode, string> = {
    ATT: "AT&T",
    TELC: "Telcel",
    TEL: "Telmex",
    MEG: "Megacable",
    MOV: "Movistar",
    OTR: "Otro"
};
