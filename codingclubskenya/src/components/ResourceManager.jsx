import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';
import api from '../services/api';

// A <select> whose options are fetched from an API endpoint (FK dropdowns).
const ApiSelect = ({ field, value, onChange, disabled }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(field.optionsUrl)
      .then((res) => {
        const results = res.data.results || res.data;
        const labelField = field.optionLabel || (results[0] && ('email' in results[0]) ? 'email' : 'name');
        setOptions(
          results.map((o) => ({ value: o.id, label: o[labelField] || `#${o.id}` }))
        );
      })
      .catch(() => setOptions([]))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [field.optionsUrl, field.optionLabel]);

  const common = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  return (
    <select id={`field-${field.name}`} className={common} value={value ?? ''}
      onChange={(e) => onChange(field.name, e.target.value === '' ? '' : Number(e.target.value))} disabled={disabled || loading}>
      <option value="">{loading ? 'Loading…' : 'Select…'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
};

const renderInput = (field, value, onChange, disabled) => {
  const id = `field-${field.name}`;
  const common = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (field.type === 'textarea') {
    return (
      <textarea id={id} rows={4} className={common} value={value ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)} disabled={disabled} />
    );
  }
  if (field.type === 'select') {
    if (field.optionsUrl) {
      return <ApiSelect field={field} value={value} onChange={onChange} disabled={disabled} />;
    }
    return (
      <select id={id} className={common} value={value ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)} disabled={disabled}>
        <option value="">Select…</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <input id={id} type="checkbox" className="h-5 w-5" checked={!!value}
        onChange={(e) => onChange(field.name, e.target.checked)} disabled={disabled} />
    );
  }
  return (
    <input id={id} type={field.type || 'text'} step={field.step} min={field.min}
      className={common} value={value ?? ''} placeholder={field.placeholder || ''}
      onChange={(e) => {
        const raw = e.target.value;
        if (field.type === 'number') onChange(field.name, raw === '' ? '' : Number(raw));
        else onChange(field.name, raw);
      }} disabled={disabled} />
  );
};

const ResourceManager = ({ title, endpoint, columns, fields, defaultValues = {} }) => {
  const { data, loading, error, refresh } = useApiList(endpoint);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultValues });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...defaultValues, ...item });
    setFormError(null);
    setShowForm(true);
  };

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${title.toLowerCase()} #${item.id}?`)) return;
    try {
      await api.delete(`${endpoint}${item.id}/`);
      refresh();
    } catch (err) {
      alert(err.response?.data ? JSON.stringify(err.response.data) : err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {};
      for (const [k, v] of Object.entries(form)) {
        payload[k] = v === '' ? null : v;
      }
      if (editing) await api.put(`${endpoint}${editing.id}/`, payload);
      else await api.post(endpoint, payload);
      setShowForm(false);
      refresh();
    } catch (err) {
      const d = err.response?.data;
      setFormError(d ? JSON.stringify(d) : err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add {title.replace(/s$/, '')}</button>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{c.label}</th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">{item[c.key] ?? '-'}</td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">{editing ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}</h3>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={`field-${field.name}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {renderInput(field, form[field.name], handleChange, editing && field.readOnlyOnEdit)}
                </div>
              ))}
            </div>
            {formError && <p className="mt-4 text-sm text-red-600 break-words">{formError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
