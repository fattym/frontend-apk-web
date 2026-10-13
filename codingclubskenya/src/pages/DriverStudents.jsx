import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useApiList from '../hooks/useApiList';
import DriverMap from '../components/DriverMap';

const statusColor = (active) =>
  active
    ? 'bg-blue-100 text-blue-700'
    : 'bg-gray-100 text-gray-500';

const studentName = (s) => {
  if (!s) return '—';
  const n = `${s.first_name || ''} ${s.last_name || ''}`.trim();
  return n || s.email;
};

const DriverStudents = () => {
  const { user } = useAuth();
  const { data: assignments = [], loading, error, refresh } =
    useApiList('/api/transport/driver/students/');

  const allowed = user?.role === 'DRIVER' || user?.role === 'ADMIN';
  if (!allowed) {
    return <Navigate to={user ? '/school-dashboard' : '/login'} replace />;
  }

  const bus = assignments[0]?.bus;
  const route = bus?.route;
  const activePickups = assignments.filter(
    (a) => a.is_active && a.pickup_latitude && a.pickup_longitude,
  ).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-2">
            <span role="img" aria-label="driver">🚍</span>
            My Students
          </h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Logged in as <span className="font-medium">{user?.email}</span> · role: {user?.role}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refresh}
            className="px-4 py-2 text-sm font-medium text-brand-navy bg-brand-grayLight hover:bg-brand-grayLight/70 rounded-xl"
          >
            Refresh
          </button>
          {user?.role === 'DRIVER' ? null : (
            <Link
              to="/drivers"
              className="px-4 py-2 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover rounded-xl"
            >
              Bus Overview
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Assigned Bus</p>
          <p className="text-xl font-bold text-brand-navy mt-1">
            {loading ? '…' : (bus?.plate_number || 'None')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Route</p>
          <p className="text-xl font-bold text-brand-navy mt-1">
            {loading ? '…' : (route?.name || '—')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">On-board Students</p>
          <p className="text-3xl font-bold text-brand-orange mt-1">
            {loading ? '…' : assignments.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow text-center">
          <p className="text-brand-navy/60 text-xs uppercase tracking-wider">Pickup Locations</p>
          <p className="text-3xl font-bold text-brand-navy mt-1">
            {loading ? '…' : activePickups}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-brand-navy mb-4 flex items-center gap-2">
          <span role="img" aria-label="map">🗺️</span> Live Student Map
        </h2>
        <DriverMap assignments={assignments} />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-brand-navy">Assigned Students</h2>
          <Link
            to={user?.role === 'DRIVER' ? '/school-dashboard' : '/drivers'}
            className="text-sm text-brand-orange hover:underline"
          >
            {user?.role === 'DRIVER' ? 'Back to Dashboard' : 'Back to Buses'}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((a) => (
                <tr
                  key={a.id}
                  className={`hover:bg-brand-grayLight/40 ${a.is_active ? '' : 'opacity-60'}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-brand-navy">{studentName(a.student)}</p>
                    <p className="text-xs text-gray-500">{a.student?.email}</p>
                  </td>
                  <td className="px-6 py-4">{a.bus?.plate_number || '—'}</td>
                  <td className="px-6 py-4">{a.bus?.route?.name || '—'}</td>
                  <td className="px-6 py-4">
                    {a.pickup_latitude && a.pickup_longitude ? (
                      <span className="text-xs text-gray-500">
                        {a.pickup_latitude.toFixed(5)}, {a.pickup_longitude.toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {a.start_date ? new Date(a.start_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(a.is_active)}`}
                    >
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No students assigned to your bus yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverStudents;
