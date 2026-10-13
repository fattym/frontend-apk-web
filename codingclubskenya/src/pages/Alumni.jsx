import { useState } from 'react';
import api from '../services/api';
import useApiList from '../hooks/useApiList';
import Tabs from '../components/Tabs';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'alumni', label: 'Alumni' },
  { key: 'events', label: 'Network Events' },
];

const Alumni = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { data: alumni, loading: alLoading, refresh: refreshAlumni } = useApiList('/api/alumni/alumni/');
  const { data: events, loading: evLoading, refresh: refreshEvents } = useApiList('/api/alumni/events/');
  const { data: users, loading: uLoading } = useApiList('/api/auth/users/?role=STUDENT');

  const [tab, setTab] = useState('alumni');
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', graduation_year: new Date().getFullYear(),
    current_status: '', current_institution: '', current_employer: '',
    linkedin_url: '', email: '', phone: '',
    is_willing_to_be_mentored: false, is_willing_to_mentor: false,
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_date: new Date().toISOString().slice(0, 10),
    location: '', alumni_attendees: [],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submitAlumni = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (active) {
        await api.put(`/api/alumni/alumni/${active.id}/`, form);
      } else {
        await api.post('/api/alumni/alumni/', form);
      }
      setActive(null);
      setForm({
        first_name: '', last_name: '', graduation_year: new Date().getFullYear(),
        current_status: '', current_institution: '', current_employer: '',
        linkedin_url: '', email: '', phone: '',
        is_willing_to_be_mentored: false, is_willing_to_mentor: false,
      });
      refreshAlumni();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (activeEvent) {
        await api.put(`/api/alumni/events/${activeEvent.id}/`, eventForm);
      } else {
        await api.post('/api/alumni/events/', eventForm);
      }
      setActiveEvent(null);
      setEventForm({
        title: '', description: '', event_date: new Date().toISOString().slice(0, 10),
        location: '', alumni_attendees: [],
      });
      refreshEvents();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeAlumni = async (id) => {
    if (!window.confirm('Delete this alumni record?')) return;
    try {
      await api.delete(`/api/alumni/alumni/${id}/`);
      refreshAlumni();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const removeEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/alumni/events/${id}/`);
      refreshEvents();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const openAlumniEditor = (a) => {
    setActive(a);
    setForm({
      first_name: a.first_name || '', last_name: a.last_name || '',
      graduation_year: a.graduation_year || new Date().getFullYear(),
      current_status: a.current_status || '', current_institution: a.current_institution || '',
      current_employer: a.current_employer || '', linkedin_url: a.linkedin_url || '',
      email: a.email || '', phone: a.phone || '',
      is_willing_to_be_mentored: a.is_willing_to_be_mentored || false,
      is_willing_to_mentor: a.is_willing_to_mentor || false,
    });
    setError('');
  };

  const openEventEditor = (ev) => {
    setActiveEvent(ev);
    setEventForm({
      title: ev.title || '', description: ev.description || '',
      event_date: ev.event_date || new Date().toISOString().slice(0, 10),
      location: ev.location || '', alumni_attendees: ev.alumni_attendees || [],
    });
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Alumni Network</h1>
        <span className="text-sm text-gray-500">{(tab === 'alumni' ? alumni : events || []).length} shown</span>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'alumni' && (
        <>
          {isAdmin && (
            <form onSubmit={submitAlumni} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3">
                <h2 className="font-semibold mb-2">{active ? `Edit: ${active.first_name} ${active.last_name}` : 'Add Alumni'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input className="w-full border rounded px-3 py-2" required value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input className="w-full border rounded px-3 py-2" required value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <input type="number" className="w-full border rounded px-3 py-2" required value={form.graduation_year}
                  onChange={(e) => setForm({ ...form, graduation_year: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Status</label>
                <input className="w-full border rounded px-3 py-2" value={form.current_status}
                  onChange={(e) => setForm({ ...form, current_status: e.target.value })}
                  placeholder="e.g. University Student, Employed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Institution</label>
                <input className="w-full border rounded px-3 py-2" value={form.current_institution}
                  onChange={(e) => setForm({ ...form, current_institution: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Employer</label>
                <input className="w-full border rounded px-3 py-2" value={form.current_employer}
                  onChange={(e) => setForm({ ...form, current_employer: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input className="w-full border rounded px-3 py-2" value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full border rounded px-3 py-2" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 md:col-span-1 mt-8">
                <input type="checkbox" id="mentored" checked={form.is_willing_to_be_mentored}
                  onChange={(e) => setForm({ ...form, is_willing_to_be_mentored: e.target.checked })} />
                <label htmlFor="mentored" className="text-sm">Wants mentorship</label>
              </div>
              <div className="flex items-center gap-2 md:col-span-1 mt-8">
                <input type="checkbox" id="mentor" checked={form.is_willing_to_mentor}
                  onChange={(e) => setForm({ ...form, is_willing_to_mentor: e.target.checked })} />
                <label htmlFor="mentor" className="text-sm">Wants to mentor</label>
              </div>

              <div className="md:col-span-3 flex justify-end gap-3">
                {active && (
                  <button type="button" onClick={() => { setActive(null); setForm({ first_name: '', last_name: '', graduation_year: new Date().getFullYear(), current_status: '', current_institution: '', current_employer: '', linkedin_url: '', email: '', phone: '', is_willing_to_be_mentored: false, is_willing_to_mentor: false }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (active ? 'Save Changes' : 'Add Alumni')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {alLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (alumni || []).map((a) => (
                <div key={a.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div className>
                    <p className="font-medium">{a.first_name} {a.last_name} <span className="text-sm text-gray-500">({a.graduation_year})</span></p>
                    {a.current_status && <p className="text-sm text-gray-600">{a.current_status}</p>}
                    {a.current_institution && <p className="text-xs text-gray-500">Institution: {a.current_institution}</p>}
                    {a.current_employer && <p className="text-xs text-gray-500">Employer: {a.current_employer}</p>}
                    <div className="flex gap-2 mt-1">
                      {a.is_willing_to_mentor && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">Available to Mentor</span>}
                      {a.is_willing_to_be_mentored && <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">Seeks Mentor</span>}
                    </div>
                    {a.linkedin_url && (
                      <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">LinkedIn profile</a>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => openAlumniEditor(a)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      <button onClick={() => removeAlumni(a.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </div>
                  )}
                </div>
              ))
            )}
            {(!alLoading && (alumni || []).length === 0) && <p className="p-6 text-gray-500">No alumni records found.</p>}
          </div>
        </>
      )}

      {tab === 'events' && (
        <>
          {isAdmin && (
            <form onSubmit={submitEvent} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">{activeEvent ? `Edit: ${activeEvent.title}` : 'Create Network Event'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input className="w-full border rounded px-3 py-2" required value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" required value={eventForm.event_date}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Location</label>
                <input className="w-full border rounded px-3 py-2" value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} required value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                {activeEvent && (
                  <button type="button" onClick={() => { setActiveEvent(null); setEventForm({ title: '', description: '', event_date: new Date().toISOString().slice(0, 10), location: '', alumni_attendees: [] }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (activeEvent ? 'Save Changes' : 'Create Event')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {evLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (events || []).map((ev) => (
                <div key={ev.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{ev.title}</p>
                    <p className="text-sm text-gray-600">{new Date(ev.event_date).toLocaleDateString()}</p>
                    {ev.location && <p className="text-xs text-gray-500">{ev.location}</p>}
                    <p className="text-sm text-gray-600">{ev.description}</p>
                    {ev.alumni_attendees && ev.alumni_attendees.length > 0 && (
                      <p className="text-xs text-gray-400">{ev.alumni_attendees.length} alumni attending</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEventEditor(ev)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    <button onClick={() => removeEvent(ev.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  </div>
                </div>
              ))
            )}
            {(!evLoading && (events || []).length === 0) && <p className="p-6 text-gray-500">No alumni events found.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Alumni;
