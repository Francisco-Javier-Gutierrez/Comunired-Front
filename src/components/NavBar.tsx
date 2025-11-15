import { useState } from "react";
import { paths, goTo } from "../utils/globalVariables";
function NavBar() {
    const [isSearch, setIsSearch] = useState<boolean>(false);

    return (
        <>
            {paths.showLogoOnly ? (
                <div className="d-flex justify-content-around no-select align-items-center py-3 nav-bar">
                    <img className="logo-image-nav" src="Logo.png" alt="Logo" />
                </div>
            ) : paths.hideNavBar ? (
                <div className="d-flex justify-content-around no-select align-items-center py-3 nav-bar">
                    <img className="nav-bar-image cursor-pointer" src="Search.svg" alt="Search" onClick={() => setIsSearch(prev => !prev)} />
                    <img className={`nav-bar-image ${isSearch ? "d-none" : ""}`} src="Logo.png" alt="Logo" />
                    <img className={`nav-bar-image cursor-pointer ${isSearch ? "d-none" : ""}`} src="Profile.svg" alt="ProfileImage"
                        onClick={() => { goTo("/profile") }} />
                    <input className={`text-input w-75 ${!isSearch ? "d-none" : ""}`} type="text" />
                </div>
            ) : null}
        </>
    )
}

export default NavBar
