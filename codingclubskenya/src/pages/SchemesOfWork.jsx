import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';

const STANDARD_FIELDS = [
  { key: 'week_number', label: 'Week Number' },
  { key: 'strand_name', label: 'Strand Name' },
  { key: 'sub_strand_name', label: 'Sub-Strand Name' },
  { key: 'specific_learning_outcomes', label: 'Learning Outcomes' },
  { key: 'key_inquiry_question', label: 'Key Inquiry Question' },
  { key: 'learning_experiences', label: 'Learning Experiences' },
  { key: 'learning_resources', label: 'Learning Resources' },
  { key: 'assessment_method', label: 'Assessment Method' },
];

const SchemesOfWork = () => {
  const { data: schemes, loading, refresh } = useApiList('/api/curriculum/schemes/');
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [streams, setStreams] = useState([]);
  const [areas, setAreas] = useState([]);
  const [terms, setTerms] = useState([]);
  const [streamId, setStreamId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [termId, setTermId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [columnMappings, setColumnMappings] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    Promise.all([
      fetch('/api/academics/streams/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/academics/learning-areas/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/academics/terms/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
    ]).then(([streamsData, areas, terms]) => {
      setStreams(Array.isArray(streamsData) ? streamsData : streamsData.results || []);
      setAreas(Array.isArray(areas) ? areas : areas.results || []);
      setTerms(Array.isArray(terms) ? terms : terms.results || []);
    }).catch(err => console.error('Failed to load form data:', err));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/curriculum/schemes/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ learning_area: areaId, term: termId, stream: streamId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to generate scheme');
      }
      const data = await res.json();
      refresh();
      setSelectedScheme(data);
      setShowGenerate(false);
      setStreamId('');
      setAreaId('');
      setTermId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/curriculum/schemes/download_template/', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      setError('Failed to download template');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scheme_of_work_template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleParseFile = async () => {
    if (!uploadFile) {
      setError('Please select a file.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await fetch('/api/curriculum/schemes/parse/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to parse file');
      }
      const data = await res.json();
      setParseResult(data);
      const initialMappings = {};
      STANDARD_FIELDS.forEach(f => {
        if (data.column_mapping && data.column_mapping[f.key]) {
          initialMappings[f.key] = data.column_mapping[f.key]['index'];
        } else {
          initialMappings[f.key] = '';
        }
      });
      setColumnMappings(initialMappings);
      setShowPreview(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmImport = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('learning_area', areaId);
      formData.append('term', termId);
      formData.append('stream', streamId);
      const res = await fetch('/api/curriculum/schemes/upload/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to upload scheme');
      }
      const data = await res.json();
      refresh();
      setSelectedScheme(data.scheme);
      setShowUpload(false);
      setShowPreview(false);
      setUploadFile(null);
      setParseResult(null);
      setStreamId('');
      setAreaId('');
      setTermId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWeek = async (weekId, field, value) => {
    const token = localStorage.getItem('access_token');
    await fetch(`/api/curriculum/schemes/weeks/${weekId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ [field]: value }),
    });
    if (selectedScheme) {
      const res = await fetch(`/api/curriculum/schemes/${selectedScheme.id}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedScheme(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schemes of Work</h1>
        <div className="flex gap-2">
          <button onClick={handleDownloadTemplate} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Download Template</button>
          <button onClick={() => setShowGenerate(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Generate Scheme</button>
          <button onClick={() => setShowUpload(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Upload Scheme</button>
        </div>
      </div>

      {loading && <div className="p-6">Loading...</div>}

      {selectedScheme ? (
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{selectedScheme.learning_area?.name} - {selectedScheme.stream?.name}</h2>
              <p className="text-sm text-gray-600">Term: {selectedScheme.term?.name} | Status: <span className="capitalize">{selectedScheme.status}</span></p>
            </div>
            <button onClick={() => setSelectedScheme(null)} className="text-blue-600 hover:underline">Back to list</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub-strand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learning Outcomes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiry Question</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learning Experiences</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resources</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedScheme.weeks?.map((week) => (
                  <tr key={week.id}>
                    <td className="px-4 py-3 font-medium">{week.week_number}</td>
                    <td className="px-4 py-3">{week.strand?.name || '-'}</td>
                    <td className="px-4 py-3">{week.sub_strand?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows="3"
                        value={week.specific_learning_outcomes || ''}
                        onChange={(e) => handleUpdateWeek(week.id, 'specific_learning_outcomes', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows="2"
                        value={week.key_inquiry_question || ''}
                        onChange={(e) => handleUpdateWeek(week.id, 'key_inquiry_question', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows="2"
                        value={week.learning_experiences || ''}
                        onChange={(e) => handleUpdateWeek(week.id, 'learning_experiences', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows="2"
                        value={week.learning_resources || ''}
                        onChange={(e) => handleUpdateWeek(week.id, 'learning_resources', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows="2"
                        value={week.assessment_method || ''}
                        onChange={(e) => handleUpdateWeek(week.id, 'assessment_method', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
                {(!selectedScheme.weeks || selectedScheme.weeks.length === 0) && (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No weeks generated yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learning Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schemes.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedScheme(s)}>
                  <td className="px-6 py-4 font-medium">{s.learning_area?.name || s.learning_area}</td>
                   <td className="px-6 py-4">{s.stream?.name || s.stream}</td>
                  <td className="px-6 py-4">{s.term?.name || s.term}</td>
                  <td className="px-6 py-4 capitalize">{s.status}</td>
                  <td className="px-6 py-4">{new Date(s.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {schemes.length === 0 && !loading && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No schemes yet. Generate your first scheme of work.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleGenerate} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Generate Scheme of Work</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Stream</label>
              <select className="w-full border rounded px-3 py-2" value={streamId} onChange={e => setStreamId(e.target.value)} required>
                <option value="">Select stream</option>
                {streams.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Learning Area</label>
              <select className="w-full border rounded px-3 py-2" value={areaId} onChange={e => setAreaId(e.target.value)} required>
                <option value="">Select learning area</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Term</label>
              <select className="w-full border rounded px-3 py-2" value={termId} onChange={e => setTermId(e.target.value)} required>
                <option value="">Select term</option>
                {terms.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.academic_year})</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowGenerate(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Generating...' : 'Generate'}</button>
            </div>
          </form>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={(e) => { e.preventDefault(); handleParseFile(); }} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Upload Scheme of Work</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Stream</label>
              <select className="w-full border rounded px-3 py-2" value={streamId} onChange={e => setStreamId(e.target.value)} required>
                <option value="">Select stream</option>
                {streams.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Learning Area</label>
              <select className="w-full border rounded px-3 py-2" value={areaId} onChange={e => setAreaId(e.target.value)} required>
                <option value="">Select learning area</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Term</label>
              <select className="w-full border rounded px-3 py-2" value={termId} onChange={e => setTermId(e.target.value)} required>
                <option value="">Select term</option>
                {terms.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.academic_year})</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">File (CSV or Excel)</label>
              <input type="file" accept=".csv,.xlsx,.xls" className="w-full border rounded px-3 py-2" onChange={(e) => setUploadFile(e.target.files[0])} required />
              <p className="text-xs text-gray-500 mt-1">Upload any table format. We will auto-detect columns.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowUpload(false); setUploadFile(null); }} className="px-4 py-2 border rounded">Cancel</button>
              <button type="button" onClick={handleParseFile} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Parsing...' : 'Next: Preview'}</button>
            </div>
          </form>
        </div>
      )}

      {showPreview && parseResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-6xl max-h-screen overflow-auto">
            <h2 className="text-xl font-bold mb-2">Preview & Map Columns</h2>
            <p className="text-sm text-gray-600 mb-4">
              Detected {parseResult.total_rows} rows. We auto-mapped {Object.keys(parseResult.column_mapping || {}).length} columns. Review the preview and confirm mappings below.
            </p>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Column Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STANDARD_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <label className="w-48 text-sm font-medium">{field.label}</label>
                    <select
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={columnMappings[field.key] || ''}
                      onChange={(e) => setColumnMappings({ ...columnMappings, [field.key]: e.target.value ? Number(e.target.value) : '' })}
                    >
                      <option value="">-- Not mapped --</option>
                      {(parseResult.headers || []).map((h, idx) => (
                        <option key={idx} value={idx}>{h}</option>
                      ))}
                    </select>
                    {parseResult.column_mapping && parseResult.column_mapping[field.key] && (
                      <span className="text-xs text-green-600">
                        Auto-detected ({Math.round((parseResult.column_mapping[field.key].confidence || 0) * 100)}%)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Preview (first {Math.min(10, parseResult.preview?.length || 0)} rows)</h3>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {STANDARD_FIELDS.map((f) => (
                        <th key={f.key} className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(parseResult.preview || []).slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {STANDARD_FIELDS.map((f) => (
                          <td key={f.key} className="px-2 py-2 max-w-xs truncate">{row[f.key] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {parseResult.unmapped_headers && parseResult.unmapped_headers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Unmapped Columns</h3>
                <p className="text-xs text-gray-500">These columns were not recognized and will be ignored: {parseResult.unmapped_headers.map(h => h.header).join(', ')}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowPreview(false); setParseResult(null); }} className="px-4 py-2 border rounded">Cancel</button>
              <button type="button" onClick={handleConfirmImport} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{saving ? 'Importing...' : 'Confirm & Import'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemesOfWork;
