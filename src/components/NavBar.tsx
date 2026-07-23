import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "../utils/GlobalVariables";
import { Flex, Image, Box } from "@chakra-ui/react";
import ThemeToggle from "./ThemeToggle";

type NavBarProps = {
    logoOnly?: boolean;
    showNavBar?: boolean;
};

function NavBar({ logoOnly = paths.showLogoOnly, showNavBar = paths.showNavBar }: NavBarProps = {}) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    if (!logoOnly && !showNavBar) {
        return null;
    }

    return (
        <Flex
            as="nav"
            justify="space-around"
            align="center"
            py={3}
            bg="var(--bg-color)"
            zIndex={10}
            position="sticky"
            top={0}
            borderBottom={logoOnly ? "none" : "1px solid var(--border-color)"}
            className="no-select"
            transition="background-color 0.3s ease, border-bottom-color 0.3s ease"
        >
            {logoOnly ? (
                <Box position="relative" w="100%" display="flex" justifyContent="center" alignItems="center">
                    <Image src="Logo.svg" alt="Logo" w={{ base: "5.5rem", md: "7rem" }} h="auto" className="no-filter" />
                    <Box position="absolute" right="5" top="50%" transform="translateY(-50%)">
                        <ThemeToggle />
                    </Box>
                </Box>
            ) : (
                <>
                    <Image
                        src={currentPath === "/search" ? "Search_Active.svg" : "Search.svg"}
                        alt="Search"
                        cursor="pointer"
                        boxSize="8%"
                        maxW="3.5rem"
                        onClick={() => navigate("/search")}
                    />
                    <Box display="flex" alignItems="center" gap={3}>
                        <Image src="Logo.svg" alt="Logo" boxSize="5rem" maxW="5rem" className="no-filter" />
                        <ThemeToggle />
                    </Box>
                    <Image
                        src={currentPath === "/my-profile" ? "Profile_Active.svg" : "Profile.svg"}
                        alt="Profile"
                        cursor="pointer"
                        boxSize="8%"
                        maxW="3.5rem"
                        onClick={() => navigate("/my-profile")}
                    />
                </>
            )}
        </Flex>
    );
}

export default NavBar;
