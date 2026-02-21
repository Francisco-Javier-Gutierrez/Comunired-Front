import { useEffect, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

const OpenDefaultSettings = registerPlugin('OpenDefaultSettings');

export default function AppLinkPrompt() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
            const seen = localStorage.getItem('applink_prompt_seen');
            if (!seen) {
                const timer = setTimeout(() => setShow(true), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleOpen = async () => {
        try {
            await (OpenDefaultSettings as any).openAppLinkSettings();
        } catch (e) {
            console.error(e);
        }
        localStorage.setItem('applink_prompt_seen', 'true');
        setShow(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('applink_prompt_seen', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <Flex
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.85)"
            align="center"
            justify="center"
            zIndex={99999}
            p={5}
        >
            <Box
                bg="linear-gradient(145deg, #1a1a1a, #111)"
                borderRadius="20px"
                p="28px 24px"
                maxW="340px"
                w="100%"
                border="1px solid #333"
                boxShadow="0 20px 60px rgba(0,0,0,0.6)"
                textAlign="center"
            >
                <Text fontSize="48px" mb={4}>🔗</Text>

                <Text color="white" fontSize="18px" fontWeight="700" mb={2}>
                    Abrir links automáticamente
                </Text>

                <Text color="#aaa" fontSize="14px" lineHeight="1.5" mb={3}>
                    Permite que los links de <strong>Comunired</strong> abran
                    directamente en la app en vez del navegador.
                </Text>

                <Box
                    bg="#0d0d0d"
                    borderRadius="12px"
                    p="14px 16px"
                    mb={6}
                    textAlign="left"
                    border="1px solid #222"
                >
                    <Text color="#888" fontSize="12px" mb={2} fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
                        Al presionar "Activar":
                    </Text>
                    <Text color="#ccc" fontSize="13px" mb={1} lineHeight="1.4">
                        1. Toca <strong>Agregar vínculo</strong>
                    </Text>
                    <Text color="#ccc" fontSize="13px" lineHeight="1.4">
                        2. Activa <strong>comuni-red.com</strong>
                    </Text>
                </Box>

                <Button
                    w="100%"
                    py={3}
                    bg="white"
                    color="black"
                    borderRadius="12px"
                    fontSize="15px"
                    fontWeight="700"
                    mb={2}
                    onClick={handleOpen}
                    _hover={{ opacity: 0.9 }}
                >
                    Activar ahora
                </Button>

                <Button
                    w="100%"
                    py={3}
                    bg="transparent"
                    color="#666"
                    borderRadius="12px"
                    fontSize="14px"
                    onClick={handleDismiss}
                    _hover={{ color: '#999' }}
                >
                    Ahora no
                </Button>
            </Box>
        </Flex>
    );
}
