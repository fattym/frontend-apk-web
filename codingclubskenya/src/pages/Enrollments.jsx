import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';

const Enrollments = () => {
  const { data: enrollments, loading, refresh } = useApiList('/api/academics/enrollments/');
  const { data: students } = useApiList('/api/auth/users/?role=STUDENT');
  const { data: streams } = useApiList('/api/academics/streams/');
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [streamId, setStreamId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/academics/enrollments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ student: studentId, stream: streamId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.student?.[0] || 'Failed to enroll');
      }
      refresh();
      setShowForm(false);
      setStudentId('');
      setStreamId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Enrollments</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enroll Student</button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrollments.map((e) => (
              <tr key={e.id}>
                <td className="px-6 py-4">{e.student?.email || e.student}</td>
                <td className="px-6 py-4">{e.stream?.name || e.stream}</td>
                <td className="px-6 py-4">{new Date(e.enrollment_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${e.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {e.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && !loading && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No enrollments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Enroll Student</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Student</label>
              <select className="w-full border rounded px-3 py-2" value={studentId} onChange={e => setStudentId(e.target.value)} required>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Stream</label>
              <select className="w-full border rounded px-3 py-2" value={streamId} onChange={e => setStreamId(e.target.value)} required>
                <option value="">Select stream</option>
                {streams.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Enrolling...' : 'Enroll'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Enrollments;
