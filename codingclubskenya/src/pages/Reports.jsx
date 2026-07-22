import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const pctColor = (p) => (p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-amber-500' : 'bg-red-500');

const Card = ({ label, value, accent }) => (
  <div className="bg-white p-5 rounded shadow">
    <h3 className="text-gray-500 text-xs uppercase tracking-wide">{label}</h3>
    <p className={`text-3xl font-bold ${accent}`}>{value}</p>
  </div>
);

const Bar = ({ label, pct, sub }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="truncate">{label}</span>
      <span className="text-gray-500">{pct}{sub}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${pctColor(pct)}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  </div>
);

const Reports = () => {
  const { user } = useAuth();
  const [ov, setOv] = useState(null);
  const [att, setAtt] = useState([]);
  const [results, setResults] = useState([]);
  const [perf, setPerf] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [tab, setTab] = useState('attendance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/reports/overview/'),
      api.get('/api/reports/attendance/'),
      api.get('/api/reports/results/'),
      api.get('/api/reports/performance/'),
      api.get('/api/reports/teachers/'),
    ]).then(([o, a, r, p, t]) => {
      setOv(o.data);
      setAtt(a.data);
      setResults(r.data);
      setPerf(p.data);
      setTeachers(t.data);
    }).catch(() => setOv(null))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = async (type) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/reports/export/?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports &amp; Analytics</h1>
        <div className="flex gap-2">
          <button onClick={() => exportCsv('results')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">Export Results CSV</button>
          <button onClick={() => exportCsv('attendance')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">Export Attendance CSV</button>
          <button onClick={() => exportCsv('performance')} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">Export Performance CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card label="Students" value={ov?.students ?? 0} accent="text-blue-600" />
        <Card label="Teachers" value={ov?.teachers ?? 0} accent="text-green-600" />
        <Card label="Classes" value={ov?.classes ?? 0} accent="text-indigo-600" />
        <Card label="Subjects" value={ov?.subjects ?? 0} accent="text-red-600" />
        <Card label="Attendance" value={`${ov?.attendance?.present_pct ?? 0}%`} accent="text-sky-600" />
        <Card label="Fee Collected" value={`${ov?.fee_collection?.rate ?? 0}%`} accent="text-red-600" />
        <Card label="Avg Exam %" value={ov?.performance?.avg_exam_pct ?? 0} accent="text-amber-600" />
        <Card label="Open Complaints" value={ov?.pending_complaints ?? 0} accent="text-rose-600" />
      </div>

      <div className="flex gap-2 border-b mb-6">
        {[['attendance', 'Attendance'], ['results', 'Results'], ['performance', 'Students'], ['teachers', 'Teachers']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium ${tab === k ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'attendance' && (
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="font-semibold mb-2">Monthly Attendance (Present %)</h2>
          {att.map((m) => (
            <Bar key={`${m.year}-${m.month}`} label={m.label} pct={m.present_pct} sub="%" />
          ))}
          {att.length === 0 && <p className="text-gray-500">No attendance recorded yet.</p>}
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3">{r.stream}</td>
                  <td className="px-6 py-3">{r.learning_area}</td>
                  <td className="px-6 py-3">{r.total}</td>
                  <td className="px-6 py-3 text-green-700">{r.passed}</td>
                  <td className="px-6 py-3 text-red-700">{r.failed}</td>
                  <td className="px-6 py-3">{r.avg_marks}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No exams yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'performance' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ME/EE</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {perf.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-3 font-medium">{s.name}</td>
                  <td className="px-6 py-3">{s.stream}</td>
                  <td className="px-6 py-3">{s.exams}</td>
                  <td className="px-6 py-3">{s.avg_pct}</td>
                  <td className="px-6 py-3 text-green-700">{s.me_ee}</td>
                </tr>
              ))}
              {perf.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No student results yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'teachers' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Student %</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-3 font-medium">{t.name}</td>
                  <td className="px-6 py-3">{t.classes}</td>
                  <td className="px-6 py-3">{t.subjects}</td>
                  <td className="px-6 py-3">{t.avg_student_pct}</td>
                </tr>
              ))}
              {teachers.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No teachers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
