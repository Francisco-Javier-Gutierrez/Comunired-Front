import { paths, goTo } from "../utils/globalVariables";
import { useLocation } from "react-router-dom";

function Footer() {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        paths.hideFooter && (
            <div className="d-flex justify-content-around footer no-select align-items-center py-3">
                <img className={`footer-image cursor-pointer ${currentPath === "/" ? "footer-selected" : ""}`} src="Home.svg" alt="Home"
                    onClick={() => { goTo("/"); }} />
                <img className="footer-image cursor-pointer footer-add-publication" src="AddPublication.svg" alt="AddPublication"
                    onClick={() => { goTo("/choose?origin=" + currentPath) }} />
                <img className={`footer-image cursor-pointer ${currentPath === "/notifications" ? "footer-selected" : ""}`} src="Messages.svg" alt="Messages"
                    onClick={() => { goTo("/notifications") }} />
            </div>
        )
    );
}
export default Footer;
