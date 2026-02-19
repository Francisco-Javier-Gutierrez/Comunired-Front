import { Flex, Box } from "@chakra-ui/react";
import ComuniRed from "../../ComuniRed";
import Footer from "../Footer";
import NavBar from "../NavBar";

export default function MobileLayout({ pathsState }: any) {
  return (
    <Flex direction="column" minH="100dvh">
      {pathsState.showNavBar && <NavBar />}
      <Box flexGrow={1}>
        <ComuniRed />
      </Box>
      {pathsState.showFooter && <Footer />}
    </Flex>
  );
}
