import { useState, useEffect } from 'react';
import api from '../services/api';

const UserForm = ({ user, onClose, onSaved }) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    role: user?.role || 'TEACHER',
    phone: user?.phone || '',
    address: user?.address || '',
    date_of_birth: user?.date_of_birth || '',
    tsc_number: user?.tsc_number || '',
    qualification: user?.qualification || '',
    subject_specializations: user?.subject_specializations || [],
    student_profile: {
      nemis_number: user?.student_profile?.nemis_number || '',
      assessment_number: user?.student_profile?.assessment_number || '',
      admission_number: user?.student_profile?.admission_number || '',
      roll_number: user?.student_profile?.roll_number || '',
      gender: user?.student_profile?.gender || '',
      blood_group: user?.student_profile?.blood_group || '',
    },
    teacher_profile: {
      employee_id: user?.teacher_profile?.employee_id || '',
      national_id: user?.teacher_profile?.national_id || '',
      kra_pin: user?.teacher_profile?.kra_pin || '',
      gender: user?.teacher_profile?.gender || '',
      marital_status: user?.teacher_profile?.marital_status || '',
      employment_type: user?.teacher_profile?.employment_type || 'Full-Time',
    }
  });
  const [learningAreas, setLearningAreas] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.role === 'TEACHER') {
      api.get('/api/academics/learning-areas/').then((r) => setLearningAreas(r.data.results || r.data)).catch(() => setLearningAreas([]));
    }
  }, [form.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.tsc_number === '') payload.tsc_number = null;
      if (form.role !== 'TEACHER') {
        delete payload.tsc_number;
        delete payload.qualification;
        delete payload.subject_specializations;
        delete payload.teacher_profile;
      }
      if (form.role !== 'STUDENT') {
        delete payload.student_profile;
      }
      
      if (!isEdit) {
        if (!payload.password) {
          setError('Password is required');
          setSaving(false);
          return;
        }
      } else {
        delete payload.password;
      }
      if (isEdit) {
        await api.put(`/api/auth/users/${user.id}/`, payload);
      } else {
        await api.post('/api/auth/users/', payload);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const setStudentProfile = (updates) => setForm({ ...form, student_profile: { ...form.student_profile, ...updates } });
  const setTeacherProfile = (updates) => setForm({ ...form, teacher_profile: { ...form.teacher_profile, ...updates } });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        
        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Basic Info</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!isEdit && (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="w-full border rounded px-3 py-2" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="w-full border rounded px-3 py-2" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        {form.role === 'STUDENT' && (
          <>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Student Profile (CBC)</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">NEMIS Number</label>
                <input className="w-full border rounded px-3 py-2" value={form.student_profile.nemis_number} onChange={e => setStudentProfile({ nemis_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">KNEC Assessment No.</label>
                <input className="w-full border rounded px-3 py-2" value={form.student_profile.assessment_number} onChange={e => setStudentProfile({ assessment_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admission Number</label>
                <input className="w-full border rounded px-3 py-2" value={form.student_profile.admission_number} onChange={e => setStudentProfile({ admission_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select className="w-full border rounded px-3 py-2" value={form.student_profile.gender} onChange={e => setStudentProfile({ gender: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </>
        )}

        {form.role === 'TEACHER' && (
          <>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1">Teacher Profile</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input className="w-full border rounded px-3 py-2" value={form.teacher_profile.employee_id} onChange={e => setTeacherProfile({ employee_id: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TSC Number</label>
                <input className="w-full border rounded px-3 py-2" value={form.tsc_number} onChange={(e) => setForm({ ...form, tsc_number: e.target.value })} placeholder="Teachers Service Commission No." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">National ID</label>
                <input className="w-full border rounded px-3 py-2" value={form.teacher_profile.national_id} onChange={e => setTeacherProfile({ national_id: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">KRA PIN</label>
                <input className="w-full border rounded px-3 py-2" value={form.teacher_profile.kra_pin} onChange={e => setTeacherProfile({ kra_pin: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Qualification</label>
                <input className="w-full border rounded px-3 py-2" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. B.Ed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employment Type</label>
                <select className="w-full border rounded px-3 py-2" value={form.teacher_profile.employment_type} onChange={e => setTeacherProfile({ employment_type: e.target.value })}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Subject Specializations</label>
                <select multiple className="w-full border rounded px-3 py-2 h-28" value={form.subject_specializations} onChange={(e) => setForm({ ...form, subject_specializations: Array.from(e.target.selectedOptions, (o) => Number(o.value)) })}>
                  {learningAreas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
