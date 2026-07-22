import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
};

const CATEGORIES = ['Academic', 'Disciplinary', 'Facilities', 'Fee', 'Other'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const userName = (u) =>
  u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email : '—';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  const [complaints, setComplaints] = useState([]);
  const [handlers, setHandlers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    api.get('/api/complaints/complaints/', { params })
      .then((r) => setComplaints(r.data.results || r.data))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get('/api/auth/users/?role=TEACHER')
      .then((r) => setHandlers(r.data.results || r.data))
      .catch(() => setHandlers([]));
  }, [isAdmin]);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Academic', priority: 'Medium',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const createComplaint = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.post('/api/complaints/complaints/', form);
      setForm({ title: '', description: '', category: 'Academic', priority: 'Medium' });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setCreating(false);
    }
  };

  const assign = async (complaintId, assignedTo) => {
    try {
      await api.post(`/api/complaints/complaints/${complaintId}/assign/`, { assigned_to: assignedTo || null });
      load();
      if (active?.id === complaintId) {
        const updated = await api.get(`/api/complaints/complaints/${complaintId}/`);
        setActive(updated.data);
      }
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const resolve = async (complaintId, resolution) => {
    try {
      await api.post(`/api/complaints/complaints/${complaintId}/resolve/`, {
        resolution,
        status: 'Resolved',
      });
      load();
      const updated = await api.get(`/api/complaints/complaints/${complaintId}/`);
      setActive(updated.data);
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const [comment, setComment] = useState('');
  const addComment = async (complaintId) => {
    const text = comment.trim();
    if (!text) return;
    try {
      await api.post(`/api/complaints/complaints/${complaintId}/comment/`, { text });
      setComment('');
      const updated = await api.get(`/api/complaints/complaints/${complaintId}/`);
      setActive(updated.data);
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const remove = async (complaintId) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await api.delete(`/api/complaints/complaints/${complaintId}/`);
      setActive(null);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const openDetail = async (c) => {
    const res = await api.get(`/api/complaints/complaints/${c.id}/`).catch(() => ({ data: c }));
    setActive(res.data);
  };

  if (active) {
    const c = active;
    return (
      <div>
        <button onClick={() => setActive(null)} className="text-blue-600 hover:underline mb-4">&larr; Back to complaints</button>
        <div className="bg-white rounded shadow p-6 space-y-5">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold">{c.title}</h2>
              <p className="text-sm text-gray-500">
                {c.category} · {c.priority} priority · Raised by {c.submitted_by_name}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>
              {c.status}
            </span>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{c.description}</p>

          {isAdmin && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assign to</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={c.assigned_to || ''}
                  onChange={(e) => assign(c.id, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {handlers.map((h) => (
                    <option key={h.id} value={h.id}>{userName(h)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={c.status}
                  onChange={async (e) => {
                    if (e.target.value === 'Resolved') {
                      await resolve(c.id, c.resolution);
                    } else {
                      const res = await api.patch(`/api/complaints/complaints/${c.id}/`, { status: e.target.value }).catch(() => null);
                      if (res) { setActive(res.data); load(); }
                    }
                  }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1">Resolution notes</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                defaultValue={c.resolution || ''}
                onBlur={(e) => resolve(c.id, e.target.value)}
              />
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Discussion ({c.comments?.length || 0})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(c.comments || []).map((cm) => (
                <div key={cm.id} className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-medium">{cm.author_name}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{cm.text}</p>
                  <p className="text-xs text-gray-400">{new Date(cm.created_at).toLocaleString()}</p>
                </div>
              ))}
              {(!c.comments || c.comments.length === 0) && (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Add a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addComment(c.id); }}
              />
              <button onClick={() => addComment(c.id)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Post
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end border-t pt-4">
              <button onClick={() => remove(c.id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Complaints &amp; Grievances</h1>
        <span className="text-sm text-gray-500">{complaints.length} shown</span>
      </div>

      <form onSubmit={createComplaint} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full border rounded px-3 py-2" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select className="w-full border rounded px-3 py-2" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} required value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select className="w-full border rounded px-3 py-2" value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {creating ? 'Submitting…' : (isStudent ? 'Raise Complaint' : 'Add Complaint')}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {complaints.map((c) => (
            <div key={c.id} onClick={() => openDetail(c)}
              className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-gray-500">
                  {c.category} · {c.priority} · {c.submitted_by_name}
                  {c.assigned_to_name ? ` · Assigned to ${c.assigned_to_name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status] || 'bg-gray-100'}`}>
                  {c.status}
                </span>
                <span className="text-blue-600 text-sm">Open →</span>
              </div>
            </div>
          ))}
          {complaints.length === 0 && <p className="p-6 text-gray-500">No complaints found.</p>}
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
