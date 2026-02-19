import { useNavigate } from "react-router-dom";
import { paths } from "../utils/GlobalVariables";
import { Flex, Image } from "@chakra-ui/react";

function NavBar() {
    const navigate = useNavigate();

    if (!paths.showLogoOnly && !paths.showNavBar) {
        return null;
    }

    return (
        <Flex
            as="nav"
            justify="space-around"
            align="center"
            py={3}
            bg="black"
            zIndex={10}
            position="sticky"
            top={0}
            borderBottom={paths.showLogoOnly ? "none" : "1px solid white"}
            className="no-select"
        >
            {paths.showLogoOnly ? (
                <Image src="logo.svg" mx="auto" alt="Logo"
                    boxSize="25%" />
            ) : (
                <>
                    <Image
                        src="Search.svg"
                        alt="Search"
                        cursor="pointer"
                        boxSize="10%"
                        onClick={() => navigate("/search")}
                    />
                    <Image src="logo.svg" alt="Logo" boxSize="10%" />
                    <Image
                        src="Profile.svg"
                        alt="Profile"
                        cursor="pointer"
                        boxSize="10%"
                        onClick={() => navigate("/my-profile")}
                    />
                </>
            )}
        </Flex>
    );
}

export default NavBar;
