import { Flex, Heading } from "@chakra-ui/react";

function NotFound() {
    return (
        <Flex justify="center" minH="100vh" mt={5}>
            <Heading as="h1" textAlign="center" size="4xl" color="white">Error 404 página no encontrada</Heading>
        </Flex>
    );
}

export default NotFound;
