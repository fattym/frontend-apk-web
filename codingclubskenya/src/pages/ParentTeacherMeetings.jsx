import { useState } from 'react';
import api from '../services/api';
import useApiList from '../hooks/useApiList';
import Tabs from '../components/Tabs';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'meetings', label: 'PT Meetings' },
  { key: 'notes', label: 'Meeting Notes' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const ParentTeacherMeetings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { data: meetings, loading: mtgLoading, refresh: refreshMeetings } = useApiList('/api/parent-meetings/meetings/');
  const { data: notes, loading: noteLoading, refresh: refreshNotes } = useApiList('/api/parent-meetings/notes/');
  const { data: teachers, loading: tLoading } = useApiList('/api/auth/users/?role=TEACHER');
  const { data: parents, loading: pLoading } = useApiList('/api/auth/users/?role=PARENT');
  const { data: students, loading: sLoading } = useApiList('/api/auth/users/?role=STUDENT');

  const [tab, setTab] = useState('meetings');
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    teacher: '', parent: '', student: '',
    scheduled_at: '', duration_minutes: 30, location: '',
    agenda: '', status: 'PENDING', notes: '',
  });
  const [activeNote, setActiveNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ meeting: '', content: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const teacherOptions = (teachers || []).filter((t) => t.role === 'TEACHER');
  const parentOptions = (parents || []).filter((p) => p.role === 'PARENT');
  const studentOptions = (students || []).filter((s) => s.role === 'STUDENT');

  const userName = (u) => `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || `User #${u?.id}`;

  const submitMeeting = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (active) {
        await api.put(`/api/parent-meetings/meetings/${active.id}/`, form);
      } else {
        await api.post('/api/parent-meetings/meetings/', form);
      }
      setActive(null);
      setForm({
        teacher: '', parent: '', student: '',
        scheduled_at: '', duration_minutes: 30, location: '',
        agenda: '', status: 'PENDING', notes: '',
      });
      refreshMeetings();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (activeNote) {
        await api.put(`/api/parent-meetings/notes/${activeNote.id}/`, noteForm);
      } else {
        await api.post('/api/parent-meetings/notes/', noteForm);
      }
      setActiveNote(null);
      setNoteForm({ meeting: '', content: '' });
      refreshNotes();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeMeeting = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    try {
      await api.delete(`/api/parent-meetings/meetings/${id}/`);
      refreshMeetings();
      refreshNotes();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const openMeetingEditor = (m) => {
    setActive(m);
    setForm({
      teacher: m.teacher || '', parent: m.parent || '', student: m.student || '',
      scheduled_at: m.scheduled_at ? m.scheduled_at.slice(0, 16) : '',
      duration_minutes: m.duration_minutes || 30, location: m.location || '',
      agenda: m.agenda || '', status: m.status || 'PENDING', notes: m.notes || '',
    });
    setError('');
  };

  const openNoteEditor = (n) => {
    setActiveNote(n);
    setNoteForm({ meeting: n.meeting || '', content: n.content || '' });
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parent-Teacher Meetings</h1>
        <span className="text-sm text-gray-500">{(tab === 'meetings' ? meetings : notes || []).length} shown</span>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'meetings' && (
        <>
          {isAdmin && (
            <form onSubmit={submitMeeting} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">{active ? `Edit Meeting #${active.id}` : 'Schedule PTM'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teacher</label>
                <select className="w-full border rounded px-3 py-2" required value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: parseInt(e.target.value) })}>
                  <option value="">Select teacher</option>
                  {teacherOptions.map((t) => <option key={t.id} value={t.id}>{userName(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent</label>
                <select className="w-full border rounded px-3 py-2" required value={form.parent}
                  onChange={(e) => setForm({ ...form, parent: parseInt(e.target.value) })}>
                  <option value="">Select parent</option>
                  {parentOptions.map((p) => <option key={p.id} value={p.id}>{userName(p)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select className="w-full border rounded px-3 py-2" required value={form.student}
                  onChange={(e) => setForm({ ...form, student: parseInt(e.target.value) })}>
                  <option value="">Select student</option>
                  {studentOptions.map((s) => <option key={s.id} value={s.id}>{userName(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full border rounded px-3 py-2" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled At</label>
                <input type="datetime-local" className="w-full border rounded px-3 py-2" required value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Location / Room</label>
                <input className="w-full border rounded px-3 py-2" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Room 3 or virtual meeting link" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Agenda</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                {active && (
                  <button type="button" onClick={() => { setActive(null); setForm({ teacher: '', parent: '', student: '', scheduled_at: '', duration_minutes: 30, location: '', agenda: '', status: 'PENDING', notes: '' }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (active ? 'Save Changes' : 'Schedule')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {mtgLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (meetings || []).map((m) => (
                <div key={m.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{userName(teacherOptions.find((t) => t.id === m.teacher)) || `Teacher #${m.teacher}`}</p>
                      <span className="text-gray-400">↔</span>
                      <p className="font-medium">{userName(parentOptions.find((p) => p.id === m.parent)) || `Parent #${m.parent}`}</p>
                    </div>
                    <p className="text-sm text-gray-600">For: {userName(studentOptions.find((s) => s.id === m.student)) || `Student #${m.student}`}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(m.scheduled_at).toLocaleString()} · {m.duration_minutes} mins
                      {m.location ? ` · ${m.location}` : ''}
                    </p>
                    {m.agenda && <p className="text-xs text-gray-500 mt-1">Agenda: {m.agenda}</p>}
                    {m.meeting_notes && m.meeting_notes.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{m.meeting_notes.length} note(s)</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[m.status] || 'bg-gray-100'}`}>
                      {m.status}
                    </span>
                    {isAdmin && (
                      <>
                        <button onClick={() => openMeetingEditor(m)} className="text-blue-600 text-sm hover:underline">Edit</button>
                        <button onClick={() => removeMeeting(m.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            {(!mtgLoading && (meetings || []).length === 0) && <p className="p-6 text-gray-500">No meetings scheduled.</p>}
          </div>
        </>
      )}

      {tab === 'notes' && (
        <>
          {isAdmin && (
            <form onSubmit={submitNote} className="bg-white rounded shadow p-6 mb-6">
              <h2 className="font-semibold mb-2">{activeNote ? `Edit Note #${activeNote.id}` : 'Add Meeting Note'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting</label>
                  <select className="w-full border rounded px-3 py-2" required value={noteForm.meeting}
                    onChange={(e) => setNoteForm({ ...noteForm, meeting: parseInt(e.target.value) })}>
                    <option value="">Select meeting</option>
                    {(meetings || []).map((m) => (
                      <option key={m.id} value={m.id}>#{m.id} - {new Date(m.scheduled_at).toLocaleDateString()}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Note Content</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={3} required value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  {activeNote && (
                    <button type="button" onClick={() => { setActiveNote(null); setNoteForm({ meeting: '', content: '' }); }}
                      className="px-4 py-2 border rounded">Cancel</button>
                  )}
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving…' : (activeNote ? 'Save' : 'Add Note')}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {noteLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (notes || []).map((n) => (
                <div key={n.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Meeting #{n.meeting}</p>
                      <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">By author #{n.author} · {new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {(!noteLoading && (notes || []).length === 0) && <p className="p-6 text-gray-500">No meeting notes found.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentTeacherMeetings;
