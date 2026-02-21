import { useLocation, useNavigate } from "react-router-dom";
import { paths } from "../utils/GlobalVariables";
import { Flex, Image, Tooltip, Box } from "@chakra-ui/react";

const NavTooltip = ({ label, children }: { label: string, children: React.ReactNode }) => {
    return (
        <Tooltip.Root positioning={{ placement: "bottom" }} openDelay={200} closeDelay={0}>
            <Tooltip.Trigger asChild>
                {children}
            </Tooltip.Trigger>
            <Tooltip.Positioner>
                <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                </Tooltip.Arrow>
                <Tooltip.Content bg="#000000" color="white" px={2} py={1} borderRadius="md" fontSize="sm">
                    {label}
                </Tooltip.Content>
            </Tooltip.Positioner>
        </Tooltip.Root>
    );
};

function SideNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const isSideNavVisible = !paths.showLogoOnly && paths.showSideNav;

    return (
        <Flex
            direction="column"
            justify="space-around"
            align="center"
            w={paths.showLogoOnly ? "100%" : "20%"}
            py={4}
            userSelect="none"
            h={isSideNavVisible ? "100dvh" : "auto"}
            pos={isSideNavVisible ? "sticky" : "static"}
            top={0}
            mx={!isSideNavVisible ? "auto" : undefined}
        >
            {paths.showLogoOnly ? (
                <Image
                    src="Logo.png"
                    alt="Logo"
                    mx="auto"
                    w="7rem"
                />
            ) : paths.showSideNav ? (
                <>
                    <NavTooltip label="Logo">
                        <Box w="100%" display="flex" justifyContent="center">
                            <Image
                                src="Logo.png"
                                alt="Logo"
                                w="20%"
                            />
                        </Box>
                    </NavTooltip>

                    <Box pb={24}></Box>

                    <NavTooltip label="Buscar">
                        <Box w="100%" display="flex" justifyContent="center">
                            <Image
                                src="Search.svg"
                                alt="Search"
                                cursor="pointer"
                                onClick={() => navigate("/search")}
                                w="15%"
                            />
                        </Box>
                    </NavTooltip>

                    <NavTooltip label="Notificaciones">
                        <Box w="100%" display="flex" justifyContent="center">
                            <Image
                                src={`${currentPath === "/notifications" ? "Messages_Grey.svg" : "Messages.svg"}`}
                                alt="Messages"
                                cursor="pointer"
                                onClick={() => navigate("/notifications")}
                                w="15%"
                            />
                        </Box>
                    </NavTooltip>

                    <NavTooltip label="Crear publicación">
                        <Box w="100%" display="flex" justifyContent="center">
                            <Image
                                src="AddPublication.svg"
                                alt="AddPublication"
                                cursor="pointer"
                                onClick={() => navigate("/create-publication")}
                                w="15%"
                                bg="#7F7F7F"
                                borderRadius="0.5rem"
                            />
                        </Box>
                    </NavTooltip>

                    <NavTooltip label="Inicio">
                        <Box w="100%" display="flex" justifyContent="center">
                            <Image
                                src={`${currentPath === "/" ? "Home_Grey.svg" : "Home.svg"}`}
                                alt="Home"
                                cursor="pointer"
                                onClick={() => navigate("/")}
                                w="15%"
                            />
                        </Box>
                    </NavTooltip>

                    <NavTooltip label="Perfil">
                        <Box w="100%" display="flex" justifyContent="center">
                            <Image
                                src={`${currentPath === "/my-profile" ? "Profile_Grey.svg" : "Profile.svg"}`}
                                alt="ProfileImage"
                                cursor="pointer"
                                onClick={() => navigate("/my-profile")}
                                w="15%"
                            />
                        </Box>
                    </NavTooltip>

                </>
            ) : null}
        </Flex>
    );
}

export default SideNav;
