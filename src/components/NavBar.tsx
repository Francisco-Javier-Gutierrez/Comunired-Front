import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "../utils/GlobalVariables";
import { Flex, Image } from "@chakra-ui/react";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    if (!paths.showLogoOnly && !paths.showNavBar) {
        return null;
    }

    return (
        <Flex
            as="nav"
            justify="space-around"
            align="center"
            py={3}
            bg="#000000"
            zIndex={10}
            position="sticky"
            top={0}
            borderBottom={paths.showLogoOnly ? "none" : "1px solid white"}
            className="no-select"
        >
            {paths.showLogoOnly ? (
                <Image src="Logo.png" mx="auto" alt="Logo"
                    boxSize="16%" maxW="150px" />
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
                    <Image src="Logo.png" alt="Logo" boxSize="8%" maxW="5rem" />
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
