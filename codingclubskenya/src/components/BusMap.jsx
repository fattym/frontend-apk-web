import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const formatTime = (iso) => (iso ? new Date(iso).toLocaleTimeString() : '—');

const NZ_BOUNDS = { lat: -36.8485, lng: 174.7635 };

const MapFitter = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView([NZ_BOUNDS.lat, NZ_BOUNDS.lng], 11);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [map, points]);
  return null;
};

const BusPopup = ({ bus }) => {
  const driverName = bus.driver
    ? `${bus.driver.first_name || ''} ${bus.driver.last_name || ''}`.trim() ||
      bus.driver.email
    : null;
  return (
    <div className="text-xs text-brand-navy min-w-[180px]">
      <div className="font-bold mb-1">
        🚌 {bus.plate_number}
        {bus.model && ` · ${bus.model}`}
      </div>
      {driverName ? (
        <div className="mb-1">
          <span className="text-gray-500">Driver: </span>
          <span className="font-medium">{driverName}</span>
          {bus.driver?.email && (
            <span className="text-gray-400 block">{bus.driver.email}</span>
          )}
        </div>
      ) : (
        <div className="mb-1 text-gray-400">Driver: Unassigned</div>
      )}
      {bus.route ? (
        <div>
          <span className="text-gray-500">Route: </span>
          <span className="font-medium">{bus.route.name}</span>
        </div>
      ) : null}
      <div className="mt-1 text-gray-400">
        Last update: {formatTime(bus.last_location_update)}
      </div>
    </div>
  );
};

const StopPopup = ({ stop }) => (
  <div className="text-xs text-brand-navy min-w-[140px]">
    <div className="font-bold mb-1">🚏 {stop.name}</div>
    <div className="text-gray-500">
      {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
    </div>
  </div>
);

const BusMap = ({ buses = [] }) => {
  const { points, routes } = useMemo(() => {
    const pts = [];
    const rte = [];
    buses.forEach((bus) => {
      if (bus.current_latitude && bus.current_longitude) {
        pts.push({ lat: bus.current_latitude, lng: bus.current_longitude, type: 'bus' });
      }
      if (bus.route && Array.isArray(bus.route.stops)) {
        const stops = bus.route.stops
          .filter((s) => s.is_active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        stops.forEach((s) => pts.push({ lat: s.latitude, lng: s.longitude, type: 'stop' }));
        rte.push({ name: bus.route.name, coords: stops.map((s) => [s.latitude, s.longitude]), stops });
      }
    });
    return { points: pts, routes: rte };
  }, [buses]);

  const located = buses.filter((b) => b.current_latitude && b.current_longitude);

  if (!buses.length) {
    return (
      <div className="h-72 w-full rounded-2xl shadow bg-gray-50 flex items-center justify-center text-gray-500 text-center">
        <div>
          <span className="text-2xl mb-2 block">🚌</span>
          No buses to display yet.
        </div>
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full rounded-2xl shadow overflow-hidden">
      <MapContainer
        center={[NZ_BOUNDS.lat, NZ_BOUNDS.lng]}
        zoom={11}
        className="h-full w-full"
      >
        <MapFitter points={points} />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routes.map((r, i) =>
          r.coords.length >= 2 ? (
            <Polyline
              key={`route-${i}`}
              positions={r.coords}
              color="#f59e0b"
              weight={4}
              opacity={0.7}
              dashArray="6,6"
            />
          ) : null,
        )}
        {routes.map((r, i) =>
          r.stops.map((s) => (
            <CircleMarker
              key={`stop-${i}-${s.id ?? s.name}`}
              center={[s.latitude, s.longitude]}
              radius={5}
              fillColor="#2563eb"
              color="#2563eb"
              weight={1}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup><StopPopup stop={s} /></Popup>
            </CircleMarker>
          )),
        )}
        {located.map((b) => (
          <CircleMarker
            key={`bus-${b.id}`}
            center={[b.current_latitude, b.current_longitude]}
            radius={8}
            fillColor={b.is_active ? '#10b984' : '#9ca3af'}
            color={b.is_active ? '#065f46' : '#4b5563'}
            weight={2}
            opacity={1}
            fillOpacity={0.9}
          >
            <Popup><BusPopup bus={b} /></Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusMap;
