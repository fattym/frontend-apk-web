import { useState } from 'react';
import useApiList from '../hooks/useApiList';

const Schools = () => {
  const { data: schools, loading, refresh } = useApiList('/api/tenants/schools/');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      
      const schoolRes = await fetch('/api/tenants/schools/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          address: form.address,
          phone: form.phone,
          email: form.email,
        }),
      });
      if (!schoolRes.ok) {
        const data = await schoolRes.json();
        throw new Error(data.name?.[0] || data.code?.[0] || 'Failed to create school');
      }
      const school = await schoolRes.json();

      await fetch('/api/auth/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          email: form.admin_email,
          password: form.admin_password,
          first_name: form.admin_first_name,
          last_name: form.admin_last_name,
          role: 'ADMIN',
          school: school.id,
        }),
      });

      refresh();
      setShowForm(false);
      setForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        admin_first_name: '',
        admin_last_name: '',
        admin_email: '',
        admin_password: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schools</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add School</button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schools.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.code}</td>
                <td className="px-6 py-4">{s.phone}</td>
                <td className="px-6 py-4">{s.email}</td>
              </tr>
            ))}
            {schools.length === 0 && !loading && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No schools yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New School</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            
            <h3 className="text-lg font-semibold mb-3">School Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">School Name</label>
                <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School Code</label>
                <input className="w-full border rounded px-3 py-2" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="e.g. my-school" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full border rounded px-3 py-2" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="w-full border rounded px-3 py-2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows="2" />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">School Admin Account</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Admin First Name</label>
                <input className="w-full border rounded px-3 py-2" value={form.admin_first_name} onChange={e => setForm({ ...form, admin_first_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Last Name</label>
                <input className="w-full border rounded px-3 py-2" value={form.admin_last_name} onChange={e => setForm({ ...form, admin_last_name: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Admin Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={form.admin_email} onChange={e => setForm({ ...form, admin_email: e.target.value })} required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Admin Password</label>
                <input type="password" className="w-full border rounded px-3 py-2" value={form.admin_password} onChange={e => setForm({ ...form, admin_password: e.target.value })} required minLength="6" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create School'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Schools;
