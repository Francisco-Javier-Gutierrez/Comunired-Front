import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "../utils/GlobalVariables";

function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        paths.showFooter && (
            <div className="d-flex justify-content-around footer no-select align-items-center py-3">
                <img className={`footer-image cursor-pointer ${currentPath === "/" ? "footer-selected" : ""}`} src="Home.svg" alt="Home"
                    onClick={() => { navigate("/"); }} />
                <img className="footer-image cursor-pointer footer-add-publication" src="AddPublication.svg" alt="AddPublication"
                    onClick={() => { navigate("/create-publication") }} />
                <img className={`footer-image cursor-pointer ${currentPath === "/notifications" ? "footer-selected" : ""}`} src="Messages.svg" alt="Messages"
                    onClick={() => { navigate("/notifications") }} />
            </div>
        )
    );
}
export default Footer;
