import { useEffect, useMemo, useState } from 'react';
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

const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 };

const Fitter = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [map, points]);
  return null;
};

const studentName = (s) => {
  if (!s) return 'Student';
  return `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email;
};

const DriverMap = ({ assignments = [] }) => {
  const [tilesError, setTilesError] = useState(false);

  const { routes, buses, pickups, points } = useMemo(() => {
    const routeMap = new Map();
    const busSet = new Map();
    const pickups = [];
    const pts = [];
    assignments.forEach((a) => {
      const bus = a.bus;
      if (bus) {
        busSet.set(bus.id, bus);
        if (bus.current_latitude && bus.current_longitude) {
          pts.push({ lat: bus.current_latitude, lng: bus.current_longitude, kind: 'bus' });
        }
        if (bus.route && Array.isArray(bus.route.stops)) {
          if (!routeMap.has(bus.route.id)) {
            const stops = bus.route.stops
              .filter((s) => s.is_active !== false)
              .sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
            routeMap.set(bus.route.id, { name: bus.route.name, stops });
            stops.forEach((s) => pts.push({ lat: s.latitude, lng: s.longitude, kind: 'stop' }));
          }
        }
      }
      if (a.pickup_latitude && a.pickup_longitude) {
        pickups.push({
          lat: a.pickup_latitude,
          lng: a.pickup_longitude,
          student: a.student,
          bus,
          id: a.id,
        });
        pts.push({ lat: a.pickup_latitude, lng: a.pickup_longitude, kind: 'pickup' });
      }
    });
    return { routes: [...routeMap.values()], buses: [...busSet.values()], pickups, points: pts };
  }, [assignments]);

  if (!assignments.length) {
    return (
      <div className="h-72 w-full rounded-2xl shadow bg-gray-50 flex items-center justify-center text-gray-500 text-center">
        <div>
          <span className="text-2xl mb-2 block">ℹ️</span>
          No student assignments for your bus yet.
        </div>
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full rounded-2xl shadow overflow-hidden">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={14}
        className="h-full w-full"
      >
        <Fitter points={points} />
        {!tilesError ? (
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            onError={() => setTilesError(true)}
          />
        ) : (
          <TileLayer
            attribution="Base map"
            url="https://{s}.basemaps.cartocdn.com/rivers/gray/{z}/{x}/{y}{r}.png"
          />
        )}

        {routes.map((r, i) =>
          r.stops.length >= 2 ? (
            <Polyline
              key={`route-${i}`}
              positions={r.stops.map((s) => [s.latitude, s.longitude])}
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
              key={`stop-${i}-${s.id}`}
              center={[s.latitude, s.longitude]}
              radius={5}
              fillColor="#2563eb"
              color="#2563eb"
              weight={1}
              fillOpacity={0.85}
            >
              <Popup>
                <div className="text-xs text-brand-navy">
                  <div className="font-bold">🚏 {s.name}</div>
                </div>
              </Popup>
            </CircleMarker>
          )),
        )}

        {buses.map((bus) =>
          bus.current_latitude && bus.current_longitude ? (
            <CircleMarker
              key={`bus-${bus.id}`}
              center={[bus.current_latitude, bus.current_longitude]}
              radius={9}
              fillColor={bus.is_active ? '#10b984' : '#9ca3af'}
              color={bus.is_active ? '#065f46' : '#4b5563'}
              weight={2}
              fillOpacity={0.95}
            >
              <Popup>
                <div className="text-xs text-brand-navy min-w-[150px]">
                  <div className="font-bold mb-1">🚌 {bus.plate_number}
                    {bus.model && ` · ${bus.model}`}
                  </div>
                  <div className="text-gray-500">
                    Driver: {bus.driver ? studentName(bus.driver) : 'Unassigned'}
                  </div>
                  <div className="text-gray-400">
                    Last update: {bus.last_location_update ? new Date(bus.last_location_update).toLocaleTimeString() : '—'}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ) : null,
        )}

        {pickups.map((p) => (
          <CircleMarker
            key={`pickup-${p.id}`}
            center={[p.lat, p.lng]}
            radius={8}
            fillColor="#f59e0b"
            color="#92400e"
            weight={2}
            fillOpacity={0.95}
          >
            <Popup>
              <div className="text-xs text-brand-navy min-w-[160px]">
                <div className="font-bold mb-1">👤 {studentName(p.student)}</div>
                {p.student?.email && <div className="text-gray-500">{p.student.email}</div>}
                {p.bus?.plate_number && (
                  <div className="text-gray-400">Bus: {p.bus.plate_number}</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DriverMap;
