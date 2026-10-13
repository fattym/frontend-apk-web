import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useApiList from '../hooks/useApiList';
import BusMap from '../components/BusMap';
import AssignStudentForm from '../components/AssignStudentForm';
import { BusFront, UserCheck, Route, Users, MapPin, Plus } from 'lucide-react';

const driverName = (driver) => {
  if (!driver) return null;
  const name = `${driver.first_name || ''} ${driver.last_name || ''}`.trim();
  return name || driver.email;
};

const DriverCell = ({ driver }) => {
  if (!driver) {
    return <span className="text-gray-400">Unassigned</span>;
  }
  const initials = `${driver.first_name?.[0] || ''}${driver.last_name?.[0] || ''}`.toUpperCase();
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center text-xs font-bold">
        {initials || driver.email?.[0]?.toUpperCase()}
      </span>
      <div>
        <p className="font-medium text-sm text-brand-navy">{driverName(driver)}</p>
        <p className="text-[10px] text-gray-500">{driver.email}</p>
      </div>
    </div>
  );
};

const BusesTable = ({ buses, loading }) => (
  <div className="bg-white rounded-2xl shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {buses.map((bus) => (
            <tr key={bus.id} className="hover:bg-brand-grayLight/40">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-brand-navy">{bus.plate_number}</p>
                  <p className="text-xs text-gray-500">{bus.model || '—'}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <DriverCell driver={bus.driver} />
              </td>
              <td className="px-6 py-4">
                {bus.route ? (
                  <div className="flex items-center gap-1.5">
                    <Route className="h-4 w-4 text-brand-navy/50" />
                    <span className="text-sm text-brand-navy">{bus.route.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-brand-navy">
                {bus.capacity || 0}
              </td>
              <td className="px-6 py-4">
                {bus.last_location_update ? (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-500">
                      {new Date(bus.last_location_update).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No location data</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    bus.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {bus.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {buses.length === 0 && !loading && (
      <div className="px-6 py-8 text-center text-gray-500">
        No buses found for your school.
      </div>
    )}
  </div>
);

const AssignmentsTable = ({ assignments, loading }) => (
  <div className="bg-white rounded-2xl shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assignments.map((a) => (
            <tr key={a.id} className="hover:bg-brand-grayLight/40">
              <td className="px-6 py-4">
                <p className="font-medium text-brand-navy">
                  {driverName(a.student) || `Student #${a.student?.id}`}
                </p>
                <p className="text-xs text-gray-500">{a.student?.email}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <BusFront className="h-4 w-4 text-brand-navy/50" />
                  <span className="text-sm text-brand-navy">
                    {a.bus?.plate_number || '—'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <DriverCell driver={a.bus?.driver} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {a.start_date ? new Date(a.start_date).toLocaleDateString() : '—'}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    a.is_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {a.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {assignments.length === 0 && !loading && (
      <div className="px-6 py-8 text-center text-gray-500">
        No student bus assignments yet.
      </div>
    )}
  </div>
);

const Drivers = () => {
  const { user } = useAuth();
  const {
    data: buses,
    loading: busesLoading,
    refresh: refreshBuses,
  } = useApiList('/api/transport/buses/');
  const {
    data: assignments,
    loading: assignmentsLoading,
    refresh: refreshAssignments,
   } = useApiList('/api/transport/assignments/');

  const [showAssign, setShowAssign] = useState(false);

  const handleSaved = () => {
    refreshBuses();
    refreshAssignments();
  };

  const activeBuses = buses.filter((b) => b.is_active).length;
  const activeDrivers = buses
    .filter((b) => b.is_active && b.driver)
    .reduce(
      (set, b) => set.add(b.driver.id),
      new Set(),
    ).size;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-2">
            <BusFront className="h-7 w-7" /> Drivers &amp; Buses
          </h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Manage bus drivers, routes, and student transport assignments.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              refreshBuses();
              refreshAssignments();
            }}
            className="px-4 py-2 text-sm font-medium text-brand-navy bg-brand-grayLight hover:bg-brand-grayLight/70 rounded-xl"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover rounded-xl clay-button"
          >
            <Plus className="h-4 w-4" /> Assign Student
          </button>
          <Link
            to="/students"
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover rounded-xl clay-button"
          >
            <Users className="h-4 w-4" /> View Students
          </Link>
          <Link
            to="/driver-students"
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            <MapPin className="h-4 w-4" /> Student Pickup Map
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Active Buses</p>
          <p className="text-3xl font-bold text-brand-orange mt-1">
            {busesLoading ? '…' : activeBuses}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Assigned Drivers</p>
          <p className="text-3xl font-bold text-brand-navy mt-1">
            {busesLoading ? '…' : activeDrivers}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Total Routes</p>
          <p className="text-3xl font-bold text-brand-navy mt-1">
            {busesLoading ? '…' : new Set(buses.map((b) => b.route?.id).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Assignments</p>
          <p className="text-3xl font-bold text-brand-navy mt-1">
            {assignmentsLoading ? '…' : assignments.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-brand-navy mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Live Bus & Driver Map
        </h2>
        <BusMap buses={buses} />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-brand-navy mb-3 flex items-center gap-2">
            <BusFront className="h-5 w-5" /> Buses & Drivers
          </h2>
          <BusesTable buses={buses} loading={busesLoading} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-navy mb-3 flex items-center gap-2">
            <UserCheck className="h-5 w-5" /> Student Bus Assignments
          </h2>
          <AssignmentsTable assignments={assignments} loading={assignmentsLoading} />
        </div>
      </div>

      {showAssign && (
        <AssignStudentForm
          buses={buses}
          schoolId={user?.school}
          onClose={() => setShowAssign(false)}
          onSaved={() => {
            handleSaved();
            setShowAssign(false);
          }}
        />
      )}
    </div>
  );
};

export default Drivers;
