import { useState, useEffect } from 'react';
import Tabs from '../components/Tabs';
import useApiList from '../hooks/useApiList';
import UserForm from '../components/UserForm';

const Teachers = () => {
  const [tab, setTab] = useState('teachers');
  const { data: users, loading: usersLoading, refresh: refreshUsers } = useApiList('/api/auth/users/?role=TEACHER');
  const { data: assignments, loading: assignmentsLoading, refresh: refreshAssignments } = useApiList('/api/academics/teacher-assignments/');
  const { data: classTeachers, loading: ctLoading, refresh: refreshCT } = useApiList('/api/academics/class-teachers/');
  const { data: leaves, loading: leavesLoading, refresh: refreshLeaves } = useApiList('/api/auth/teacher-leaves/');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [leaveFormData, setLeaveFormData] = useState({});
  const [leaveError, setLeaveError] = useState('');
  const [leaveSaving, setLeaveSaving] = useState(false);

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

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveSaving(true);
    setLeaveError('');
    try {
      const token = localStorage.getItem('access_token');
      const method = leaveFormData.id ? 'PUT' : 'POST';
      const url = leaveFormData.id ? `/api/auth/teacher-leaves/${leaveFormData.id}/` : '/api/auth/teacher-leaves/';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(leaveFormData),
      });
      if (!res.ok) throw new Error('Failed to save leave request');
      setShowLeaveForm(false);
      refreshLeaves();
    } catch (err) {
      setLeaveError(err.message);
    } finally {
      setLeaveSaving(false);
    }
  };

  const openLeaveForm = (leave = null) => {
    if (leave) {
      setLeaveFormData({
        id: leave.id,
        teacher: leave.teacher,
        leave_type: leave.leave_type,
        start_date: leave.start_date,
        end_date: leave.end_date,
        number_of_days: leave.number_of_days,
        reason: leave.reason,
        supporting_document: leave.supporting_document || '',
      });
    } else {
      setLeaveFormData({
        leave_type: 'ANNUAL',
        start_date: '',
        end_date: '',
        number_of_days: 1,
        reason: '',
        supporting_document: '',
      });
    }
    setShowLeaveForm(true);
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/auth/teacher-leaves/${leaveId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ approval_status: action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action.toLowerCase()} leave`);
      refreshLeaves();
    } catch (err) {
      setLeaveError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teachers</h1>
      <Tabs
        tabs={[
          { key: 'teachers', label: 'Teachers' },
          { key: 'assignments', label: 'Assignments' },
          { key: 'leaves', label: 'Leave Requests' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'teachers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Teachers</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emp ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TSC No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-medium">{u.first_name} {u.last_name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.teacher_profile?.employee_id || '-'}</td>
                    <td className="px-6 py-4">{u.tsc_number || '-'}</td>
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
        </div>
      )}

      {tab === 'assignments' && (
        <div>
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
        </div>
      )}

      {tab === 'leaves' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Leave Requests</h2>
            <button onClick={() => openLeaveForm()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Leave Request</button>
          </div>

          {leavesLoading && <div className="p-6">Loading leave requests...</div>}
          {!leavesLoading && leaves.length === 0 && (
            <div className="bg-white rounded shadow p-6 mb-8 text-gray-500">No leave requests found.</div>
          )}

          <div className="bg-white rounded shadow overflow-hidden mb-8">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="px-6 py-4">{l.teacher?.first_name} {l.teacher?.last_name}</td>
                    <td className="px-6 py-4">{l.leave_type}</td>
                    <td className="px-6 py-4">{l.start_date}</td>
                    <td className="px-6 py-4">{l.end_date}</td>
                    <td className="px-6 py-4">{l.number_of_days}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${l.approval_status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.approval_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {l.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {l.approval_status === 'PENDING' && (
                        <>
                          <button onClick={() => handleLeaveAction(l.id, 'APPROVED')} className="text-green-600 hover:underline mr-3 text-sm">Approve</button>
                          <button onClick={() => handleLeaveAction(l.id, 'REJECTED')} className="text-red-600 hover:underline text-sm">Reject</button>
                        </>
                      )}
                      <button onClick={() => openLeaveForm(l)} className="text-blue-600 hover:underline ml-2 text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && !leavesLoading && (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No leave requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUserForm && <UserForm user={editingUser} onClose={() => { setShowUserForm(false); setEditingUser(null); }} onSaved={handleUserSaved} />}
      {showAssignForm && <AssignTeacherForm teacher={selectedTeacher} onClose={() => { setShowAssignForm(false); setSelectedTeacher(null); }} onSaved={handleAssignSaved} />}
      {showLeaveForm && <LeaveForm leave={leaveFormData} onClose={() => { setShowLeaveForm(false); setLeaveFormData({}); }} onSaved={handleLeaveSubmit} error={leaveError} saving={leaveSaving} />}
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

const LeaveForm = ({ leave, onClose, onSaved, error, saving }) => {
  const [formData, setFormData] = useState(leave || {
    leave_type: 'ANNUAL',
    start_date: '',
    end_date: '',
    number_of_days: 1,
    reason: '',
    supporting_document: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSaved?.(e);
  };

  const LEAVE_TYPES = [
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'ANNUAL', label: 'Annual Leave' },
    { value: 'CASUAL', label: 'Casual Leave' },
    { value: 'MATERNITY', label: 'Maternity Leave' },
    { value: 'STUDY', label: 'Study Leave' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{leave.id ? 'Edit Leave Request' : 'Add Leave Request'}</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Leave Type</label>
          <select className="w-full border rounded px-3 py-2" name="leave_type" value={formData.leave_type} onChange={handleChange} required>
            {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" name="start_date" value={formData.start_date} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" name="end_date" value={formData.end_date} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Number of Days</label>
          <input type="number" className="w-full border rounded px-3 py-2" name="number_of_days" value={formData.number_of_days} onChange={handleChange} min="1" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea className="w-full border rounded px-3 py-2" name="reason" value={formData.reason} onChange={handleChange} rows="3" required></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Supporting Document (URL)</label>
          <input type="url" className="w-full border rounded px-3 py-2" name="supporting_document" value={formData.supporting_document} onChange={handleChange} />
        </div>
        {leave.id && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Teacher ID (Auto-filled)</label>
            <input type="number" className="w-full border rounded px-3 py-2 bg-gray-100" name="teacher" value={formData.teacher} disabled />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : (leave.id ? 'Update' : 'Create')}</button>
        </div>
      </form>
    </div>
  );
};

export default Teachers;