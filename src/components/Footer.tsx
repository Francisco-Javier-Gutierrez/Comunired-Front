function Footer() {
    const showFooter = !["/login", "/signUp"].includes(location.pathname);
    const currentPath = window.location.pathname;

    return (
        showFooter && (
            <div className="d-flex justify-content-around footer align-items-center py-3">
                <img className={`footer-image cursor-pointer ${currentPath === "/" ? "footer-selected" : ""}`} src="Home.svg" alt="Home"
                    onClick={() => { window.location.href = "/"; }} />
                <img className="footer-image cursor-pointer footer-add-publication" src="AddPublication.svg" alt="AddPublication" />
                <img className={`footer-image cursor-pointer${currentPath === "/add" ? "footer-selected" : ""}`} src="Messages.svg" alt="Messages" />
            </div>
        )
    );
}
export default Footer;
