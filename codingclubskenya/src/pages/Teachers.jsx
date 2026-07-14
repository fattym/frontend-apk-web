import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';
import UserForm from '../components/UserForm';

const Teachers = () => {
  const { data: users, loading: usersLoading, refresh: refreshUsers } = useApiList('/api/auth/users/?role=TEACHER');
  const { data: assignments, loading: assignmentsLoading, refresh: refreshAssignments } = useApiList('/api/academics/teacher-assignments/');
  const { data: classTeachers, loading: ctLoading, refresh: refreshCT } = useApiList('/api/academics/class-teachers/');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const handleUserSaved = () => {
    refreshUsers();
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleAssignSaved = () => {
    refreshAssignments();
    refreshCT();
    setShowAssignForm(false);
    setSelectedTeacher(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teachers</h1>
        <button onClick={() => { setEditingUser(null); setShowUserForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Teacher</button>
      </div>

      {usersLoading && <div className="p-6">Loading teachers...</div>}
      {!usersLoading && users.length === 0 && (
        <div className="bg-white rounded shadow p-6 mb-8 text-gray-500">No teachers found. Add your first teacher.</div>
      )}

      <div className="bg-white rounded shadow overflow-hidden mb-8">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.phone || '-'}</td>
                <td className="px-6 py-4">{u.school?.name || '-'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => { setEditingUser(u); setShowUserForm(true); }} className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => { setSelectedTeacher(u); setShowAssignForm(true); }} className="text-green-600 hover:underline">Assign Class</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !usersLoading && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No teachers found. Add your first teacher.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mb-4">Teacher Assignments</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learning Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-4">{a.teacher?.email || a.teacher}</td>
                <td className="px-6 py-4">{a.learning_area?.name || '-'}</td>
                <td className="px-6 py-4">{a.stream?.name || a.stream}</td>
              </tr>
            ))}
            {assignments.length === 0 && !assignmentsLoading && (
              <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No assignments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showUserForm && <UserForm user={editingUser} onClose={() => { setShowUserForm(false); setEditingUser(null); }} onSaved={handleUserSaved} />}
      {showAssignForm && <AssignTeacherForm teacher={selectedTeacher} onClose={() => { setShowAssignForm(false); setSelectedTeacher(null); }} onSaved={handleAssignSaved} />}
    </div>
  );
};

const AssignTeacherForm = ({ teacher, onClose, onSaved }) => {
  const [stream, setStream] = useState('');
  const [learningArea, setLearningArea] = useState('');
  const [streams, setStreams] = useState([]);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    Promise.all([
      fetch('/api/academics/streams/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/academics/learning-areas/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
    ]).then(([streamsData, areasData]) => {
      setStreams(Array.isArray(streamsData) ? streamsData : streamsData.results || []);
      setAreas(Array.isArray(areasData) ? areasData : areasData.results || []);
    }).catch(err => {
      console.error('Failed to load streams/learning areas:', err);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/academics/teacher-assignments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ teacher: teacher.id, stream: stream, learning_area: learningArea }),
      });
      if (!res.ok) throw new Error('Failed to assign');
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Assign Teacher to Stream</h2>
        <p className="mb-4 text-gray-600">{teacher?.first_name} {teacher?.last_name}</p>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Stream</label>
          <select className="w-full border rounded px-3 py-2" value={stream} onChange={e => setStream(e.target.value)} required>
            <option value="">Select stream</option>
            {streams.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Learning Area</label>
          <select className="w-full border rounded px-3 py-2" value={learningArea} onChange={e => setLearningArea(e.target.value)} required>
            <option value="">Select learning area</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Assign'}</button>
        </div>
      </form>
    </div>
  );
};

export default Teachers;
