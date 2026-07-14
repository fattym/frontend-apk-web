import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [refDocs, setRefDocs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, timeRes, assessRes, schemesRes, docsRes] = await Promise.all([
          api.get('/api/academics/teacher-assignments/'),
          api.get('/api/academics/timetable/'),
          api.get('/api/assessment/assessments/'),
          api.get('/api/curriculum/schemes/'),
          api.get('/api/curriculum/reference-documents/'),
        ]);
        setAssignments(assignRes.data.results || assignRes.data);
        setTimetable(timeRes.data.results || timeRes.data);
        setRecentAssessments(assessRes.data.results || assessRes.data);
        setSchemes(schemesRes.data.results || schemesRes.data);
        setRefDocs(docsRes.data.results || docsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showGenerate) {
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
    }
  }, [showGenerate]);

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
      setSchemes(prev => [data, ...prev]);
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
      setSchemes(prev => prev.map(s => s.id === data.id ? data : s));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.first_name} {user?.last_name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Classes Taught</h3>
          <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Timetable Slots</h3>
          <p className="text-3xl font-bold text-green-600">{timetable.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500 text-sm">Schemes of Work</h3>
          <p className="text-3xl font-bold text-purple-600">{schemes.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">My Teaching Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learning Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4">{a.stream?.name || a.stream}</td>
                    <td className="px-6 py-4">{a.learning_area?.name || a.learning_area}</td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan="2" className="px-6 py-8 text-center text-gray-500">No assignments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Reference Documents</h2>
          </div>
          <div className="p-6">
            {refDocs.length === 0 ? (
              <p className="text-gray-500">No reference documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {refDocs.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">{doc.title}</p>
                      <p className="text-xs text-gray-500">{doc.learning_area?.name} • {doc.document_type?.replace('_', ' ')}</p>
                    </div>
                    <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Download</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow mb-8">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Schemes of Work</h2>
          <button onClick={() => setShowGenerate(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Generate Scheme</button>
        </div>
        {selectedScheme ? (
          <div>
            <div className="px-6 py-3 bg-gray-50 border-b flex justify-between items-center">
              <div>
                <span className="font-medium">{selectedScheme.learning_area?.name} - {selectedScheme.stream?.name}</span>
                <span className="ml-3 text-sm text-gray-600">Term: {selectedScheme.term?.name} | Status: <span className="capitalize">{selectedScheme.status}</span></span>
              </div>
              <button onClick={() => setSelectedScheme(null)} className="text-blue-600 hover:underline text-sm">Back to list</button>
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
                        <textarea className="w-full border rounded px-2 py-1 text-sm" rows="3" value={week.specific_learning_outcomes || ''} onChange={(e) => handleUpdateWeek(week.id, 'specific_learning_outcomes', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <textarea className="w-full border rounded px-2 py-1 text-sm" rows="2" value={week.key_inquiry_question || ''} onChange={(e) => handleUpdateWeek(week.id, 'key_inquiry_question', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <textarea className="w-full border rounded px-2 py-1 text-sm" rows="2" value={week.learning_experiences || ''} onChange={(e) => handleUpdateWeek(week.id, 'learning_experiences', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <textarea className="w-full border rounded px-2 py-1 text-sm" rows="2" value={week.learning_resources || ''} onChange={(e) => handleUpdateWeek(week.id, 'learning_resources', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <textarea className="w-full border rounded px-2 py-1 text-sm" rows="2" value={week.assessment_method || ''} onChange={(e) => handleUpdateWeek(week.id, 'assessment_method', e.target.value)} />
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
          <div className="overflow-x-auto">
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
                {schemes.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No schemes yet. Generate your first scheme of work.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default TeacherDashboard;
