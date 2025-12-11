import { goTo, BackendApi, useSearchParamsGlobal, BanMessaje } from "../utils/globalVariables";
import axios from "axios";
import { useEffect, useState } from "react";

function ChooseType() {

    const searchParams = useSearchParamsGlobal();
    const origin = searchParams.get("origin");
    const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);
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


    const handleNavigate = (): string => {
        return origin?.trim() ? origin : "/home";
    };

    if (isBannedUser) return (
        <><img className="footer-image d-md-none my-4 cursor-pointer" src="Back.svg" alt="Regresar"
            onClick={() => goTo(handleNavigate())} />

            <h1 className="text-danger text-break fw-bold mt-5 w-75 mx-auto">
                {BanMessaje}
            </h1>
        </>
    );
    
    return (
        <>
            <img className="footer-image d-md-none my-4 cursor-pointer" src="Back.svg" alt="Regresar"
                onClick={() => goTo(handleNavigate())} />

            <h3 className="text-white my-4">Seleccione el tipo de acción</h3>
            <div className="w-100 d-flex justify-content-around align-items-center">
                <button className="white-button w-40"
                    onClick={() => goTo("/create-publication")}>
                    <h3>Publicar una idea</h3>
                </button>
                <button className="white-button w-40"
                    onClick={() => goTo("/create-report")}>
                    <h3>Publicar un reporte</h3>
                </button>
            </div>
        </>
    );
}

export default ChooseType;
