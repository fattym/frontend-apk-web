import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };

const pickupIcon = L.divIcon({
  html:
    '<div class="w-4 h-4 rounded-full shadow-lg" style="background:#f59e0b;border:2px solid #ffffff;"></div>',
  className: 'pickup-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onSelect({ lat, lng });
    },
  });
  return null;
};

const PickupPicker = ({ value, onChange, height = 'h-56' }) => {
  const mapRef = useRef(null);
  const center = value || DEFAULT_CENTER;

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      const t = setTimeout(() => map.invalidateSize(), 200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSelect = (point) => {
    if (onChange) onChange({ lat: point.lat, lng: point.lng });
  };

  return (
    <div className={`relative w-full rounded-xl shadow-inner overflow-hidden ${height}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={handleSelect} />
        <Marker position={[center.lat, center.lng]} icon={pickupIcon} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 z-10 bg-white/95 text-[10px] text-gray-600 px-2 py-1 rounded shadow">
        Tap the map to set the pickup point
      </div>
    </div>
  );
};

export default PickupPicker;
