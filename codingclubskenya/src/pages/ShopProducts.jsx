import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';

const Products = () => {
  const { data: products, loading, refresh } = useApiList('/api/shop/products/');
  const { data: categories } = useApiList('/api/shop/categories/');
  const { data: grades } = useApiList('/api/academics/grades/');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    applicable_levels: [],
    is_active: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...form,
        price: parseFloat(form.price),
        category: parseInt(form.category),
      };
      if (editingProduct) {
        await fetch(`/api/shop/products/${editingProduct.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/shop/products/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      refresh();
      setShowForm(false);
      setEditingProduct(null);
      setForm({ name: '', description: '', price: '', category: '', applicable_levels: [], is_active: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      applicable_levels: product.applicable_levels || [],
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Product</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">{p.category?.name || '-'}</td>
                <td className="px-6 py-4">KES {p.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-3">Edit</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Price (KES)</label>
              <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded px-3 py-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Applicable Grades</label>
              <select multiple className="w-full border rounded px-3 py-2" value={form.applicable_levels} onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                setForm({ ...form, applicable_levels: selected });
              }}>
                {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;
