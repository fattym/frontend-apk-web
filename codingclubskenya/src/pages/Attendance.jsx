import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'ABSENT', label: 'Absent', color: 'bg-rose-100 text-rose-800' },
  { value: 'LATE', label: 'Late', color: 'bg-amber-100 text-amber-800' },
  { value: 'EXCUSED', label: 'Excused', color: 'bg-blue-100 text-blue-800' },
  { value: 'SICK_LEAVE', label: 'Sick Leave', color: 'bg-purple-100 text-purple-800' },
  { value: 'AUTHORIZED_ABSENCE', label: 'Authorized Absence', color: 'bg-gray-100 text-gray-800' },
];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Attendance = () => {
  const [tab, setTab] = useState('records');
  const [records, setRecords] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [streamFilter, setStreamFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState(null);
  const [trendYear, setTrendYear] = useState(new Date().getFullYear());
  const [trend, setTrend] = useState([]);
  const [trendStream, setTrendStream] = useState('');

  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStream, setBulkStream] = useState('');
  const [bulkData, setBulkData] = useState({});

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      setError('');
      try {
        const [streamsRes, studentsRes] = await Promise.all([
          api.get('/api/attendance/class-list/'),
          api.get('/api/auth/users/students/'),
        ]);
        const s = (studentsRes.data.results || studentsRes.data || []).map(st => ({ id: st.id, name: `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.email }));
        setStudents(s);
        setStreams(streamsRes.data.results || streamsRes.data || []);
      } catch (err) {
        setError('Failed to load streams/students');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (streamFilter) params.stream = streamFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await api.get('/api/attendance/attendance-records/', { params });
      setRecords(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/attendance/attendance-summaries/');
      setSummaries(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = {};
      if (streamFilter) params.stream = streamFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await api.get('/api/attendance/attendance-records/stats/', { params });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTrend = async () => {
    try {
      const params = { year: trendYear };
      if (trendStream) params.stream = trendStream;
      const res = await api.get('/api/attendance/attendance-records/monthly_trend/', { params });
      setTrend(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/attendance/attendance-notifications/');
      setNotifications(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (tab === 'records') {
      loadRecords();
      loadStats();
    } else if (tab === 'summaries') {
      loadSummaries();
    } else if (tab === 'analytics') {
      loadTrend();
    } else if (tab === 'notifications') {
      loadNotifications();
    }
  }, [tab, streamFilter, dateFrom, dateTo, trendYear, trendStream]);

  useEffect(() => {
    if (bulkStream) {
      const studentsInStream = students.filter(s => {
        const streamObj = streams.find(st => st.id == bulkStream);
        return streamObj && (s.grade || '').toLowerCase() === (streamObj.grade || '').toLowerCase();
      });
      const initial = {};
      studentsInStream.forEach(st => {
        initial[st.id] = { student: st.id, status: 'PRESENT', note: '' };
      });
      setBulkData(initial);
    }
  }, [bulkStream, students, streams]);

  const handleBulkSubmit = async () => {
    if (!bulkDate || !bulkStream) {
      setError('Date and stream are required for bulk mark.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        stream: Number(bulkStream),
        date: bulkDate,
        records: Object.values(bulkData),
      };
      const res = await api.post('/api/attendance/attendance-records/bulk_mark/', payload);
      setError('');
      alert(`Marked attendance for ${res.data.created} students.`);
      setBulkData({});
      loadRecords();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecord = async (id, field, value) => {
    try {
      await api.patch(`/api/attendance/attendance-records/${id}/`, { [field]: value });
      loadRecords();
      loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await api.delete(`/api/attendance/attendance-records/${id}/`);
      loadRecords();
      loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  const regenerateSummaries = async () => {
    setSaving(true);
    setError('');
    try {
      const params = {};
      if (streamFilter) params.stream = streamFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await api.post('/api/attendance/attendance-records/regenerate_summaries/', {}, { params });
      alert(`Regenerated ${res.data.updated} summaries for ${res.data.month}/${res.data.year}.`);
      loadSummaries();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to regenerate summaries');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const rows = [['Date', 'Student', 'Stream', 'Status', 'Note']];
    records.forEach(r => {
      rows.push([r.date, r.student_detail?.email || r.student, r.stream_detail?.name || r.stream, r.status, r.note || '']);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getStudentName = (id) => {
    const s = students.find(st => st.id === id);
    return s ? s.name : id;
  };

  const getStreamName = (id) => {
    const s = streams.find(st => st.id === id);
    return s ? `${s.name} (${s.grade})` : id;
  };

  if (loading && tab === 'records') return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
        <div className="flex flex-wrap gap-2">
          {tab !== 'bulk' && (
            <button onClick={() => setTab('bulk')} className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700">Bulk Mark</button>
          )}
          {tab === 'records' && records.length > 0 && (
            <button onClick={exportCSV} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Export CSV</button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/60 bg-white/70 p-2">
        {[
          { key: 'records', label: 'Records' },
          { key: 'summaries', label: 'Summaries' },
          { key: 'bulk', label: 'Bulk Mark' },
          { key: 'analytics', label: 'Analytics' },
          { key: 'notifications', label: 'Notifications' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {/* FILTERS */}
      {tab === 'records' && (
        <div className="flex flex-wrap gap-3">
          <select value={streamFilter} onChange={e => setStreamFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">All Streams</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="From" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="To" />
          <button onClick={loadRecords} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Apply</button>
        </div>
      )}

      {/* RECORDS TAB */}
      {tab === 'records' && (
        <div className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Total', value: stats.total, cls: 'bg-gray-50 text-gray-800' },
                { label: 'Present', value: stats.present, cls: 'bg-emerald-50 text-emerald-800' },
                { label: 'Absent', value: stats.absent, cls: 'bg-rose-50 text-rose-800' },
                { label: 'Late', value: stats.late, cls: 'bg-amber-50 text-amber-800' },
                { label: 'Excused', value: stats.excused, cls: 'bg-blue-50 text-blue-800' },
                { label: 'Attendance %', value: `${stats.total ? Math.round((stats.present / stats.total) * 100) : 0}%`, cls: 'bg-teal-50 text-teal-800' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl px-4 py-3 ${s.cls}`}>
                  <p className="text-xs uppercase tracking-[0.2em]">{s.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          )}
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Recorded By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-500">No records found.</td></tr>}
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.student_detail?.first_name ? `${r.student_detail.first_name} ${r.student_detail.last_name || ''}`.trim() : (r.student_detail?.email || r.student)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.stream_detail?.name || r.stream}</td>
                    <td className="px-4 py-3">
                      <select value={r.status} onChange={e => handleUpdateRecord(r.id, 'status', e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs">
                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" value={r.note || ''} onChange={e => handleUpdateRecord(r.id, 'note', e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs w-40" placeholder="Reason/note" />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.recorded_by_detail?.email || r.recorded_by}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteRecord(r.id)} className="text-xs text-rose-600 hover:text-rose-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUMMARIES TAB */}
      {tab === 'summaries' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={regenerateSummaries} disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50">Regenerate Summaries</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Present</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Absent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Late</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Excused</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summaries.length === 0 && <tr><td colSpan="9" className="px-6 py-8 text-center text-sm text-slate-500">No summaries yet. Generate records first, then click Regenerate.</td></tr>}
                {summaries.map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.student_detail?.first_name ? `${s.student_detail.first_name} ${s.student_detail.last_name || ''}`.trim() : (s.student_detail?.email || s.student)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.stream_detail?.name || s.stream}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.month}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.year}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.present_days}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.absent_days}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.late_days}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{s.excused_days}</td>
                    <td className="px-4 py-3 text-sm font-medium">{s.attendance_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BULK MARK TAB */}
      {tab === 'bulk' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select value={bulkStream} onChange={e => setBulkStream(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="">Select class</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
            </select>
            <input type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          {bulkStream && Object.keys(bulkData).length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white shadow-sm">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(bulkData).map(([sid, row]) => (
                    <tr key={sid}>
                      <td className="px-4 py-3 text-sm text-slate-700">{getStudentName(Number(sid))}</td>
                      <td className="px-4 py-3">
                        <select value={row.status} onChange={e => setBulkData({ ...bulkData, [sid]: { ...row, status: e.target.value } })} className="rounded-lg border border-gray-200 px-2 py-1 text-xs">
                          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={row.note} onChange={e => setBulkData({ ...bulkData, [sid]: { ...row, note: e.target.value } })} className="rounded-lg border border-gray-200 px-2 py-1 text-xs w-64" placeholder="Reason/note" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {bulkStream && Object.keys(bulkData).length > 0 && (
            <div className="flex justify-end">
              <button onClick={handleBulkSubmit} disabled={saving} className="rounded-lg bg-teal-600 px-6 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Attendance'}</button>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select value={trendYear} onChange={e => setTrendYear(Number(e.target.value))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={trendStream} onChange={e => setTrendStream(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3">
            {trend.map(t => (
              <div key={t.month} className="rounded-2xl border border-white/70 bg-white p-3 shadow-sm">
                <p className="text-xs text-slate-500">{MONTH_NAMES[t.month - 1]}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{t.attendance_pct}%</p>
                <p className="text-xs text-slate-500">{t.present}/{t.total}</p>
              </div>
            ))}
          </div>
          {trend.length === 0 && <p className="text-sm text-slate-500">No trend data for selected filters.</p>}
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === 'notifications' && (
        <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Read</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {notifications.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">No attendance notifications.</td></tr>}
              {notifications.map(n => (
                <tr key={n.id} className={n.is_read ? '' : 'bg-amber-50/40'}>
                  <td className="px-4 py-3 text-sm text-slate-700">{new Date(n.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{n.student_detail?.first_name ? `${n.student_detail.first_name} ${n.student_detail.last_name || ''}`.trim() : (n.student_detail?.email || n.student)}</td>
                  <td className="px-4 py-3 text-xs font-medium">{n.notification_type}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{n.message}</td>
                  <td className="px-4 py-3 text-sm">{n.is_read ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
