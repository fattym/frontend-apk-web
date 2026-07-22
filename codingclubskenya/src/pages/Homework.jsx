import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = {
  'Not Submitted': 'bg-gray-100 text-gray-600',
  Submitted: 'bg-green-100 text-green-800',
  Late: 'bg-amber-100 text-amber-800',
};

const HomeworkPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  const [items, setItems] = useState([]);
  const [streams, setStreams] = useState([]);
  const [areas, setAreas] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', stream: '', learning_area: '',
    due_date: new Date().toISOString().slice(0, 10), file: '',
  });
  const [grades, setGrades] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get('/api/homework/homeworks/')
      .then((r) => setItems(r.data.results || r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (!isTeacher) return;
    api.get('/api/academics/streams/').then((r) => setStreams(r.data.results || r.data)).catch(() => setStreams([]));
    api.get('/api/academics/learning-areas/').then((r) => setAreas(r.data.results || r.data)).catch(() => setAreas([]));
  }, [isTeacher]);

  const openEditor = (hw) => {
    setActive(hw);
    setForm({
      title: hw.title, description: hw.description || '',
      stream: hw.stream, learning_area: hw.learning_area,
      due_date: hw.due_date, file: hw.file || '',
    });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (active) {
        await api.put(`/api/homework/homeworks/${active.id}/`, { ...form });
      } else {
        await api.post('/api/homework/homeworks/', { ...form });
      }
      setActive(null);
      setForm({
        title: '', description: '', stream: '', learning_area: '',
        due_date: new Date().toISOString().slice(0, 10), file: '',
      });
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this homework?')) return;
    try {
      await api.delete(`/api/homework/homeworks/${id}/`);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const saveGrade = async (submissionId) => {
    const g = grades[submissionId] || {};
    try {
      await api.post(`/api/homework/homeworks/${active.id}/grade/`, {
        submission_id: submissionId,
        marks: g.marks === '' || g.marks == null ? null : g.marks,
        feedback: g.feedback || '',
      });
      const res = await api.get(`/api/homework/homeworks/${active.id}/`);
      setActive(res.data);
      setGrades((prev) => { const n = { ...prev }; delete n[submissionId]; return n; });
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const [submitUrl, setSubmitUrl] = useState('');
  const doSubmit = async () => {
    try {
      await api.post(`/api/homework/homeworks/${active.id}/submit/`, { file_url: submitUrl });
      const res = await api.get(`/api/homework/homeworks/${active.id}/`);
      setActive(res.data);
      setSubmitUrl('');
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  if (active) {
    const hw = active;
    const mySubmission = (hw.submissions || []).find((s) => s.student === user?.id);
    return (
      <div>
        <button onClick={() => setActive(null)} className="text-blue-600 hover:underline mb-4">&larr; Back</button>
        <div className="bg-white rounded shadow p-6 space-y-5">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold">{hw.title}</h2>
              <p className="text-sm text-gray-500">{hw.stream_name} · {hw.learning_area_name} · Due {hw.due_date}</p>
            </div>
            {isTeacher && (
              <button onClick={() => remove(hw.id)} className="text-red-600 hover:underline text-sm">Delete</button>
            )}
          </div>
          {hw.description && <p className="text-gray-700 whitespace-pre-wrap">{hw.description}</p>}
          {hw.file && (
            <a href={hw.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Attachment</a>
          )}

          {isStudent && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Your submission</h3>
              {mySubmission ? (
                <div className="text-sm space-y-1">
                  <p>Status: <span className="font-medium">{mySubmission.status}</span></p>
                  {mySubmission.marks != null && <p>Marks: {mySubmission.marks}</p>}
                  {mySubmission.feedback && <p>Feedback: {mySubmission.feedback}</p>}
                </div>
              ) : <p className="text-sm text-gray-500">Not assigned to you.</p>}
              <div className="flex gap-2 mt-3">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Paste file URL…" value={submitUrl} onChange={(e) => setSubmitUrl(e.target.value)} />
                <button onClick={doSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
              </div>
            </div>
          )}

          {isTeacher && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Submissions ({(hw.submissions || []).length})</h3>
              <div className="space-y-3">
                {(hw.submissions || []).map((s) => (
                  <div key={s.id} className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{s.student_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status] || 'bg-gray-100'}`}>{s.status}</span>
                    </div>
                    {s.file_url && (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">file</a>
                    )}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <input
                        className="border rounded px-2 py-1 text-sm" placeholder="Marks"
                        defaultValue={s.marks ?? ''}
                        onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: { ...prev[s.id], marks: e.target.value } }))}
                      />
                      <input
                        className="col-span-2 border rounded px-2 py-1 text-sm" placeholder="Feedback"
                        defaultValue={s.feedback || ''}
                        onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: { ...prev[s.id], feedback: e.target.value } }))}
                      />
                    </div>
                    <button onClick={() => saveGrade(s.id)} className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Save grade
                    </button>
                  </div>
                ))}
                {(hw.submissions || []).length === 0 && (
                  <p className="text-sm text-gray-500">No students enrolled in this stream yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Homework</h1>
      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      {isTeacher && (
        <form onSubmit={submit} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <h2 className="font-semibold mb-2">{active ? `Edit: ${active.title}` : 'Assign Homework'}</h2>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stream (Class)</label>
            <select className="w-full border rounded px-3 py-2" required value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
              <option value="">Select…</option>
              {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Learning Area</label>
            <select className="w-full border rounded px-3 py-2" required value={form.learning_area} onChange={(e) => setForm({ ...form, learning_area: e.target.value })}>
              <option value="">Select…</option>
              {areas.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due date</label>
            <input type="date" className="w-full border rounded px-3 py-2" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Attachment URL</label>
            <input className="w-full border rounded px-3 py-2" placeholder="https://… (optional)" value={form.file} onChange={(e) => setForm({ ...form, file: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border rounded px-3 py-2" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3">
            {active && <button type="button" onClick={() => setActive(null)} className="px-4 py-2 border rounded">Cancel</button>}
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : (active ? 'Save' : 'Assign')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded shadow divide-y">
          {items.map((hw) => (
            <div key={hw.id} onClick={() => openEditor(hw)} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium">{hw.title}</p>
                <p className="text-sm text-gray-500">{hw.stream_name} · {hw.learning_area_name} · Due {hw.due_date}</p>
              </div>
              <div className="flex items-center gap-3">
                {isTeacher && <span className="text-xs text-gray-500">{hw.submitted_count || 0} submitted</span>}
                <span className="text-blue-600 text-sm">Open →</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p-6 text-gray-500">No homework found.</p>}
        </div>
      )}
    </div>
  );
};

export default HomeworkPage;
