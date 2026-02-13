import ComuniRed from "../../ComuniRed";
import SideNav from "../SideNav";

export default function DesktopLayout({ pathsState }: any) {
    if (pathsState.showLogoOnly) {
        return <DesktopLogoOnlyLayout pathsState={pathsState} />;
    }

    return <DesktopFullLayout pathsState={pathsState} />;
}

function DesktopFullLayout({ pathsState }: any) {
    return (
        <div className="d-flex min-vh-100">
            {pathsState.showSideNav && <SideNav />}

            <div className="flex-grow-1 w-100">
                <ComuniRed />
            </div>
        </div>
    );
}


function DesktopLogoOnlyLayout({ pathsState }: any) {
    return (
        <div className="d-flex flex-column min-vh-100">
            {pathsState.showSideNav && <SideNav />}

            <div className="flex-grow-1">
                <ComuniRed />
            </div>
        </div>
    );
}

