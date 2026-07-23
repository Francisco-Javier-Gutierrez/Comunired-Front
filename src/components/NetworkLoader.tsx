import { useEffect, useState } from 'react';
import { Flex, Box, Text, Heading } from '@chakra-ui/react';

export default function NetworkLoader() {
    const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

    useEffect(() => {
        let wasOffline = !navigator.onLine;
        const handleOffline = () => {
            wasOffline = true;
            setIsOffline(true);
        };
        const handleOnline = () => {
            setIsOffline(false);
            if (wasOffline) window.location.reload();
            wasOffline = false;
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <Flex position="fixed" inset="0" zIndex="999999" direction="column" justify="center" align="center" bg="rgba(0, 0, 0, 0.9)" backdropFilter="blur(10px)" color="var(--text-color)" fontFamily='"Outfit", "Inter", sans-serif'>
            <style>{`@keyframes spinOffline { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes pulseOfflineText { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            <Flex direction="column" align="center">
                <Box w="60px" h="60px" border="4px solid rgba(255, 255, 255, 0.1)" borderTop="4px solid white" borderRadius="full" animation="spinOffline 1s linear infinite" mb={6} />
                <Heading fontSize="3xl" fontWeight="700" mb={3} letterSpacing="tight">Sin conexión</Heading>
                <Text fontSize="md" color="gray.400" animation="pulseOfflineText 2.5s ease-in-out infinite" textAlign="center" maxW="320px" lineHeight="1.6">
                    Verifica tu conexión a Wi-Fi o datos móviles. La aplicación se reanudará automáticamente cuando vuelvas a estar en línea.
                </Text>
            </Flex>
        </Flex>
    );
}
