import { useState, useEffect } from 'react';
import api from '../services/api';

const useOptions = (url) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    let active = true;
    api.get(url).then((r) => setOptions(r.data.results || r.data)).catch(() => setOptions([]));
    return () => { active = false; };
  }, [url]);
  return options;
};

const LearnerGroups = () => {
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null); // group being edited
  const [form, setForm] = useState({ name: '', stream: '', learning_area: '' });
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const streams = useOptions('/api/academics/streams/');
  const learningAreas = useOptions('/api/academics/learning-areas/');
  const students = useOptions('/api/auth/users/?role=STUDENT');

  const loadGroups = () => {
    api.get('/api/academics/learner-groups/').then((r) => setGroups(r.data.results || r.data)).catch(() => setGroups([]));
  };
  useEffect(loadGroups, []);

  const openEditor = (group) => {
    setActive(group);
    setForm({ name: group.name, stream: group.stream, learning_area: group.learning_area || '' });
    setMembers(group.members || []);
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.learning_area === '') payload.learning_area = null;
      await api.post('/api/academics/learner-groups/', { ...payload, members: [] });
      setForm({ name: '', stream: '', learning_area: '' });
      loadGroups();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const saveMembers = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        stream: Number(form.stream),
        learning_area: form.learning_area ? Number(form.learning_area) : null,
        members,
      };
      await api.put(`/api/academics/learner-groups/${active.id}/`, payload);
      setActive(null);
      loadGroups();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (active) {
    return (
      <div>
        <button onClick={() => setActive(null)} className="text-blue-600 hover:underline mb-4">&larr; Back to groups</button>
        <h2 className="text-2xl font-bold mb-4">Edit Group: {active.name}</h2>
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stream</label>
              <select className="w-full border rounded px-3 py-2" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
                <option value="">Select…</option>
                {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Learning Area (optional)</label>
              <select className="w-full border rounded px-3 py-2" value={form.learning_area} onChange={(e) => setForm({ ...form, learning_area: e.target.value })}>
                <option value="">Select…</option>
                {learningAreas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Members ({members.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto border rounded p-3">
              {students.map((stu) => (
                <label key={stu.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={members.includes(stu.id)} onChange={(e) => setMembers((m) => e.target.checked ? [...m, stu.id] : m.filter((x) => x !== stu.id))} />
                  {stu.first_name} {stu.last_name} ({stu.email})
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm break-words">{error}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setActive(null)} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={saveMembers} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save Members'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Learner Groups</h1>
      <form onSubmit={handleCreate} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Group Name</label>
          <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stream</label>
          <select className="w-full border rounded px-3 py-2" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} required>
            <option value="">Select…</option>
            {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Learning Area (optional)</label>
          <select className="w-full border rounded px-3 py-2" value={form.learning_area} onChange={(e) => setForm({ ...form, learning_area: e.target.value })}>
            <option value="">Select…</option>
            {learningAreas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Adding…' : 'Add Group'}</button>
        </div>
      </form>

      <div className="bg-white rounded shadow divide-y">
        {groups.map((g) => (
          <div key={g.id} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer" onClick={() => openEditor(g)}>
            <div>
              <p className="font-medium">{g.name}</p>
              <p className="text-sm text-gray-500">Stream {g.stream} · {(g.members || []).length} members</p>
            </div>
            <span className="text-blue-600 text-sm">Manage →</span>
          </div>
        ))}
        {groups.length === 0 && <p className="p-6 text-gray-500">No groups yet.</p>}
      </div>
    </div>
  );
};

export default LearnerGroups;
