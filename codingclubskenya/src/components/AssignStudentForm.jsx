import { useState, useEffect } from 'react';
import api, { formErrorMessage } from '../services/api';
import PickupPicker from './PickupPicker';
import { X, User, Calendar, MapPin } from 'lucide-react';

const todayISO = () => new Date().toISOString().split('T')[0];

const AssignStudentForm = ({ buses = [], schoolId, onClose, onSaved }) => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [form, setForm] = useState({
    bus: '',
    student: '',
    start_date: todayISO(),
    is_active: true,
  });
  const [pickup, setPickup] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    api
      .get(`/api/auth/users/?role=STUDENT${schoolId ? `&school=${schoolId}` : ''}`)
      .then((res) => {
        setStudents(res.data.results || res.data);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [schoolId]);

  const drivable = (buses || []).filter((b) => b.driver);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    if (!form.bus || !form.student) {
      setError('Please select a bus and a student.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/transport/assignments/', {
        bus: Number(form.bus),
        student: Number(form.student),
        start_date: form.start_date,
        is_active: form.is_active,
        pickup_latitude: pickup?.lat ?? null,
        pickup_longitude: pickup?.lng ?? null,
      });
      setResult('Student assigned to the bus.');
      onSaved();
    } catch (err) {
      setError(formErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
            <User className="h-5 w-5" /> Assign Student to a Bus
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Bus
              </label>
              <select
                name="bus"
                value={form.bus}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                required
              >
                <option value="">Select a bus…</option>
                {drivable.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.plate_number} (driver: {b.driver?.first_name || b.driver?.email || '—'})
                  </option>
                ))}
              </select>
              {!drivable.length && (
                <p className="text-[10px] text-gray-500 mt-1">
                  No buses with an assigned driver. Assign a driver first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Student
              </label>
              {loadingStudents ? (
                <div className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400">
                  Loading students…
                </div>
              ) : (
                <select
                  name="student"
                  value={form.student}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  required
                >
                  <option value="">Select a student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} — {s.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-end gap-2">
              <Calendar className="h-4 w-4 text-brand-navy/50" />
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  required
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <MapPin className="h-4 w-4 text-brand-navy/50 mt-5" />
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Pickup Location
                </label>
                {pickup ? (
                  <p className="text-xs text-gray-500 mb-1">
                    {pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)} · tap the map to change
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mb-1">Select a pickup point on the map</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <PickupPicker value={pickup} onChange={setPickup} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {result && <p className="text-green-600 text-sm">{result}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-brand-navy bg-brand-grayLight hover:bg-brand-grayLight/70 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.bus || !form.student}
              className="px-4 py-2 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orangeHover rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Assigning…' : 'Assign Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStudentForm;
