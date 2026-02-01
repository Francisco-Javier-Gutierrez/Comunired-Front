import { useLocation } from "react-router-dom";
import { paths, goTo } from "../utils/globalVariables";

function SideNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`d-flex ${paths.showLogoOnly ? "flex-column" : "flex-column"} justify-content-around no-select align-items-center w-20 py-3
     ${!paths.showLogoOnly && paths.showSideNav ? "side-nav" : "mx-auto"}`}>

      {paths.showLogoOnly ? (
        <img className="logo-image-side-nav" src="Logo.png" alt="Logo" />
      ) : paths.showSideNav ? (
        <>

          <div className="tooltip-wrapper" data-tooltip="Logo">
            <img 
              className="side-nav-image pb-5" 
              src="Logo.png"
              alt="Logo"
            />
          </div>

          <div className="tooltip-wrapper" data-tooltip="Buscar">
            <img 
              className="side-nav-image pt-5 cursor-pointer" 
              src="Search.svg"
              alt="Search"
              onClick={() => goTo("/search")}
            />
          </div>

          <div className="tooltip-wrapper" data-tooltip="Notificaciones">
            <img 
              className="side-nav-image cursor-pointer" 
              src={`${currentPath === "/notifications" ? "Messages_Grey.svg" : "Messages.svg"}`}
              alt="Messages"
              onClick={() => goTo("/notifications")}
            />
          </div>

          <div className="tooltip-wrapper" data-tooltip="Crear publicación">
            <img 
              className="side-nav-image cursor-pointer footer-add-publication"
              src="AddPublication.svg"
              alt="AddPublication"
              onClick={() => goTo("/create-publication")}
            />
          </div>

          <div className="tooltip-wrapper" data-tooltip="Inicio">
            <img 
              className="side-nav-image cursor-pointer"
              src={`${currentPath === "/" ? "Home_Grey.svg" : "Home.svg"}`}
              alt="Home"
              onClick={() => goTo("/")}
            />
          </div>

          <div className="tooltip-wrapper" data-tooltip="Perfil">
            <img 
              className="side-nav-image cursor-pointer"
              src={`${currentPath === "/my-profile" ? "Profile_Grey.svg" : "Profile.svg"}`}
              alt="ProfileImage"
              onClick={() => goTo("/my-profile")}
            />
          </div>

        </>
      ) : null}
    </div>
  );
}

export default SideNav;
