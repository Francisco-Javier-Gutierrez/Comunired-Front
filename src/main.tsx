import './index.css';
import './AwsConfig.ts';
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { PathsInitializer, paths } from "./utils/GlobalVariables.tsx";
import { useMediaQuery } from './components/hooks/UseMediaQuery.ts';
import DesktopLayout from './components/layouts/DesktopLayout.tsx';
import MobileLayout from './components/layouts/MobileLayout.tsx';

function NavigatorAndPaths({ setPathsState }: { setPathsState: any }) {
    const location = useLocation();

    useEffect(() => {
        setPathsState({ ...paths });
    }, [location]);

    return <PathsInitializer />;
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    const [pathsState, setPathsState] = useState(paths);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <Router>
            <ScrollToTop />
            <NavigatorAndPaths setPathsState={setPathsState} />

            {isDesktop ? (
                <DesktopLayout pathsState={pathsState} />
            ) : (
                <MobileLayout pathsState={pathsState} />
            )}
        </Router>
    );
}

createRoot(document.getElementById("root")!).render(
    <App />
);
