import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { IonApp, setupIonicReact } from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './index.css';
import './awsConfig.ts';
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { PathsInitializer, paths } from "./utils/GlobalVariables.tsx";

import MobileLayout from './components/layouts/MobileLayout.tsx';
import { StrictMode } from 'react';

setupIonicReact();

const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                brand: {
                    100: { value: '#f7fafc' },
                    900: { value: '#171923' },
                },
            },
        },
    },
    globalCss: {
        body: {
            bg: '#000000',
            color: 'white',
        },
    },
});

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

    return (
        <IonApp>
            <Router>
                <ScrollToTop />
                <NavigatorAndPaths setPathsState={setPathsState} />
                <MobileLayout pathsState={pathsState} />
            </Router>
        </IonApp>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ChakraProvider value={system}>
            <App />
        </ChakraProvider>
    </StrictMode>
);
