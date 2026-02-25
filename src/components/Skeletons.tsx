import { Box, Flex, Skeleton, SkeletonCircle, SkeletonText, VStack, Heading } from "@chakra-ui/react";

export function SkeletonPublicationCard() {
    return (
        <Box my={3} w="100%">
            <Flex alignItems="flex-start">
                <Box>
                    <SkeletonCircle size="1.5rem" mr={3} />
                </Box>
                <Box flex="1">
                    <Flex justify="space-between" mb={3}>
                        <Skeleton height="16px" width="120px" />
                        <Skeleton height="14px" width="60px" />
                    </Flex>

                    <SkeletonText mt="2" noOfLines={3} gap="3" mb={4} />

                    <Skeleton height="200px" width={["100%", "50%"]} mx="auto" borderRadius="md" mb={3} />

                    <Flex justify="space-between" mt={2}>
                        <Skeleton height="20px" width="40px" />
                        <Skeleton height="20px" width="40px" />
                        <Skeleton height="20px" width="40px" />
                    </Flex>
                </Box>
            </Flex>
            <Box as="hr" borderColor="gray.600" m={0} mt={3} />
        </Box>
    );
}

export function SkeletonFeed({ count = 3 }: { count?: number }) {
    return (
        <Box w="100%">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonPublicationCard key={i} />
            ))}
        </Box>
    );
}

export function SkeletonProfileHeader({ isMyProfile = false }: { isMyProfile?: boolean }) {
    return (
        <Flex justify="center" minH="100vh" w="100%">
            <VStack w={["90%", "75%"]} maxW="container.md" gap={4} align="stretch" mt={4}>
                <Box textAlign="center">
                    {isMyProfile ? (
                        <Heading as="h1" size="4xl" color="white" mb={4}>Tu perfil</Heading>
                    ) : (
                        <Flex justify="center" mb={4}>
                            <Skeleton height="40px" width="300px" />
                        </Flex>
                    )}

                    <SkeletonCircle size={["8rem", "9rem", "10rem", "11rem"]} mb={4} mx="auto" />
                </Box>

                <Skeleton height="16px" width="150px" />
                <Skeleton height="20px" width="200px" mb={3} />

                <Skeleton height="16px" width="150px" />
                <Skeleton height="20px" width="200px" mb={3} />

                {isMyProfile && (
                    <>
                        <Skeleton height="16px" width="250px" mt={2} />
                        <Skeleton height="20px" width="100px" mb={3} />
                        <Skeleton height="40px" width="150px" borderRadius="1rem" mb={4} />
                        <Skeleton height="16px" width="250px" mt={2} />
                        <Skeleton height="20px" width="100px" mb={3} />
                        <Skeleton height="40px" width="200px" borderRadius="1rem" mb={4} />
                    </>
                )}

                <Box as="hr" borderColor="white" my={4} />

                <Flex justify="center" mb={5}>
                    <Skeleton height="28px" width="200px" />
                </Flex>

                <SkeletonFeed count={2} />
            </VStack>
        </Flex>
    );
}

export function SkeletonNotification() {
    return (
        <Flex
            align="start"
            p={1}
            mb={3}
            w="100%"
            justify="space-between"
            bg="#333333"
            borderRadius="md"
        >
            <Flex mb={2} align="center" w="100%" p={1}>
                <SkeletonCircle size="1.3rem" mr={2} />
                <Skeleton height="16px" w="70%" />
            </Flex>
            <SkeletonCircle size="1rem" m={2} />
        </Flex>
    );
}
