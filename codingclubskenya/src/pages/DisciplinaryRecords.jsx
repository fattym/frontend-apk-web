import { useState } from 'react';
import api from '../services/api';
import useApiList from '../hooks/useApiList';
import Tabs from '../components/Tabs';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'records', label: 'Disciplinary Records' },
  { key: 'appeals', label: 'Appeals' },
];

const INCIDENT_COLORS = {
  LATE: 'bg-blue-100 text-blue-800',
  ABSENT: 'bg-gray-100 text-gray-800',
  DISRUPTION: 'bg-amber-100 text-amber-800',
  BULLYING: 'bg-red-100 text-red-800',
  DAMAGE: 'bg-orange-100 text-orange-800',
  CHEATING: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const SEVERITY_COLORS = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
};

const INCIDENT_OPTIONS = [
  { value: 'LATE', label: 'Late' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'DISRUPTION', label: 'Classroom Disruption' },
  { value: 'BULLYING', label: 'Bullying' },
  { value: 'DAMAGE', label: 'Property Damage' },
  { value: 'CHEATING', label: 'Academic Dishonesty' },
  { value: 'OTHER', label: 'Other' },
];

const SEVERITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const DisciplinaryRecords = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { data: records, loading: recLoading, refresh: refreshRecords } = useApiList('/api/discipline/records/');
  const { data: appeals, loading: appLoading, refresh: refreshAppeals } = useApiList('/api/discipline/appeals/');
  const { data: students, loading: stuLoading } = useApiList('/api/auth/users/?role=STUDENT');

  const [tab, setTab] = useState('records');
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    student: '', incident_type: 'LATE', description: '',
    action_taken: '', severity: 'LOW', parent_notified: false,
    resolved: false,
  });
  const [activeAppeal, setActiveAppeal] = useState(null);
  const [appealForm, setAppealForm] = useState({
    record: '', reason: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const studentOptions = (students || []).filter((s) => s.role === 'STUDENT');

  const submitRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (active) {
        await api.put(`/api/discipline/records/${active.id}/`, form);
      } else {
        await api.post('/api/discipline/records/', form);
      }
      setActive(null);
      setForm({
        student: '', incident_type: 'LATE', description: '',
        action_taken: '', severity: 'LOW', parent_notified: false, resolved: false,
      });
      refreshRecords();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitAppeal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (activeAppeal) {
        await api.put(`/api/discipline/appeals/${activeAppeal.id}/`, appealForm);
      } else {
        await api.post('/api/discipline/appeals/', appealForm);
      }
      setActiveAppeal(null);
      setAppealForm({ record: '', reason: '' });
      refreshAppeals();
      refreshRecords();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (id) => {
    if (!window.confirm('Delete this disciplinary record?')) return;
    try {
      await api.delete(`/api/discipline/records/${id}/`);
      refreshRecords();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const openRecordEditor = (rec) => {
    setActive(rec);
    setForm({
      student: rec.student || '',
      incident_type: rec.incident_type || 'LATE',
      description: rec.description || '',
      action_taken: rec.action_taken || '',
      severity: rec.severity || 'LOW',
      parent_notified: rec.parent_notified || false,
      resolved: rec.resolved || false,
    });
    setError('');
  };

  const openAppealEditor = (a) => {
    setActiveAppeal(a);
    setAppealForm({ record: a.record || '', reason: a.reason || '' });
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Disciplinary Records</h1>
        <span className="text-sm text-gray-500">{(tab === 'records' ? records : appeals || []).length} shown</span>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'records' && (
        <>
          {isAdmin && (
            <form onSubmit={submitRecord} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">{active ? `Edit Record #${active.id}` : 'Create Disciplinary Record'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select className="w-full border rounded px-3 py-2" required value={form.student}
                  onChange={(e) => setForm({ ...form, student: parseInt(e.target.value) })}>
                  <option value="">Select student</option>
                  {studentOptions.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Incident Type</label>
                <select className="w-full border rounded px-3 py-2" value={form.incident_type}
                  onChange={(e) => setForm({ ...form, incident_type: e.target.value })}>
                  {INCIDENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select className="w-full border rounded px-3 py-2" value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-8">
                <input type="checkbox" id="parent_notified" checked={form.parent_notified}
                  onChange={(e) => setForm({ ...form, parent_notified: e.target.checked })} />
                <label htmlFor="parent_notified" className="text-sm">Parent notified</label>
              </div>
              <div className="flex items-center gap-2 mt-8">
                <input type="checkbox" id="resolved" checked={form.resolved}
                  onChange={(e) => setForm({ ...form, resolved: e.target.checked })} />
                <label htmlFor="resolved" className="text-sm">Resolved</label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Action Taken</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} required value={form.action_taken}
                  onChange={(e) => setForm({ ...form, action_taken: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                {active && (
                  <button type="button" onClick={() => { setActive(null); setForm({ student: '', incident_type: 'LATE', description: '', action_taken: '', severity: 'LOW', parent_notified: false, resolved: false }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (active ? 'Save Changes' : 'Create Record')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {recLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (records || []).map((rec) => {
                const student = studentOptions.find((s) => s.id === rec.student);
                return (
                  <div key={rec.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{student ? `${student.first_name} ${student.last_name}` : `Student #${rec.student}`}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_COLORS[rec.severity] || 'bg-gray-100'}`}>
                          {rec.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${INCIDENT_COLORS[rec.incident_type] || 'bg-gray-100'}`}>
                          {rec.incident_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      <p className="text-xs text-gray-500">Action: {rec.action_taken}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(rec.created_at).toLocaleString()} · {rec.parent_notified ? 'Parent notified' : 'Pending notification'}
                        {rec.resolved && ' · Resolved'}
                      </p>
                      {rec.appeals && rec.appeals.length > 0 && (
                        <p className="text-xs text-purple-600 mt-1">
                          {rec.appeals.length} appeal(recalls) pending review
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => openRecordEditor(rec)} className="text-blue-600 text-sm hover:underline">Edit</button>
                        <button onClick={() => removeRecord(rec.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {(!recLoading && (records || []).length === 0) && <p className="p-6 text-gray-500">No disciplinary records found.</p>}
          </div>
        </>
      )}

      {tab === 'appeals' && (
        <>
          {isAdmin && (
            <form onSubmit={submitAppeal} className="bg-white rounded shadow p-6 mb-6">
              <h2 className="font-semibold mb-2">{activeAppeal ? `Edit Appeal #${activeAppeal.id}` : 'New Appeal'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Disciplinary Record</label>
                  <select className="w-full border rounded px-3 py-2" required value={appealForm.record}
                    onChange={(e) => setAppealForm({ ...appealForm, record: parseInt(e.target.value) })}>
                    <option value="">Select record</option>
                    {(records || []).map((r) => {
                      const student = studentOptions.find((s) => s.id === r.student);
                      return <option key={r.id} value={r.id}>{student ? student.first_name : ''} #{r.id} - {r.incident_type}</option>;
                    })}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Reason / Appeal Text</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={3} required value={appealForm.reason}
                    onChange={(e) => setAppealForm({ ...appealForm, reason: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  {activeAppeal && (
                    <button type="button" onClick={() => { setActiveAppeal(null); setAppealForm({ record: '', reason: '' }); }}
                      className="px-4 py-2 border rounded">Cancel</button>
                  )}
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving…' : (activeAppeal ? 'Save' : 'Add Appeal')}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {appLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (appeals || []).map((a) => {
                const record = records?.find((r) => r.id === a.record);
                const student = record ? studentOptions.find((s) => s.id === record.student) : null;
                return (
                  <div key={a.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{student ? `${student.first_name} ${student.last_name}` : `Record #${a.record}`}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            { PENDING: 'bg-amber-100 text-amber-800', APPROVED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800' }[a.status] || 'bg-gray-100'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{a.reason}</p>
                        <p className="text-xs text-gray-400">Submitted {new Date(a.created_at).toLocaleDateString()}</p>
                        {a.decided_by && (
                          <p className="text-xs text-gray-400">Decided by #{a.decided_by} on {new Date(a.decided_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <button onClick={() => openAppealEditor(a)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    </div>
                  </div>
                );
              })
            )}
            {(!appLoading && (appeals || []).length === 0) && <p className="p-6 text-gray-500">No appeals found.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default DisciplinaryRecords;
