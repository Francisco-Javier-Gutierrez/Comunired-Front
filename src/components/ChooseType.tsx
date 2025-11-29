import { goTo, BackendApi, searchParams } from "../utils/globalVariables";
import axios from "axios";
import { useEffect } from "react";

function ChooseType() {
    const origin = searchParams.get("origin");

    const handleNavigate = (): string => {
        return origin?.trim() ? origin : "/home";
    };

    useEffect(() => {
        axios
            .post(BackendApi.auth_me_url, {}, { withCredentials: true })
            .catch(() => {
                goTo("/login");
            });
    }, []);

    return (
        <>
            <img className="footer-image d-md-none my-4 cursor-pointer" src="Back.svg" alt="Regresar"
                onClick={() => goTo(handleNavigate())} />

            <h3 className="text-white my-4">Seleccione el tipo de acción</h3>
            <div className="w-100 d-flex justify-content-around align-items-center">
                <button className="white-button w-40"
                    onClick={() => goTo("/create-publication")}>
                    <h3>Publicar una opinión o idea</h3>
                </button>
                <button className="white-button w-40">
                    <h3>Realizar y publicar un reporte</h3>
                </button>
            </div>
        </>
    );
}

export default ChooseType;
