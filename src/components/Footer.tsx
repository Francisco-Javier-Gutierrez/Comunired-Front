import { paths, goTo } from "../utils/globalVariables";

function Footer() {
    return (
        paths.hideFooter && (
            <div className="d-flex justify-content-around footer no-select align-items-center py-3">
                <img className={`footer-image cursor-pointer ${paths.currentPath === "/" ? "footer-selected" : ""}`} src="Home.svg" alt="Home"
                    onClick={() => { goTo("/"); }} />
                <img className="footer-image cursor-pointer footer-add-publication" src="AddPublication.svg" alt="AddPublication"
                    onClick={() => { goTo("/choose?origin=" + paths.currentPath) }} />
                <img className={`footer-image cursor-pointer${paths.currentPath === "/add" ? "footer-selected" : ""}`} src="Messages.svg" alt="Messages" />
            </div>
        )
    );
}
export default Footer;
