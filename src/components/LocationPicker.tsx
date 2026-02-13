import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, readOnly }: any) {
    useMapEvents({
        click(e) {
            if (!readOnly) {
                setPosition(e.latlng);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

function MapUpdater({ center }: { center: L.LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center]);
    return null;
}

export default function LocationPicker({ latitude, longitude, setLocation, readOnly = false }: any) {
    const [position, setPosition] = useState<L.LatLng | null>(
        latitude && longitude ? new L.LatLng(latitude, longitude) : null
    );

    const [center, setCenter] = useState<L.LatLngExpression>(
        latitude && longitude ? [latitude, longitude] : [19.4326, -99.1332]
    );
    const [loadedUserLocation, setLoadedUserLocation] = useState(false);

    useEffect(() => {
        if (position && !readOnly && setLocation) {
            setLocation(position.lat, position.lng);
        }
    }, [position]);

    useEffect(() => {
        if (!latitude && !longitude && !loadedUserLocation && !readOnly) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setCenter([pos.coords.latitude, pos.coords.longitude]);
                        setLoadedUserLocation(true);
                    },
                    () => {
                        setLoadedUserLocation(true);
                    }
                );
            }
        }
    }, []);

    return (
        <div className="w-100 mb-3">
            <div style={{ height: '300px', width: '100%', position: 'relative', zIndex: 0 }}>
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%', borderRadius: '10px' }}
                    dragging={true}
                    scrollWheelZoom={true}
                    doubleClickZoom={!readOnly}
                    touchZoom={true}
                    attributionControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} readOnly={readOnly} />
                    <MapUpdater center={center} />
                </MapContainer>
            </div>
            {!readOnly && (
                <>
                    <p className="text-white mt-2 small text-center" style={{ opacity: 0.7 }}>
                        Toca en el mapa para marcar la ubicación del suceso (Opcional)
                    </p>
                    {position && (
                        <button
                            className="d-block mx-auto mt-2 btn btn-sm btn-outline-light"
                            onClick={() => { setPosition(null); setLocation(null, null); }}
                        >
                            Borrar ubicación
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
