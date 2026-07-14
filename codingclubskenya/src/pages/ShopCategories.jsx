import { useState } from 'react';
import useApiList from '../hooks/useApiList';

const ShopCategories = () => {
  const { data: categories, loading, refresh } = useApiList('/api/shop/categories/');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await fetch('/api/shop/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      refresh();
      setShowForm(false);
      setName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop Categories</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Category</button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4">{c.name}</td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr><td colSpan="1" className="px-6 py-8 text-center text-gray-500">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Uniforms, Textbooks, Stationery" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShopCategories;
