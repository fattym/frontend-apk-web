import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TYPE_COLORS = {
  Academic: 'bg-indigo-100 text-indigo-800',
  Sports: 'bg-emerald-100 text-emerald-800',
  Cultural: 'bg-pink-100 text-pink-800',
  Holiday: 'bg-red-100 text-red-800',
  Exam: 'bg-amber-100 text-amber-800',
  Other: 'bg-gray-100 text-gray-800',
};

const TYPES = ['Academic', 'Sports', 'Cultural', 'Holiday', 'Exam', 'Other'];

const EventsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [events, setEvents] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', event_type: 'Academic',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '', location: '', is_holiday: false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params = {};
    if (typeFilter) params.event_type = typeFilter;
    api.get('/api/events/events/', { params })
      .then((r) => setEvents(r.data.results || r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(load, [load]);

  const openEditor = (ev) => {
    setActive(ev);
    setForm({
      name: ev.name,
      description: ev.description || '',
      event_type: ev.event_type,
      start_date: ev.start_date,
      end_date: ev.end_date || '',
      location: ev.location || '',
      is_holiday: ev.is_holiday,
    });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      is_holiday: !!form.is_holiday,
      end_date: form.end_date || null,
    };
    try {
      if (active) {
        await api.put(`/api/events/events/${active.id}/`, payload);
      } else {
        await api.post('/api/events/events/', payload);
      }
      setActive(null);
      setForm({
        name: '', description: '', event_type: 'Academic',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '', location: '', is_holiday: false,
      });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/events/events/${id}/`);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events &amp; Holidays</h1>
        <span className="text-sm text-gray-500">{events.length} shown</span>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      {isAdmin && (
        <form onSubmit={submit} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <h2 className="font-semibold mb-2">{active ? `Edit: ${active.name}` : 'Create Event'}</h2>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="w-full border rounded px-3 py-2" value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start date</label>
            <input type="date" className="w-full border rounded px-3 py-2" required value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="w-full border rounded px-3 py-2" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border rounded px-3 py-2" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="holiday" checked={!!form.is_holiday}
              onChange={(e) => setForm({ ...form, is_holiday: e.target.checked })} />
            <label htmlFor="holiday" className="text-sm">Mark as holiday</label>
          </div>
          <div className="col-span-2 flex justify-end gap-3">
            {active && (
              <button type="button" onClick={() => setActive(null)}
                className="px-4 py-2 border rounded">Cancel</button>
            )}
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : (active ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="border rounded px-3 py-2 text-sm" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {events.map((ev) => (
            <div key={ev.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{ev.name}</p>
                  {ev.is_holiday && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Holiday</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ''}
                  {ev.location ? ` · ${ev.location}` : ''}
                  {ev.created_by_name ? ` · by ${ev.created_by_name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[ev.event_type] || 'bg-gray-100'}`}>
                  {ev.event_type}
                </span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => openEditor(ev)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    <button onClick={() => remove(ev.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="p-6 text-gray-500">No events found.</p>}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
