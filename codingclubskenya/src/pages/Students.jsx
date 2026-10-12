import { useState } from 'react';
import Gradebook from './Gradebook';
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
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [parsed, setParsed] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [importError, setImportError] = useState('');

  const handleSaved = () => {
    setShowForm(false);
    setEditingUser(null);
  };

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
    <>
      {/* CBC Gradebook / Learner Profile / Report Card (template UI) */}
      <Gradebook />

      {/* Floating action bar — register / import learners (admin functions) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <button
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          title="Register New Learner"
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-12 h-12 rounded-full shadow-lg shadow-emerald-900/30 flex items-center justify-center"
        >
          <i className="fa-solid fa-user-plus"></i>
        </button>
        <button
          onClick={() => { setShowImport(true); setParsed([]); setResult(null); setImportError(''); }}
          title="Bulk Import"
          className="bg-amber-500 hover:bg-amber-600 text-white w-12 h-12 rounded-full shadow-lg shadow-amber-900/30 flex items-center justify-center"
        >
          <i className="fa-solid fa-upload"></i>
        </button>
      </div>

      {showForm && (
        <UserForm user={editingUser} onClose={() => { setShowForm(false); setEditingUser(null); }} onSaved={handleSaved} />
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Bulk Import Students</h2>
              <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>

            <p className="text-sm text-slate-600 mb-3">
              Upload a CSV (Excel → Save As CSV). Columns:{' '}
              <code className="bg-slate-100 px-1 rounded">first_name, last_name, email, password, phone, class</code>.
              The <code className="bg-slate-100 px-1 rounded">class</code> column should match an existing stream name (e.g. "Grade 7 A").
            </p>

            <div className="flex gap-3 mb-4">
              <button onClick={downloadTemplate} className="text-teal-600 hover:underline text-sm font-medium">Download template</button>
              <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
            </div>

            {importError && <p className="text-red-600 text-sm mb-3">{importError}</p>}

            {parsed.length > 0 && (
              <>
                <div className="bg-white rounded border mb-4 overflow-x-auto max-h-64">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
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
                <p className="text-sm text-slate-600 mb-3">{parsed.length} rows parsed.</p>
              </>
            )}

            {result && (
              <div className={`mb-4 p-3 rounded text-sm ${result.errors?.length ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                <p className="font-medium">
                  <i className={`fa-solid mr-1 ${result.errors?.length ? 'fa-circle-exclamation text-amber-600' : 'fa-check-circle text-emerald-600'}`}></i>
                  Imported {result.created} student(s).
                </p>
                {result.errors?.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-red-700">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 border rounded text-slate-700">Cancel</button>
              <button
                onClick={doImport}
                disabled={importing || parsed.length === 0}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {importing ? 'Importing…' : `Import ${parsed.length} student(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Students;
