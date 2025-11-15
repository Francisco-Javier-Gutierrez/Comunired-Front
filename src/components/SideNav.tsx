import { useState } from "react";
import { paths, goTo } from "../utils/globalVariables";

function SideNav() {
  const [isSearch, setIsSearch] = useState<boolean>(false);

  return (
    <div className={`d-flex ${paths.showLogoOnly ? "flex-column" : "flex-column"} justify-content-around no-select align-items-center w-20 mx-auto py-3
     ${!paths.showLogoOnly && paths.showSideNav ? "side-nav" : ""}`}>
      {paths.showLogoOnly ? (
        <img className="logo-image-side-nav" src="Logo.png" alt="Logo" />
      ) : paths.showSideNav ? (
        <>
          <img className="side-nav-image pb-5" src="Logo.png" alt="Logo" />
          <img className="side-nav-image pt-5 cursor-pointer" src="Search.svg" alt="Search"
            onClick={() => setIsSearch((prev) => !prev)} />
          <input className={`text-input w-100 cursor-pointer ${!isSearch ? "d-none" : ""}`} type="text" />
          <img className="side-nav-image cursor-pointer" src={`${paths.currentPath === "/messages" ? "Messages_Grey.svg" : "Messages.svg"}`} alt="Messages" />
          <img className="side-nav-image cursor-pointer footer-add-publication" src="AddPublication.svg" alt="AddPublication"
            onClick={() => { goTo("/choose?origin=" + paths.currentPath) }} />
          <img className="side-nav-image cursor-pointer" src={`${paths.currentPath === "/" ? "Home_Grey.svg" : "Home.svg"}`} alt="Home"
            onClick={() => { goTo("/") }} />
          <img className="side-nav-image cursor-pointer" src={`${paths.currentPath === "/profile" ? "Profile_Grey.svg" : "Profile.svg"}`} alt="ProfileImage"
            onClick={() => { goTo("/profile") }} />
        </>
      ) : null}
    </div>
  );
}

export default SideNav;
