import { useState } from 'react';
import useApiList from '../hooks/useApiList';
import UserForm from '../components/UserForm';

const TEMPLATE = 'first_name,last_name,email,password,phone,class\nJane,Doe,jane.doe@school.edu,Pass@1234,0712345678,Grade 7 A\n';

const splitCsvLine = (line) => {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 1; } else { q = false; }
      } else { cur += c; }
    } else if (c === '"') { q = true; } else if (c === ',') { out.push(cur); cur = ''; } else { cur += c; }
  }
  out.push(cur);
  return out;
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const obj = {};
    header.forEach((h, i) => { obj[h] = (cells[i] || '').trim(); });
    return obj;
  });
};

const Students = () => {
  const { data: users, loading, refresh } = useApiList('/api/auth/users/?role=STUDENT');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const handleSaved = () => {
    refresh();
    setShowForm(false);
    setEditingUser(null);
  };

  const [parsed, setParsed] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [importError, setImportError] = useState('');

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setParsed(parseCsv(reader.result));
    reader.readAsText(file);
    setResult(null);
    setImportError('');
  };

  const doImport = async () => {
    setImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/auth/users/bulk_import/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ students: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Import failed');
      setResult(data);
      if (data.created > 0) refresh();
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowImport(true); setParsed([]); setResult(null); setImportError(''); }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Bulk Import
          </button>
          <button
            onClick={() => { setEditingUser(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NEMIS No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adm No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.student_profile?.nemis_number || '-'}</td>
                <td className="px-6 py-4">{u.student_profile?.admission_number || '-'}</td>
                <td className="px-6 py-4">{u.school?.name || '-'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => { setEditingUser(u); setShowForm(true); }} className="text-blue-600 hover:underline mr-3">Edit</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No students found. Add your first student.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm user={editingUser} onClose={() => { setShowForm(false); setEditingUser(null); }} onSaved={handleSaved} />
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Import Students</h2>
              <button onClick={() => setShowImport(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Upload a CSV (Excel → Save As CSV). Columns:{' '}
              <code className="bg-gray-100 px-1 rounded">first_name, last_name, email, password, phone, class</code>.
              The <code className="bg-gray-100 px-1 rounded">class</code> column should match an existing stream name (e.g. "Grade 7 A").
            </p>

            <div className="flex gap-3 mb-4">
              <button onClick={downloadTemplate} className="text-blue-600 hover:underline text-sm">Download template</button>
              <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
            </div>

            {importError && <p className="text-red-600 text-sm mb-3">{importError}</p>}

            {parsed.length > 0 && (
              <>
                <div className="bg-white rounded border mb-4 overflow-x-auto max-h-64">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Phone</th>
                        <th className="px-3 py-2 text-left">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsed.slice(0, 50).map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1">{r.first_name} {r.last_name}</td>
                          <td className="px-3 py-1">{r.email}</td>
                          <td className="px-3 py-1">{r.phone}</td>
                          <td className="px-3 py-1">{r.class || r.stream}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mb-3">{parsed.length} rows parsed.</p>
              </>
            )}

            {result && (
              <div className={`mb-4 p-3 rounded text-sm ${result.errors.length ? 'bg-amber-50' : 'bg-green-50'}`}>
                <p className="font-medium">Imported {result.created} student(s).</p>
                {result.errors.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-red-700">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button
                onClick={doImport}
                disabled={importing || parsed.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Importing…' : `Import ${parsed.length} student(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
