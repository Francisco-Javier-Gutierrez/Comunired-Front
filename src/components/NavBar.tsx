import { useState } from "react";
function NavBar() {
    const showNavBar = ![
        "/login",
        "/signUp"
    ].includes(location.pathname);
    const [isSearch, setIsSearch] = useState<boolean>(false);

    return (
        <div className="d-flex justify-content-around  align-items-center py-3 nav-bar">
            {showNavBar ? (
                <>
                    <img className="nav-bar-image" src="Search.svg" alt="Search" onClick={() => setIsSearch(prev => !prev)} />
                    <img className={`nav-bar-image ${isSearch ? "d-none" : ""}`} src="Logo.png" alt="Logo" />
                    <img className={`nav-bar-image ${isSearch ? "d-none" : ""}`} src="User.svg" alt="User" />
                    <input className={`text-input w-75 ${!isSearch ? "d-none" : ""}`} type="text" />
                </>
            ) : (
                <>
                    <img className="logo-image mb-5" src="Logo.png" alt="Logo" />
                </>
            )}
        </div>
    )
}

export default NavBar
