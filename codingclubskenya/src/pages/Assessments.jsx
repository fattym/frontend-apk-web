import { useState } from 'react';
import useApiList from '../hooks/useApiList';
import api from '../services/api';
import Tabs from '../components/Tabs';
import BulkAssessment from './BulkAssessment';

const LEVEL_COLORS = {
  BE: 'bg-red-100 text-red-800',
  AE: 'bg-yellow-100 text-yellow-800',
  ME: 'bg-green-100 text-green-800',
  EE: 'bg-blue-100 text-blue-800',
};

const EVIDENCE_TYPES = [
  { value: 'photo', label: 'Photo of Work' },
  { value: 'document', label: 'Document' },
  { value: 'audio', label: 'Audio Recording' },
  { value: 'video', label: 'Video' },
];

const EvidenceModal = ({ assessment, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Choose a file.'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('assessment', assessment.id);
      fd.append('file', file);
      fd.append('evidence_type', evidenceType);
      fd.append('caption', caption);
      await api.post('/api/assessment/evidence/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded();
      onClose();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h3 className="text-xl font-bold">Add Evidence</h3>
        <p className="text-sm text-gray-500">Assessment #{assessment.id}</p>
        <div>
          <label className="block text-sm font-medium mb-1">File</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select className="w-full border rounded px-3 py-2" value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
            {EVIDENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Caption</label>
          <input className="w-full border rounded px-3 py-2" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm break-words">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Uploading…' : 'Upload'}</button>
        </div>
      </form>
    </div>
  );
};

const Assessments = () => {
  const [tab, setTab] = useState('list');
  const { data: assessments, loading, refresh } = useApiList('/api/assessment/assessments/');
  const [evidenceFor, setEvidenceFor] = useState(null);

  if (tab === 'bulk') return (
    <div>
      <Tabs tabs={[{ key: 'list', label: 'Assessments' }, { key: 'bulk', label: 'Bulk Entry' }]} active={tab} onChange={setTab} />
      <BulkAssessment />
    </div>
  );

  return (
    <div>
      <Tabs tabs={[{ key: 'list', label: 'Assessments' }, { key: 'bulk', label: 'Bulk Entry' }]} active={tab} onChange={setTab} />
      <h1 className="text-3xl font-bold mb-6">Competency Assessments (CBC/CBE)</h1>
      {loading ? <div>Loading…</div> : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assessments.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4">{a.learner?.email || a.learner}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{a.outcome?.description || a.outcome}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${LEVEL_COLORS[a.level_achieved] || 'bg-gray-100'}`}>{a.level_achieved}</span>
                  </td>
                  <td className="px-6 py-4">{a.term}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{a.teacher_comment}</td>
                  <td className="px-6 py-4">{(a.evidence || []).length}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setEvidenceFor(a)} className="text-blue-600 hover:underline">Add Evidence</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {evidenceFor && <EvidenceModal assessment={evidenceFor} onClose={() => setEvidenceFor(null)} onUploaded={refresh} />}
    </div>
  );
};

export default Assessments;
