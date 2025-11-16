import { goTo } from "../utils/globalVariables";

function ChooseType() {
    const params = new URLSearchParams(window.location.search);
    const origin = params.get("origin");

    const handleNavigate = (): string => {
        return origin?.trim() ? origin : "/home";
    };

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
                <button className="white-button w-40"
                onClick={() => goTo("/create-report")}>
                    <h3>Realizar y publicar un reporte</h3>
                </button>
            </div>
        </>
    );
}

export default ChooseType;
