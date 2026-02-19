import { Box, Flex } from "@chakra-ui/react";
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
        <Flex minH="100vh">
            {pathsState.showSideNav && <SideNav />}

            <Box flexGrow={1} w="100%">
                <ComuniRed />
            </Box>
        </Flex>
    );
}


function DesktopLogoOnlyLayout({ pathsState }: any) {
    return (
        <Flex direction="column" minH="100vh">
            {pathsState.showSideNav && <SideNav />}

            <Box flexGrow={1}>
                <ComuniRed />
            </Box>
        </Flex>
    );
}

