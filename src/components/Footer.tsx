import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "../utils/GlobalVariables";
import { Box, Flex, Image } from "@chakra-ui/react";

function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        paths.showFooter && (
            <Box
                position="sticky"
                bottom={0}
                borderTop="0.1rem solid #787878"
                py={2}
                bg="#000000"
                textAlign="center"
                zIndex={10}
                userSelect="none"
                w="100%"
            >
                <Flex justify="space-around" align="center">
                    <Image
                        src="Home.svg"
                        alt="Home"
                        cursor="pointer"
                        boxSize="10%"
                        p="1%"
                        bg={currentPath === "/" ? "#373737" : "transparent"}
                        borderRadius="0.5rem"
                        onClick={() => navigate("/")}
                    />
                    <Image
                        src="AddPublication.svg"
                        alt="AddPublication"
                        cursor="pointer"
                        boxSize="10%"
                        p="1%"
                        bg="#7F7F7F"
                        borderRadius="0.5rem"
                        onClick={() => navigate("/create-publication")}
                    />
                    <Image
                        src="Messages.svg"
                        alt="Messages"
                        cursor="pointer"
                        boxSize="10%"
                        p="1%"
                        bg={currentPath === "/notifications" ? "#373737" : "transparent"}
                        borderRadius="0.5rem"
                        onClick={() => navigate("/notifications")}
                    />
                </Flex>
            </Box>
        )
    );
}
export default Footer;
