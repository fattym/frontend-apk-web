import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useApiList from '../hooks/useApiList';
import Tabs from '../components/Tabs';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'records', label: 'Health Records' },
  { key: 'visits', label: 'Nurse Visits' },
];

const SEVERITY_COLORS = {
  MINOR: 'bg-green-100 text-green-800',
  MODERATE: 'bg-amber-100 text-amber-800',
  SERIOUS: 'bg-red-100 text-red-800',
};

const SEVERITY_OPTIONS = [
  { value: 'MINOR', label: 'Minor' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'SERIOUS', label: 'Serious' },
];

const HealthRecords = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { data: records, loading: recLoading, refresh: refreshRecords } = useApiList('/api/health/records/');
  const { data: visits, loading: visLoading, refresh: refreshVisits } = useApiList('/api/health/visits/');
  const { data: students, loading: stuLoading } = useApiList('/api/auth/users/?role=STUDENT');

  const [tab, setTab] = useState('records');
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    student: '', allergies: '', medications: '', medical_conditions: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  });
  const [visitForm, setVisitForm] = useState({
    student: '', health_record: '', reason: '', treatment: '',
    medication_given: '', severity: 'MINOR', parent_notified: false,
  });
  const [activeVisit, setActiveVisit] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const studentOptions = (students || []).filter((s) => s.role === 'STUDENT');

  const recordForStudent = (studentId) =>
    (records || []).find((r) => String(r.student) === String(studentId));

  const submitRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (active) {
        await api.put(`/api/health/records/${active.id}/`, form);
      } else {
        await api.post('/api/health/records/', form);
      }
      setActive(null);
      setForm({
        student: '', allergies: '', medications: '', medical_conditions: '',
        emergency_contact_name: '', emergency_contact_phone: '',
      });
      refreshRecords();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const submitVisit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (activeVisit) {
        await api.put(`/api/health/visits/${activeVisit.id}/`, visitForm);
      } else {
        await api.post('/api/health/visits/', visitForm);
      }
      setActiveVisit(null);
      setVisitForm({
        student: '', health_record: '', reason: '', treatment: '',
        medication_given: '', severity: 'MINOR', parent_notified: false,
      });
      refreshVisits();
      refreshRecords();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeVisit = async (id) => {
    if (!window.confirm('Delete this visit record?')) return;
    try {
      await api.delete(`/api/health/visits/${id}/`);
      refreshVisits();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    }
  };

  const openRecordEditor = (rec) => {
    setActive(rec);
    setForm({
      student: rec.student || '',
      allergies: rec.allergies || '',
      medications: rec.medications || '',
      medical_conditions: rec.medical_conditions || '',
      emergency_contact_name: rec.emergency_contact_name || '',
      emergency_contact_phone: rec.emergency_contact_phone || '',
    });
    setError('');
  };

  const openVisitEditor = (v) => {
    setActiveVisit(v);
    setVisitForm({
      student: v.student || '',
      health_record: v.health_record || '',
      reason: v.reason || '',
      treatment: v.treatment || '',
      medication_given: v.medication_given || '',
      severity: v.severity || 'MINOR',
      parent_notified: v.parent_notified || false,
    });
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Health Records</h1>
        <span className="text-sm text-gray-500">
          {(tab === 'records' ? records : visits || []).length} shown
        </span>
      </div>

      {error && <p className="text-red-600 text-sm break-words mb-4">{error}</p>}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'records' && (
        <>
          {isAdmin && (
            <form onSubmit={submitRecord} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">{active ? `Edit: ${active.id}` : 'Create Health Record'}</h2>
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
                <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                <input className="w-full border rounded px-3 py-2" required value={form.emergency_contact_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
                <input className="w-full border rounded px-3 py-2" required value={form.emergency_contact_phone}
                  onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Allergies</label>
                <input className="w-full border rounded px-3 py-2" value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Medications</label>
                <input className="w-full border rounded px-3 py-2" value={form.medications}
                  onChange={(e) => setForm({ ...form, medications: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Medical Conditions</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={form.medical_conditions}
                  onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                {active && (
                  <button type="button" onClick={() => { setActive(null); setForm({ student: '', allergies: '', medications: '', medical_conditions: '', emergency_contact_name: '', emergency_contact_phone: '' }); }}
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
                  <div key={rec.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{student ? `${student.first_name} ${student.last_name}` : `Student #${rec.student}`}</p>
                        <p className="text-sm text-gray-500">
                          Allergies: {rec.allergies || 'None'} · Medications: {rec.medications || 'None'}
                        </p>
                        <p className="text-xs text-gray-400">Emergency: {rec.emergency_contact_name} ({rec.emergency_contact_phone})</p>
                        {rec.medical_conditions && <p className="text-xs text-red-600 mt-1">Conditions: {rec.medical_conditions}</p>}
                      </div>
                      {isAdmin && (
                        <button onClick={() => openRecordEditor(rec)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {(!recLoading && (records || []).length === 0) && <p className="p-6 text-gray-500">No health records found.</p>}
          </div>
        </>
      )}

      {tab === 'visits' && (
        <>
          {isAdmin && (
            <form onSubmit={submitVisit} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <h2 className="font-semibold mb-2">{activeVisit ? `Edit Visit #${activeVisit.id}` : 'Add Nurse Visit'}</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select className="w-full border rounded px-3 py-2" required value={visitForm.student}
                  onChange={(e) => {
                    const sid = parseInt(e.target.value);
                    const rec = recordForStudent(sid);
                    setVisitForm({ ...visitForm, student: sid, health_record: rec?.id || '' });
                  }}>
                  <option value="">Select student</option>
                  {studentOptions.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select className="w-full border rounded px-3 py-2" value={visitForm.severity}
                  onChange={(e) => setVisitForm({ ...visitForm, severity: e.target.value })}>
                  {SEVERITY_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input className="w-full border rounded px-3 py-2" required value={visitForm.reason}
                  onChange={(e) => setVisitForm({ ...visitForm, reason: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Treatment</label>
                <input className="w-full border rounded px-3 py-2" value={visitForm.treatment}
                  onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medication Given</label>
                <input className="w-full border rounded px-3 py-2" value={visitForm.medication_given}
                  onChange={(e) => setVisitForm({ ...visitForm, medication_given: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="parent_notified" checked={visitForm.parent_notified}
                  onChange={(e) => setVisitForm({ ...visitForm, parent_notified: e.target.checked })} />
                <label htmlFor="parent_notified" className="text-sm">Parent notified</label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                {activeVisit && (
                  <button type="button" onClick={() => { setActiveVisit(null); setVisitForm({ student: '', health_record: '', reason: '', treatment: '', medication_given: '', severity: 'MINOR', parent_notified: false }); }}
                    className="px-4 py-2 border rounded">Cancel</button>
                )}
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : (activeVisit ? 'Save' : 'Add Visit')}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow divide-y">
            {visLoading ? <p className="p-6 text-gray-500">Loading…</p> : (
              (visits || []).map((v) => {
                const student = studentOptions.find((s) => s.id === v.student);
                return (
                  <div key={v.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{student ? `${student.first_name} ${student.last_name}` : `Student #${v.student}`}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_COLORS[v.severity] || 'bg-gray-100'}`}>
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{v.reason}</p>
                      {v.treatment && <p className="text-xs text-gray-500">Treatment: {v.treatment}</p>}
                      {v.medication_given && <p className="text-xs text-gray-500">Medication: {v.medication_given}</p>}
                      <p className="text-xs text-gray-400">
                        {new Date(v.created_at).toLocaleString()} · {v.parent_notified ? 'Parent notified' : 'Parent not notified'}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => openVisitEditor(v)} className="text-blue-600 text-sm hover:underline">Edit</button>
                        <button onClick={() => removeVisit(v.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {(!visLoading && (visits || []).length === 0) && <p className="p-6 text-gray-500">No nurse visits found.</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default HealthRecords;
