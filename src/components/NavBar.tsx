import { paths, goTo } from "../utils/globalVariables";

function NavBar() {
    return (
        <>
            {paths.showLogoOnly ? (
                <div className="d-flex justify-content-around no-select align-items-center py-3 nav-bar">
                    <img className="logo-image-nav" src="Logo.png" alt="Logo" />
                </div>
            ) : paths.hideNavBar ? (
                <div className="d-flex justify-content-around no-select align-items-center py-3 nav-bar-border">
                    <img className="nav-bar-image cursor-pointer" src="Search.svg" alt="Search" onClick={() => goTo("/search")} />
                    <img className={`nav-bar-image`} src="Logo.png" alt="Logo" />
                    <img className={`nav-bar-image cursor-pointer`} src="Profile.svg" alt="ProfileImage"
                        onClick={() => { goTo("/my-profile") }} />
                </div>
            ) : null}
        </>
    )
}

export default NavBar
