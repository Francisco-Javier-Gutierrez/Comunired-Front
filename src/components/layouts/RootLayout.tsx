import { Box, Flex } from "@chakra-ui/react";
import ComuniRed from "../../ComuniRed";
import SideNav from "../SideNav";
import Footer from "../Footer";
import NavBar from "../NavBar";

export default function RootLayout({ isDesktop, pathsState }: any) {
  const shouldShowTopNav = pathsState.showNavBar && (!isDesktop || pathsState.showLogoOnly);
  const shouldShowSideNav = isDesktop && pathsState.showSideNav && !pathsState.showLogoOnly;

  return (
    <Flex direction="column" minH="100dvh">
      {shouldShowTopNav && <NavBar logoOnly={pathsState.showLogoOnly} showNavBar={pathsState.showNavBar} />}

      <Flex flexGrow={1} minH="0">
        {shouldShowSideNav && <SideNav />}

        <Box flexGrow={1} w="100%" overflowY="auto">
          <ComuniRed />
        </Box>
      </Flex>

      {/* Mobile-only Footer */}
      {!isDesktop && pathsState.showFooter && <Footer />}
    </Flex>
  );
}
