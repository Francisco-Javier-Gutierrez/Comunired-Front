import { useState } from "react";

function SideNav() {
  const showNavBar = !["/login", "/signUp"].includes(location.pathname);
  const currentPath = window.location.pathname;
  const [isSearch, setIsSearch] = useState<boolean>(false);

  return (
    <div
      className={`d-flex ${
        showNavBar ? "flex-column" : "flex-row"
      } justify-content-around align-items-center w-20 mx-auto py-3 side-nav`}
    >
      {showNavBar ? (
        <>
          <img
            className={`side-nav-image`}
            src="Logo.png"
            alt="Logo"
          />
          <img
            className="side-nav-image"
            src="Search.svg"
            alt="Search"
            onClick={() => setIsSearch((prev) => !prev)}
          />
          <input
            className={`text-input w-100 ${!isSearch ? "d-none" : ""}`}
            type="text"
          />
          <img
            className={`side-nav-image`}
            src="User.svg"
            alt="User"
          />
          <img
            className="side-nav-image footer-add-publication"
            src="AddPublication.svg"
            alt="AddPublication"
          />
          <img
            className={`side-nav-image ${
              currentPath === "/" ? "footer-selected p-1" : ""
            }`}
            src="Home.svg"
            alt="Home"
          />
          <img
            className={`side-nav-image ${
              currentPath === "/add" ? "footer-selected p-1" : ""
            }`}
            src="Messages.svg"
            alt="Messages"
          />
        </>
      ) : (
        <>
          <img
            className="logo-image-side-nav mb-5"
            src="Logo.png"
            alt="Logo"
          />
        </>
      )}
    </div>
  );
}

export default SideNav;
