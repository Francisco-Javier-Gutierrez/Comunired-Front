import { useState } from "react";
function NavBar() {
    const currentPath = window.location.pathname;
    const showNavBar = !["/profile", "/report", "/publication"].includes(currentPath);
    const showLogoOnly = ["/login", "/signUp"].includes(currentPath);
    const [isSearch, setIsSearch] = useState<boolean>(false);

    return (
        <div className="d-flex justify-content-around  align-items-center py-3 nav-bar">
            {showLogoOnly ? (
                <img className="logo-image-nav" src="Logo.png" alt="Logo" />
            ) : showNavBar ? (
                <>
                    <img className="nav-bar-image cursor-pointer" src="Search.svg" alt="Search" onClick={() => setIsSearch(prev => !prev)} />
                    <img className={`nav-bar-image ${isSearch ? "d-none" : ""}`} src="Logo.png" alt="Logo" />
                    <img className={`nav-bar-image cursor-pointer ${isSearch ? "d-none" : ""}`} src="Profile.svg" alt="ProfileImage"
                        onClick={() => { window.location.href = "/profile" }} />
                    <input className={`text-input w-75 ${!isSearch ? "d-none" : ""}`} type="text" />
                </>
            ) : null}
        </div>
    )
}

export default NavBar
