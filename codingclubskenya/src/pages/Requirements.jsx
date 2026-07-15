import { useState, useEffect, useMemo } from 'react';
import useApiList from '../hooks/useApiList';

const Requirements = () => {
  const { data: items, loading, refresh } = useApiList('/api/requirements/items/');
  const { data: grades } = useApiList('/api/academics/grades/');
  const { data: terms } = useApiList('/api/academics/terms/');
  const { data: schoolProducts } = useApiList('/api/shop/products/');
  const { data: distributorProducts } = useApiList('/api/distributor/products/');
  
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    class_level: '',
    term: '',
    is_mandatory: true,
    allow_external_purchase: true,
    preferred_source: 'school',
    is_published: false,
  });
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [optionItemId, setOptionItemId] = useState(null);
  const [optionForm, setOptionForm] = useState({
    source_type: 'school',
    price: '',
    distributor: '',
    location: '',
    delivery_available: false,
    linked_product: '',
    linked_distributor_product: '',
    is_recommended: false,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredDistributorProducts = useMemo(() => {
    if (!distributorProducts || !searchQuery.trim()) return [];
    return distributorProducts.filter((p) => 
      p.is_active && p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [distributorProducts, searchQuery]);

  const schoolProductMap = useMemo(() => {
    if (!schoolProducts) return {};
    const map = {};
    schoolProducts.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [schoolProducts]);

  const distributorProductMap = useMemo(() => {
    if (!distributorProducts) return {};
    const map = {};
    distributorProducts.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [distributorProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        class_level: parseInt(formData.class_level, 10),
        term: parseInt(formData.term, 10),
      };
      if (editingItem) {
        await fetch(`/api/requirements/items/${editingItem.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        setMessage('Item updated successfully');
      } else {
        await fetch('/api/requirements/items/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        setMessage('Item created successfully');
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        class_level: '',
        term: '',
        is_mandatory: true,
        allow_external_purchase: true,
        preferred_source: 'school',
        is_published: false,
      });
      refresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...optionForm,
        price: parseFloat(optionForm.price),
        required_item: optionItemId,
        linked_product: optionForm.linked_product ? parseInt(optionForm.linked_product, 10) : null,
        linked_distributor_product: optionForm.linked_distributor_product ? parseInt(optionForm.linked_distributor_product, 10) : null,
        distributor: optionForm.distributor ? parseInt(optionForm.distributor, 10) : null,
      };
      const res = await fetch('/api/requirements/options/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to add option');
      }
      setMessage('Option added successfully');
      setShowOptionForm(false);
      setOptionItemId(null);
      setOptionForm({
        source_type: 'school',
        price: '',
        distributor: '',
        location: '',
        delivery_available: false,
        linked_product: '',
        linked_distributor_product: '',
        is_recommended: false,
      });
      setSearchQuery('');
      refresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/requirements/items/${item.id}/publish/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setMessage('Published successfully');
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleUnpublish = async (item) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/api/requirements/items/${item.id}/unpublish/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setMessage('Unpublished successfully');
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const openOptionForm = (itemId) => {
    setOptionItemId(itemId);
    setShowOptionForm(true);
  };

  if (loading) {
    return <div className="text-lg">Loading requirements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Required Items</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Define what students need each term</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
            setFormData({
              name: '',
              description: '',
              class_level: '',
              term: '',
              is_mandatory: true,
              allow_external_purchase: true,
              preferred_source: 'school',
              is_published: false,
            });
          }}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Add Required Item
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            {editingItem ? 'Edit Required Item' : 'New Required Item'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Item Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                placeholder="e.g. English Book, School Uniform"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Class / Grade</label>
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                <option value="">Select grade</option>
                {grades?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                <option value="">Select term</option>
                {terms?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_mandatory"
                checked={formData.is_mandatory}
                onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <label htmlFor="is_mandatory" className="text-sm text-zinc-700 dark:text-zinc-300">Mandatory</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allow_external"
                checked={formData.allow_external_purchase}
                onChange={(e) => setFormData({ ...formData, allow_external_purchase: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <label htmlFor="allow_external" className="text-sm text-zinc-700 dark:text-zinc-300">Allow external purchase</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Preferred Source</label>
              <select
                value={formData.preferred_source}
                onChange={(e) => setFormData({ ...formData, preferred_source: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-300 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                <option value="school">School</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingItem(null); }}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showOptionForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Add Option</h2>
          <form onSubmit={handleAddOption} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Source Type</label>
              <select
                value={optionForm.source_type}
                onChange={(e) => setOptionForm({ ...optionForm, source_type: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              >
                <option value="school">School Supply</option>
                <option value="distributor">Distributor Supply</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price (KES)</label>
              <input
                type="number"
                step="0.01"
                value={optionForm.price}
                onChange={(e) => setOptionForm({ ...optionForm, price: e.target.value })}
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            {optionForm.source_type === 'school' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Link School Product</label>
                <select
                  value={optionForm.linked_product}
                  onChange={(e) => setOptionForm({ ...optionForm, linked_product: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                >
                  <option value="">Select product</option>
                  {schoolProducts?.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - KES {p.price}</option>
                  ))}
                </select>
              </div>
            )}
            {optionForm.source_type === 'distributor' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Search Distributor Products</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                  {filteredDistributorProducts.length > 0 && (
                    <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-md max-h-48 overflow-y-auto">
                      {filteredDistributorProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setOptionForm({ ...optionForm, linked_distributor_product: p.id.toString(), price: p.unit_price, distributor: p.distributor.toString() });
                            setSearchQuery(p.name);
                          }}
                          className="px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                        >
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.name}</p>
                          <p className="text-xs text-zinc-500">{p.distributor_name} - KES {p.unit_price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Distributor</label>
                  <input
                    type="text"
                    value={optionForm.distributor}
                    onChange={(e) => setOptionForm({ ...optionForm, distributor: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={optionForm.location}
                    onChange={(e) => setOptionForm({ ...optionForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    placeholder="e.g. Westlands"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="delivery"
                    checked={optionForm.delivery_available}
                    onChange={(e) => setOptionForm({ ...optionForm, delivery_available: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <label htmlFor="delivery" className="text-sm text-zinc-700 dark:text-zinc-300">Delivery Available</label>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommended"
                checked={optionForm.is_recommended}
                onChange={(e) => setOptionForm({ ...optionForm, is_recommended: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <label htmlFor="recommended" className="text-sm text-zinc-700 dark:text-zinc-300">Mark as Recommended</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Option'}
              </button>
              <button
                type="button"
                onClick={() => { setShowOptionForm(false); setOptionItemId(null); setSearchQuery(''); }}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {(items || []).length === 0 && !loading && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 text-center text-zinc-500">
            No required items yet. Create your first item list above.
          </div>
        )}
        {(items || []).map((item) => (
          <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${item.is_mandatory ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {item.is_mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${item.is_published ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {item.class_level?.name} • {item.term?.name} • Preferred: {item.preferred_source}
                  </p>
                  {item.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openOptionForm(item.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Option
                  </button>
                  {item.is_published ? (
                    <button
                      onClick={() => handleUnpublish(item)}
                      className="px-3 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublish(item)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>

              {item.options.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.options.map((option) => {
                      const schoolProduct = option.linked_product ? schoolProductMap[option.linked_product] : null;
                      const distProduct = option.linked_distributor_product ? distributorProductMap[option.linked_distributor_product] : null;
                      return (
                        <div key={option.id} className={`p-3 rounded-lg border ${option.is_recommended ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${option.source_type === 'school' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                              {option.source_type === 'school' ? '🏫 School' : '🏢 Distributor'}
                            </span>
                            {option.is_recommended && (
                              <span className="text-xs text-green-600 dark:text-green-400">✅ Recommended</span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">KES {parseFloat(option.price).toLocaleString()}</p>
                          {schoolProduct && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{schoolProduct.name}</p>
                          )}
                          {distProduct && (
                            <div className="mt-1">
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">{distProduct.name}</p>
                              {option.location && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">📍 {option.location}</p>
                              )}
                              {option.delivery_available && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">🚚 Delivery Available</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Requirements;
