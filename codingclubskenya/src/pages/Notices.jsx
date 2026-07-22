import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TARGETS = [
  { value: 'ALL', label: 'All' },
  { value: 'TEACHERS', label: 'Teachers' },
  { value: 'STUDENTS', label: 'Students' },
  { value: 'PARENTS', label: 'Parents' },
  { value: 'STREAM', label: 'Specific Class' },
  { value: 'INDIVIDUAL', label: 'Individual' },
];

const Notices = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [items, setItems] = useState([]);
  const [streams, setStreams] = useState([]);
  const [users, setUsers] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', content: '', target_type: 'ALL',
    target_stream: '', target_users: [], is_pinned: false, is_published: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get('/api/notices/notices/')
      .then((r) => setItems(r.data.results || r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/api/academics/streams/').then((r) => setStreams(r.data.results || r.data)).catch(() => setStreams([]));
    Promise.all([
      api.get('/api/auth/users/?role=STUDENT'),
      api.get('/api/auth/users/?role=TEACHER'),
      api.get('/api/auth/users/?role=PARENT'),
    ]).then(([s, t, p]) => {
      const all = [
        ...(s.data.results || s.data),
        ...(t.data.results || t.data),
        ...(p.data.results || p.data),
      ];
      setUsers(all);
    }).catch(() => setUsers([]));
  }, [isAdmin]);

  const openEditor = (n) => {
    setActive(n);
    setForm({
      title: n.title, content: n.content, target_type: n.target_type,
      target_stream: n.target_stream || '', target_users: n.target_users || [],
      is_pinned: n.is_pinned, is_published: n.is_published,
    });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      title: form.title,
      content: form.content,
      target_type: form.target_type,
      target_stream: form.target_type === 'STREAM' ? form.target_stream : null,
      target_users: form.target_type === 'INDIVIDUAL' ? form.target_users : [],
      is_pinned: form.is_pinned,
      is_published: form.is_published,
    };
    try {
      if (active) {
        await api.put(`/api/notices/notices/${active.id}/`, payload);
      } else {
        await api.post('/api/notices/notices/', payload);
      }
      setActive(null);
      setForm({ title: '', content: '', target_type: 'ALL', target_stream: '', target_users: [], is_pinned: false, is_published: true });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try { await api.delete(`/api/notices/notices/${id}/`); load(); }
    catch (err) { setError(JSON.stringify(err.response?.data || err.message)); }
  };

  const togglePin = async (n) => {
    try {
      await api.patch(`/api/notices/notices/${n.id}/`, { is_pinned: !n.is_pinned });
      load();
    } catch (err) { setError(JSON.stringify(err.response?.data || err.message)); }
  };

  const markRead = async (id) => {
    try { await api.post(`/api/notices/notices/${id}/mark_read/`); load(); }
    catch (err) { setError(JSON.stringify(err.response?.data || err.message)); }
  };

  if (active) {
    const n = active;
    const pct = n.total_audience ? Math.round((n.read_count / n.total_audience) * 100) : 0;
    return (
      <div>
        <button onClick={() => setActive(null)} className="text-blue-600 hover:underline mb-4">&larr; Back</button>
        <div className="bg-white rounded shadow p-6 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {n.title}
                {n.is_pinned && <span className="ml-2 text-amber-500">📌</span>}
              </h2>
              <p className="text-sm text-gray-500">By {n.created_by_name} · {new Date(n.created_at).toLocaleString()}</p>
            </div>
            {isAdmin && (
              <button onClick={() => remove(n.id)} className="text-red-600 hover:underline text-sm">Delete</button>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 border-t pt-3">
            <span>Target: <span className="font-medium">{n.target_type}</span></span>
            {n.target_stream_name && <span>· {n.target_stream_name}</span>}
            {n.target_users?.length > 0 && <span>· {n.target_users.length} individual(s)</span>}
          </div>
          {isAdmin && (
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Read: {n.read_count} / {n.total_audience}</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          {!isAdmin && (
            <div className="border-t pt-3 flex justify-end">
              <button onClick={() => markRead(n.id)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Mark as read</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Notice Board</h1>
      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      {isAdmin && (
        <form onSubmit={submit} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <h2 className="font-semibold mb-2">{active ? `Edit: ${active.title}` : 'Create Notice'}</h2>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target</label>
            <select className="w-full border rounded px-3 py-2" value={form.target_type} onChange={(e) => setForm({ ...form, target_type: e.target.value })}>
              {TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {form.target_type === 'STREAM' && (
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select className="w-full border rounded px-3 py-2" value={form.target_stream} onChange={(e) => setForm({ ...form, target_stream: e.target.value })}>
                <option value="">Select…</option>
                {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {form.target_type === 'INDIVIDUAL' && (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Individuals (multi-select)</label>
              <select multiple className="w-full border rounded px-3 py-2 h-28" value={form.target_users} onChange={(e) => setForm({ ...form, target_users: Array.from(e.target.selectedOptions, (o) => Number(o.value)) })}>
                {users.map((u) => <option key={u.id} value={u.id}>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}</option>)}
              </select>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />
            Pin this notice
          </label>
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Published
          </label>
          <div className="col-span-2 flex justify-end gap-3">
            {active && <button type="button" onClick={() => setActive(null)} className="px-4 py-2 border rounded">Cancel</button>}
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : (active ? 'Save' : 'Create Notice')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {items.map((n) => (
            <div key={n.id} onClick={() => openEditor(n)} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium flex items-center gap-2">
                  {n.is_pinned && <span className="text-amber-500">📌</span>}
                  {n.title}
                </p>
                <p className="text-sm text-gray-500">
                  {n.target_type}{n.target_stream_name ? ` · ${n.target_stream_name}` : ''} · {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && <span className="text-xs text-gray-500">{n.read_count}/{n.total_audience} read</span>}
                {!isAdmin && !n.read_by_me && (
                  <button onClick={(e) => { e.stopPropagation(); togglePin(n); }} className="text-xs text-gray-400 hover:text-amber-500" title="Pin">📌</button>
                )}
                <span className="text-blue-600 text-sm">Open →</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p-6 text-gray-500">No notices found.</p>}
        </div>
      )}
    </div>
  );
};

export default Notices;
