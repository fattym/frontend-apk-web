import { useState, useEffect } from 'react';
import api from '../services/api';

const LEVELS = [
  { value: 'BE', label: 'BE — Below Expectation' },
  { value: 'AE', label: 'AE — Approaching' },
  { value: 'ME', label: 'ME — Meeting' },
  { value: 'EE', label: 'EE — Exceeding' },
];
const LEVEL_COLORS = {
  BE: 'bg-red-100 text-red-800',
  AE: 'bg-yellow-100 text-yellow-800',
  ME: 'bg-green-100 text-green-800',
  EE: 'bg-blue-100 text-blue-800',
};

const PENDING_KEY = 'pendingBulkAssessments';

const BulkAssessment = () => {
  const [streams, setStreams] = useState([]);
  const [terms, setTerms] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [students, setStudents] = useState([]);

  const [stream, setStream] = useState('');
  const [term, setTerm] = useState('');
  const [outcome, setOutcome] = useState('');

  const [rows, setRows] = useState({}); // learnerId -> { level, comment }
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const get = (url) => api.get(url).then((r) => r.data.results || r.data).catch(() => []);
    get('/api/academics/streams/').then(setStreams);
    get('/api/academics/terms/').then(setTerms);
    get('/api/academics/learning-outcomes/').then(setOutcomes);
    get('/api/auth/users/?role=STUDENT').then(setStudents);
    const saved = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    setPending(saved);
  }, []);

  // Load learners for the selected stream + prefill from existing assessments.
  useEffect(() => {
    if (!stream || !term || !outcome) {
      setRows({});
      return;
    }
    let active = true;
    (async () => {
      const enrollments = await api.get(`/api/academics/enrollments/?stream=${stream}`)
        .then((r) => r.data.results || r.data).catch(() => []);
      const learnerIds = enrollments.map((e) => e.student).filter(Boolean);
      const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));

      const existing = await api.get('/api/assessment/assessments/')
        .then((r) => r.data.results || r.data).catch(() => []);
      const prefill = {};
      learnerIds.forEach((lid) => {
        const ex = existing.find((a) => a.learner === lid && a.outcome === Number(outcome) && a.term === Number(term));
        prefill[lid] = { level: ex?.level_achieved || '', comment: ex?.teacher_comment || '' };
      });
      if (active) setRows(prefill);
    })();
    return () => { active = false; };
  }, [stream, term, outcome, students]);

  const setRow = (learnerId, patch) =>
    setRows((r) => ({ ...r, [learnerId]: { ...r[learnerId], ...patch } }));

  const persistPending = (list) => {
    setPending(list);
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  };

  const buildPayload = (currentRows) => ({
    outcome_id: Number(outcome),
    term_id: Number(term),
    assessments: Object.entries(currentRows)
      .filter(([, v]) => v.level)
      .map(([learnerId, v]) => ({
        learner_id: Number(learnerId),
        level: v.level,
        comment: v.comment || '',
        client_uuid: (crypto.randomUUID?.() || `${Date.now()}-${learnerId}-${Math.random()}`),
      })),
  });

  const sendBulk = async (payload) => {
    const res = await api.post('/api/assessment/bulk/', payload);
    return res.data.results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const payload = buildPayload(rows);
      if (payload.assessments.length === 0) {
        setMessage('Select a level for at least one learner.');
        return;
      }
      const results = await sendBulk(payload);
      const created = results.filter((r) => r.status === 'created' || r.status === 'updated').length;
      const errors = results.filter((r) => r.status === 'error');
      setMessage(`Saved ${created} assessment(s).${errors.length ? ` ${errors.length} skipped.` : ''}`);
    } catch (err) {
      // Offline / network failure: queue for retry (idempotent via client_uuid).
      const queued = buildPayload(rows);
      const next = [...pending, { ...queued, queuedAt: new Date().toISOString() }];
      persistPending(next);
      setMessage('Offline — saved locally and queued for sync.');
    } finally {
      setSubmitting(false);
    }
  };

  const retryPending = async () => {
    const remaining = [];
    for (const batch of pending) {
      try {
        await sendBulk(batch);
      } catch {
        remaining.push(batch);
      }
    }
    persistPending(remaining);
    setMessage(remaining.length ? `${remaining.length} batch(es) still pending.` : 'All pending synced.');
  };

  const learnerRows = Object.entries(rows);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bulk Assessment (Gradebook)</h1>
        {pending.length > 0 && (
          <button onClick={retryPending} className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600">
            Sync {pending.length} pending
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stream</label>
          <select className="w-full border rounded px-3 py-2" value={stream} onChange={(e) => setStream(e.target.value)} required>
            <option value="">Select…</option>
            {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Term</label>
          <select className="w-full border rounded px-3 py-2" value={term} onChange={(e) => setTerm(e.target.value)} required>
            <option value="">Select…</option>
            {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Learning Outcome</label>
          <select className="w-full border rounded px-3 py-2" value={outcome} onChange={(e) => setOutcome(e.target.value)} required>
            <option value="">Select…</option>
            {outcomes.map((o) => <option key={o.id} value={o.id}>{o.description?.slice(0, 60)}</option>)}
          </select>
        </div>
      </form>

      {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

      {learnerRows.length > 0 ? (
        <>
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {learnerRows.map(([lid, v]) => {
                  const stu = students.find((s) => String(s.id) === String(lid));
                  return (
                    <tr key={lid}>
                      <td className="px-4 py-3">{stu ? `${stu.first_name} ${stu.last_name}`.trim() || stu.email : `Learner ${lid}`}</td>
                      <td className="px-4 py-3">
                        <select className={`border rounded px-2 py-1 ${v.level ? LEVEL_COLORS[v.level] : ''}`} value={v.level} onChange={(e) => setRow(Number(lid), { level: e.target.value })}>
                          <option value="">—</option>
                          {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input className="w-full border rounded px-2 py-1" value={v.comment || ''} onChange={(e) => setRow(Number(lid), { comment: e.target.value })} placeholder="Optional comment" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={submitting} onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save Assessments'}
            </button>
          </div>
        </>
      ) : (
        stream && term && outcome && <p className="text-gray-500">No learners enrolled in this stream.</p>
      )}
    </div>
  );
};

export default BulkAssessment;
