import './index.css';
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useNavigate, useLocation } from "react-router-dom";
import ComuniRed from './ComuniRed.tsx';
import Footer from './components/Footer.tsx';
import NavBar from './components/NavBar.tsx';
import SideNav from './components/SideNav.tsx';
import UserInfo from './components/UserInfo.tsx';
import { setNavigator, PathsInitializer, paths } from "./utils/globalVariables.tsx";

function NavigatorAndPaths({ setPathsState }: { setPathsState: any }) {
  const navigate = useNavigate();
  setNavigator(navigate);

  const location = useLocation();

  useEffect(() => {
    setPathsState({ ...paths });
  }, [location]);

  return <PathsInitializer />;
}

function App() {
  const [pathsState, setPathsState] = useState(paths);

  return (
    <Router>
      <NavigatorAndPaths setPathsState={setPathsState} />
      <div className="d-md-none">
        {pathsState.hideNavBar && <NavBar />}
        <UserInfo />
        <ComuniRed />
        {pathsState.hideFooter && <Footer />}
      </div>

      <div className={`d-none ${pathsState.showLogoOnly ? "d-md-block" : "d-md-flex"}`}>
        {pathsState.showSideNav && <SideNav />}
        <div className="flex-grow-1 w-100">
          <UserInfo />
          <ComuniRed />
        </div>
      </div>
    </Router>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
