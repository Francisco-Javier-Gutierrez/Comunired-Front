import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Text, Button } from "@chakra-ui/react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, readOnly }: any) {
    useMapEvents({ click(e) { if (!readOnly) setPosition(e.latlng); } });
    return position === null ? null : <Marker position={position} />;
}

function MapUpdater({ center }: { center: L.LatLngExpression }) {
    const map = useMap();
    useEffect(() => { map.setView(center); }, [center, map]);
    return null;
}

export default function LocationPicker({ latitude, longitude, setLocation, readOnly = false }: any) {
    const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
    const [position, setPosition] = useState<L.LatLng | null>(hasCoordinates ? new L.LatLng(latitude, longitude) : null);
    const [center, setCenter] = useState<L.LatLngExpression>(hasCoordinates ? [latitude, longitude] : [19.4326, -99.1332]);
    const [loadedUserLocation, setLoadedUserLocation] = useState(false);

    useEffect(() => {
        if (position && !readOnly && setLocation) setLocation(position.lat, position.lng);
    }, [position, readOnly, setLocation]);

    useEffect(() => {
        if (!hasCoordinates && !loadedUserLocation && !readOnly && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => { setCenter([pos.coords.latitude, pos.coords.longitude]); setLoadedUserLocation(true); },
                () => setLoadedUserLocation(true),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, [hasCoordinates, loadedUserLocation, readOnly]);

    return (
        <Box w="100%" mb={3}>
            <Box h="300px" w="100%" pos="relative" zIndex={0}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '10px' }} dragging scrollWheelZoom doubleClickZoom={!readOnly} touchZoom attributionControl={false}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker position={position} setPosition={setPosition} readOnly={readOnly} />
                    <MapUpdater center={center} />
                </MapContainer>
            </Box>
            {!readOnly && <>
                <Text color="var(--text-color)" mt={2} fontSize="sm" textAlign="center" opacity={0.7}>Toca en el mapa para marcar la ubicación del suceso (Opcional)</Text>
                {position && <Button display="block" mx="auto" mt={2} size="sm" variant="outline" color="var(--text-color)" _hover={{ bg: "whiteAlpha.200" }} onClick={() => { setPosition(null); setLocation(null, null); }} borderRadius="1rem">Borrar ubicación</Button>}
            </>}
        </Box>
    );
}
