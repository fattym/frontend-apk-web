import { useState } from 'react';
import api, { formErrorMessage } from '../services/api';
import useApiList from '../hooks/useApiList';
import useLearningAreas from '../hooks/useLearningAreas';
import { useAuth } from '../contexts/AuthContext';

const STAGES = [
  { value: 'pre_primary', label: 'Pre-Primary' },
  { value: 'primary', label: 'Primary' },
  { value: 'junior_secondary', label: 'Junior Secondary' },
  { value: 'senior_secondary', label: 'Senior Secondary' },
];

const gradeLabel = (g) => STAGES.find((s) => s.value === g?.stage)?.label || g?.stage || '-';

const FormModal = ({ title, error, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
      {children}
    </div>
  </div>
);

const GradesStreamsManager = () => {
  const { user } = useAuth();
  const schoolId = user?.school;
  const { data: streams, loading: streamsLoading, refresh: refreshStreams } = useApiList('/api/academics/streams/');
  const { data: grades, loading: gradesLoading, refresh: refreshGrades } = useApiList('/api/academics/grades/');
  const { data: learningAreas, loading: laLoading, refresh: refreshLAs } = useLearningAreas();

  const [streamForm, setStreamForm] = useState({ name: '', grade: '' });
  const [editingStream, setEditingStream] = useState(null);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [streamSaving, setStreamSaving] = useState(false);

  const [gradeForm, setGradeForm] = useState({ name: '', stage: 'primary', order: 1 });
  const [editingGrade, setEditingGrade] = useState(null);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [gradeError, setGradeError] = useState('');
  const [gradeSaving, setGradeSaving] = useState(false);

  const [laForm, setLaForm] = useState({ name: '', code: '', grade: '' });
  const [editingLA, setEditingLA] = useState(null);
  const [showLAForm, setShowLAForm] = useState(false);
  const [laError, setLaError] = useState('');
  const [laSaving, setLaSaving] = useState(false);

  const reload = () => {
    refreshStreams();
    refreshGrades();
    refreshLAs();
  };

  const openStreamForm = (stream = null) => {
    setEditingStream(stream);
    setStreamForm(stream ? { name: stream.name, grade: stream.grade } : { name: '', grade: '' });
    setStreamError('');
    setShowStreamForm(true);
  };
  const closeStreamForm = () => {
    setShowStreamForm(false);
    setEditingStream(null);
    setStreamForm({ name: '', grade: '' });
  };
  const saveStream = async (e) => {
    e.preventDefault();
    setStreamSaving(true);
    setStreamError('');
    try {
      const payload = { name: streamForm.name, grade: Number(streamForm.grade) };
      if (schoolId) payload.school = schoolId;
      if (editingStream) {
        await api.put(`/api/academics/streams/${editingStream.id}/`, payload);
      } else {
        await api.post('/api/academics/streams/', payload);
      }
      closeStreamForm();
      reload();
    } catch (err) {
      setStreamError(formErrorMessage(err, 'Could not save stream.'));
    } finally {
      setStreamSaving(false);
    }
  };
  const deleteStream = async (id) => {
    if (!confirm('Delete this stream?')) return;
    try {
      await api.delete(`/api/academics/streams/${id}/`);
      reload();
    } catch (err) {
      alert(formErrorMessage(err, 'Could not delete stream.'));
    }
  };

  const openGradeForm = (grade = null) => {
    setEditingGrade(grade);
    setGradeForm(
      grade
        ? { name: grade.name, stage: grade.stage, order: grade.order }
        : { name: '', stage: 'primary', order: 1 },
    );
    setGradeError('');
    setShowGradeForm(true);
  };
  const closeGradeForm = () => {
    setShowGradeForm(false);
    setEditingGrade(null);
    setGradeForm({ name: '', stage: 'primary', order: 1 });
  };
  const saveGrade = async (e) => {
    e.preventDefault();
    setGradeSaving(true);
    setGradeError('');
    try {
      const payload = {
        name: gradeForm.name,
        stage: gradeForm.stage,
        order: Number(gradeForm.order),
      };
      if (editingGrade) {
        await api.put(`/api/academics/grades/${editingGrade.id}/`, payload);
      } else {
        await api.post('/api/academics/grades/', payload);
      }
      closeGradeForm();
      reload();
    } catch (err) {
      setGradeError(formErrorMessage(err, 'Could not save grade.'));
    } finally {
      setGradeSaving(false);
    }
  };
  const deleteGrade = async (id) => {
    if (!confirm('Deleting a grade also deletes its streams. Continue?')) return;
    try {
      await api.delete(`/api/academics/grades/${id}/`);
      reload();
    } catch (err) {
      alert(formErrorMessage(err, 'Could not delete grade.'));
    }
  };

  const openLAForm = (la = null) => {
    setEditingLA(la);
    setLaForm(la ? { name: la.name, code: la.code, grade: la.grade } : { name: '', code: '', grade: '' });
    setLaError('');
    setShowLAForm(true);
  };
  const closeLAForm = () => {
    setShowLAForm(false);
    setEditingLA(null);
    setLaForm({ name: '', code: '', grade: '' });
  };
  const saveLA = async (e) => {
    e.preventDefault();
    setLaSaving(true);
    setLaError('');
    try {
      const payload = { name: laForm.name, code: laForm.code, grade: Number(laForm.grade) };
      if (schoolId) payload.school = schoolId;
      if (editingLA) {
        await api.put(`/api/academics/learning-areas/${editingLA.id}/`, payload);
      } else {
        await api.post('/api/academics/learning-areas/', payload);
      }
      closeLAForm();
      reload();
    } catch (err) {
      setLaError(formErrorMessage(err, 'Could not save learning area.'));
    } finally {
      setLaSaving(false);
    }
  };
  const deleteLA = async (id) => {
    if (!confirm('Delete this learning area?')) return;
    try {
      await api.delete(`/api/academics/learning-areas/${id}/`);
      reload();
    } catch (err) {
      alert(formErrorMessage(err, 'Could not delete learning area.'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Streams (Classes)</h3>
        <button
          onClick={() => openStreamForm()}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          Add Stream
        </button>
      </div>

      {streamsLoading && <p className="text-sm text-gray-500 mb-3">Loading streams...</p>}
      {!streamsLoading && (
        <div className="bg-white rounded shadow overflow-x-auto mb-8">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {streams.map((s) => {
                const g = grades.find((gr) => gr.id === s.grade) || {};
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{g.name || s.grade || '-'}</td>
                    <td className="px-4 py-2">{g.id ? gradeLabel(g) : '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openStreamForm(s)}
                        className="text-blue-600 hover:underline mr-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStream(s.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {streams.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No streams yet. Add a stream to create a class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showStreamForm && (
        <FormModal title={editingStream ? 'Edit Stream' : 'Add Stream'} error={streamError}>
          <form onSubmit={saveStream} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stream Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={streamForm.name}
                onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grade</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={streamForm.grade}
                onChange={(e) => setStreamForm({ ...streamForm, grade: e.target.value })}
                required
              >
                <option value="">Select a grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({gradeLabel(g)})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeStreamForm}
                className="px-3 py-1.5 border rounded"
                disabled={streamSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={streamSaving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {streamSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="flex justify-between items-center mb-3 mt-6">
        <h3 className="text-lg font-semibold">Learning Areas</h3>
        <button
          onClick={() => openLAForm()}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          Add Learning Area
        </button>
      </div>
      {laLoading && <p className="text-sm text-gray-500 mb-3">Loading learning areas...</p>}
      {!laLoading && (
        <div className="bg-white rounded shadow overflow-x-auto mb-8">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {learningAreas.map((la) => {
                const g = grades.find((gr) => gr.id === la.grade) || {};
                return (
                  <tr key={la.id}>
                    <td className="px-4 py-2">{la.name}</td>
                    <td className="px-4 py-2">{la.code}</td>
                    <td className="px-4 py-2">{g.name || la.grade || '-'}</td>
                    <td className="px-4 py-2">{g.id ? gradeLabel(g) : '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openLAForm(la)}
                        className="text-blue-600 hover:underline mr-2 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLA(la.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {learningAreas.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No learning areas yet. Add one to enable teacher assignments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showLAForm && (
        <FormModal title={editingLA ? 'Edit Learning Area' : 'Add Learning Area'} error={laError}>
          <form onSubmit={saveLA} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={laForm.name}
                onChange={(e) => setLaForm({ ...laForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={laForm.code}
                onChange={(e) => setLaForm({ ...laForm, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grade</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={laForm.grade}
                onChange={(e) => setLaForm({ ...laForm, grade: e.target.value })}
                required
              >
                <option value="">Select a grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({gradeLabel(g)})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeLAForm}
                className="px-3 py-1.5 border rounded"
                disabled={laSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={laSaving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {laSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="flex justify-between items-center mb-3 mt-6">
        <h3 className="text-lg font-semibold">Grades (Catalogue)</h3>
        <button
          onClick={() => openGradeForm()}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          Add Grade
        </button>
      </div>

      {gradesLoading && <p className="text-sm text-gray-500 mb-3">Loading grades...</p>}
      {!gradesLoading && (
        <div className="bg-white rounded shadow overflow-x-auto mb-8">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-2">{g.name}</td>
                  <td className="px-4 py-2">{gradeLabel(g)}</td>
                  <td className="px-4 py-2">{g.order}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openGradeForm(g)}
                      className="text-blue-600 hover:underline mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGrade(g.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No grades found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showGradeForm && (
        <FormModal title={editingGrade ? 'Edit Grade' : 'Add Grade'} error={gradeError}>
          <form onSubmit={saveGrade} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={gradeForm.name}
                onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={gradeForm.stage}
                onChange={(e) => setGradeForm({ ...gradeForm, stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-3 py-2"
                value={gradeForm.order}
                onChange={(e) => setGradeForm({ ...gradeForm, order: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeGradeForm}
                className="px-3 py-1.5 border rounded"
                disabled={gradeSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={gradeSaving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {gradeSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default GradesStreamsManager;
