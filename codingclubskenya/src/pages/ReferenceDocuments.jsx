import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';

const ReferenceDocuments = () => {
  const { data: docs, loading, refresh } = useApiList('/api/curriculum/reference-documents/');
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('curriculum_design');
  const [learningArea, setLearningArea] = useState('');
  const [sourceNote, setSourceNote] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/academics/learning-areas/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setAreas(Array.isArray(data) ? data : data.results || []))
      .catch(err => console.error('Failed to load learning areas:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('document_type', documentType);
      formData.append('learning_area', learningArea);
      formData.append('source_note', sourceNote);
      formData.append('file', file);
      const res = await fetch('/api/curriculum/reference-documents/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      refresh();
      setShowUpload(false);
      setTitle('');
      setDocumentType('curriculum_design');
      setLearningArea('');
      setSourceNote('');
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reference Documents</h1>
        <button onClick={() => setShowUpload(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Upload Document</button>
      </div>

      {loading && <div className="p-6">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => (
          <div key={doc.id} className="bg-white rounded shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{doc.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{doc.document_type?.replace('_', ' ')}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">{doc.document_type?.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Learning Area: {doc.learning_area?.name || '-'}</p>
            <p className="text-sm text-gray-600 mb-4">Source: {doc.source_note || 'KICD official'}</p>
            <a href={doc.file} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
              Download PDF
            </a>
          </div>
        ))}
        {docs.length === 0 && !loading && (
          <div className="col-span-full bg-white rounded shadow p-8 text-center text-gray-500">
            No reference documents uploaded yet. Upload KICD curriculum designs for teachers to reference.
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Upload Reference Document</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Grade 7 Mathematics Curriculum Design" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select className="w-full border rounded px-3 py-2" value={documentType} onChange={e => setDocumentType(e.target.value)}>
                <option value="curriculum_design">KICD Curriculum Design</option>
                <option value="sample_scheme">Sample Scheme of Work</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Learning Area</label>
              <select className="w-full border rounded px-3 py-2" value={learningArea} onChange={e => setLearningArea(e.target.value)} required>
                <option value="">Select learning area</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Source Note</label>
              <input className="w-full border rounded px-3 py-2" value={sourceNote} onChange={e => setSourceNote(e.target.value)} placeholder="e.g. KICD official, kicd.ac.ke" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">PDF File</label>
              <input type="file" accept="application/pdf" className="w-full border rounded px-3 py-2" onChange={e => setFile(e.target.files[0])} required />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Uploading...' : 'Upload'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReferenceDocuments;
