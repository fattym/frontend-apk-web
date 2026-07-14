import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Tabs from '../components/Tabs';

const useOptions = (url) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    let active = true;
    api.get(url).then((r) => setOptions(r.data.results || r.data)).catch(() => setOptions([]));
    return () => { active = false; };
  }, [url]);
  return options;
};

const labelOf = (u) => `${u.first_name} ${u.last_name}`.trim() || u.email;

/* ---------------- Clubs tab ---------------- */
const ClubsTab = () => {
  const [clubs, setClubs] = useState([]);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const users = useOptions('/api/auth/users/');
  const trainersPool = users.filter((u) => ['TEACHER', 'STAFF'].includes(u.role));

  const load = () => api.get('/api/clubs/clubs/').then((r) => setClubs(r.data.results || r.data)).catch(() => setClubs([]));
  useEffect(load, []);

  const openEditor = (club) => {
    setActive(club);
    setForm({ name: club.name, description: club.description || '' });
    setTrainers(club.trainers || []);
    setError('');
  };

  const createClub = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/clubs/clubs/', { ...form, trainers: [] });
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally { setSaving(false); }
  };

  const saveTrainers = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/clubs/clubs/${active.id}/`, {
        name: form.name,
        description: form.description,
        trainers,
        is_active: active.is_active,
      });
      setActive(null);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally { setSaving(false); }
  };

  if (active) {
    return (
      <div>
        <button onClick={() => setActive(null)} className="text-blue-600 hover:underline mb-4">&larr; Back to clubs</button>
        <h2 className="text-2xl font-bold mb-4">Manage Trainers: {active.name}</h2>
        <div className="bg-white rounded shadow p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input className="w-full border rounded px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Trainers ({(trainers || []).length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto border rounded p-3">
              {trainersPool.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(trainers || []).includes(u.id)} onChange={(e) => setTrainers((t) => e.target.checked ? [...t, u.id] : t.filter((x) => x !== u.id))} />
                  {labelOf(u)}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm break-words">{error}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setActive(null)} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={saveTrainers} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save Trainers'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={createClub} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Club Name</label>
          <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input className="w-full border rounded px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Adding…' : 'Add Club'}</button>
        </div>
      </form>
      <div className="bg-white rounded shadow divide-y">
        {clubs.map((c) => (
          <div key={c.id} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => openEditor(c)}>
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">{(c.trainers || []).length} trainer(s) · {c.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <span className="text-blue-600 text-sm">Manage →</span>
          </div>
        ))}
        {clubs.length === 0 && <p className="p-6 text-gray-500">No clubs yet.</p>}
      </div>
    </div>
  );
};

/* ---------------- Daily Sessions tab ---------------- */
const SessionsTab = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ club: '', date: new Date().toISOString().slice(0, 10), topic: '', notes: '', attendees: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/api/clubs/sessions/').then((r) => setSessions(r.data.results || r.data)).catch(() => setSessions([]));
  };
  useEffect(() => {
    load();
    api.get('/api/clubs/clubs/').then((r) => setClubs(r.data.results || r.data)).catch(() => setClubs([]));
    api.get('/api/auth/users/?role=STUDENT').then((r) => setStudents(r.data.results || r.data)).catch(() => setStudents([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/clubs/sessions/', {
        club: Number(form.club),
        date: form.date,
        topic: form.topic,
        notes: form.notes,
        attendees: form.attendees,
      });
      setForm({ club: '', date: new Date().toISOString().slice(0, 10), topic: '', notes: '', attendees: [] });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally { setSaving(false); }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">Logging as <span className="font-medium">{labelOf(user)}</span> (trainer). Record what you taught in today's session.</p>
      <form onSubmit={submit} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Club</label>
          <select className="w-full border rounded px-3 py-2" value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} required>
            <option value="">Select…</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">What was taught (topic)</label>
          <input className="w-full border rounded px-3 py-2" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea className="w-full border rounded px-3 py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Attendees (optional)</label>
          <select multiple className="w-full border rounded px-3 py-2 h-28" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: Array.from(e.target.selectedOptions, (o) => Number(o.value)) })}>
            {students.map((s) => <option key={s.id} value={s.id}>{labelOf(s)}</option>)}
          </select>
        </div>
        {error && <p className="col-span-2 text-red-600 text-sm break-words">{error}</p>}
        <div className="col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : 'Log Session'}</button>
        </div>
      </form>

      <div className="bg-white rounded shadow divide-y">
        {sessions.map((s) => (
          <div key={s.id} className="p-4">
            <div className="flex justify-between">
              <p className="font-medium">{s.club_name || s.club}</p>
              <p className="text-sm text-gray-500">{s.date}</p>
            </div>
            <p className="text-sm text-gray-700">{s.topic}</p>
            {s.notes && <p className="text-sm text-gray-500 mt-1">{s.notes}</p>}
          </div>
        ))}
        {sessions.length === 0 && <p className="p-6 text-gray-500">No sessions logged yet.</p>}
      </div>
    </div>
  );
};

const Clubs = () => {
  const [tab, setTab] = useState('clubs');
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Clubs &amp; Activities</h1>
      <Tabs
        tabs={[{ key: 'clubs', label: 'Clubs' }, { key: 'sessions', label: 'Daily Sessions' }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'clubs' ? <ClubsTab /> : <SessionsTab />}
    </div>
  );
};

export default Clubs;
