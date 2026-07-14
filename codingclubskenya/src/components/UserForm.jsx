import { useState } from 'react';
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
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit User' : 'Add User'}</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
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
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea className="w-full border rounded px-3 py-2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
