import { useState } from "react";

function SideNav() {
  const currentPath = window.location.pathname;
  const showSideNav = !["/report", "/publication"].includes(currentPath);
  const showLogoOnly = ["/login", "/signUp"].includes(currentPath);
  const [isSearch, setIsSearch] = useState<boolean>(false);

  return (
    <div className={`d-flex ${showLogoOnly ? "flex-column" : "flex-column"} justify-content-around align-items-center w-20 mx-auto py-3
     ${!showLogoOnly && showSideNav ? "side-nav" : ""}`}>
      {showLogoOnly ? (
        <img className="logo-image-side-nav" src="Logo.png" alt="Logo" />
      ) : showSideNav ? (
        <>
          <img className="side-nav-image pb-5" src="Logo.png" alt="Logo" />
          <img className="side-nav-image pt-5 cursor-pointer" src="Search.svg" alt="Search"
            onClick={() => setIsSearch((prev) => !prev)} />
          <input className={`text-input w-100 cursor-pointer ${!isSearch ? "d-none" : ""}`} type="text" />
          <img className="side-nav-image cursor-pointer" src={`${currentPath === "/messages" ? "Messages_Grey.svg" : "Messages.svg"}`} alt="Messages" />
          <img className="side-nav-image cursor-pointer footer-add-publication" src="AddPublication.svg" alt="AddPublication"
            onClick={() => { window.location.href = "/choose?origin=" + currentPath; }} />
          <img className="side-nav-image cursor-pointer" src={`${currentPath === "/" ? "Home_Grey.svg" : "Home.svg"}`} alt="Home"
            onClick={() => { window.location.href = "/"; }} />
          <img className="side-nav-image cursor-pointer" src={`${currentPath === "/profile" ? "Profile_Grey.svg" : "Profile.svg"}`} alt="ProfileImage"
            onClick={() => { window.location.href = "/profile"; }} />
        </>
      ) : null}
    </div>
  );
}

export default SideNav;
