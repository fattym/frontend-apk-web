import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const STATS = [
  { key: 'students', label: 'Students', endpoint: '/api/auth/users/?role=STUDENT', link: '/students', accent: 'text-blue-600' },
  { key: 'teachers', label: 'Teachers', endpoint: '/api/auth/users/?role=TEACHER', link: '/teachers', accent: 'text-green-600' },
  { key: 'parents', label: 'Parents', endpoint: '/api/auth/users/?role=PARENT', link: '/parents', accent: 'text-purple-600' },
  { key: 'streams', label: 'Classes', endpoint: '/api/academics/streams/', link: '/classes', accent: 'text-indigo-600' },
  { key: 'learningAreas', label: 'Learning Areas', endpoint: '/api/academics/learning-areas/', link: '/learning-areas', accent: 'text-teal-600' },
  { key: 'assessments', label: 'Assessments', endpoint: '/api/assessment/assessments/', link: '/assessments', accent: 'text-pink-600' },
  { key: 'exams', label: 'Exams', endpoint: '/api/exams/exams/', link: '/exams', accent: 'text-amber-600' },
  { key: 'invoices', label: 'Fee Invoices', endpoint: '/api/fees/invoices/', link: '/fees', accent: 'text-red-600' },
  { key: 'books', label: 'Library Books', endpoint: '/api/library/books/', link: '/library', accent: 'text-cyan-600' },
  { key: 'announcements', label: 'Announcements', endpoint: '/api/messaging/announcements/', link: '/messaging', accent: 'text-orange-600' },
  { key: 'clubs', label: 'Clubs', endpoint: '/api/clubs/clubs/', link: '/clubs', accent: 'text-emerald-600' },
  { key: 'teacherAssignments', label: 'Teacher Assignments', endpoint: '/api/academics/teacher-assignments/', link: '/teacher-assignments', accent: 'text-sky-600' },
  { key: 'complaints', label: 'Open Complaints', endpoint: '/api/complaints/complaints/?status=Pending', link: '/complaints', accent: 'text-rose-600' },
  { key: 'events', label: 'Events', endpoint: '/api/events/events/', link: '/events', accent: 'text-fuchsia-600' },
];

const QUICK_LINKS = [
  ['/assessments', 'Bulk Assessment'],
  ['/teacher-assignments', 'Teacher Assignments'],
  ['/learner-groups', 'Learner Groups'],
  ['/clubs', 'Clubs & Activities'],
  ['/attendance', 'Attendance'],
  ['/fees', 'Fees'],
  ['/library', 'Library'],
  ['/shop/products', 'Shop'],
  ['/messaging', 'Messaging'],
  ['/complaints', 'Complaints'],
  ['/events', 'Events'],
  ['/schools', 'Schools'],
];

const Dashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState({ complaints: [], events: [] });
  const [ov, setOv] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all(
      STATS.map((s) => api.get(s.endpoint).then((r) => (r.data.results || r.data).length).catch(() => 0))
    ).then((vals) => {
      if (!active) return;
      const map = {};
      STATS.forEach((s, i) => { map[s.key] = vals[i]; });
      setCounts(map);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/complaints/complaints/?limit=5').then((r) => r.data.results || r.data).catch(() => []),
      api.get('/api/events/events/?limit=5').then((r) => r.data.results || r.data).catch(() => []),
      api.get('/api/reports/overview/').then((r) => r.data).catch(() => null),
    ]).then(([complaints, events, overview]) => {
      if (!active) return;
      setRecent({ complaints: complaints.slice(0, 5), events: events.slice(0, 5) });
      setOv(overview);
    });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.first_name || 'Admin'}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((s) => (
          <Link key={s.key} to={s.link} className="bg-white p-6 rounded shadow hover:shadow-md transition block">
            <h3 className="text-gray-500 text-sm">{s.label}</h3>
            <p className={`text-3xl font-bold ${s.accent}`}>{loading ? '…' : counts[s.key]}</p>
          </Link>
        ))}
      </div>

      {ov && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500 text-xs uppercase tracking-wide">Attendance</h3>
            <p className="text-2xl font-bold text-sky-600">{ov.attendance.present_pct}%</p>
            <p className="text-xs text-gray-400">{ov.attendance.present} present / {ov.attendance.total} records</p>
          </div>
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500 text-xs uppercase tracking-wide">Fee Collection</h3>
            <p className="text-2xl font-bold text-red-600">{ov.fee_collection.rate}%</p>
            <p className="text-xs text-gray-400">{ov.fee_collection.overdue} overdue · Ksh {ov.fee_collection.collected}</p>
          </div>
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500 text-xs uppercase tracking-wide">Avg Exam Score</h3>
            <p className="text-2xl font-bold text-amber-600">{ov.performance.avg_exam_pct}%</p>
            <p className="text-xs text-gray-400">{ov.performance.assessments_me_ee} ME/EE assessments</p>
          </div>
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-gray-500 text-xs uppercase tracking-wide">Homework</h3>
            <p className="text-2xl font-bold text-fuchsia-600">{ov.homeworks}</p>
            <p className="text-xs text-gray-400">{ov.events} events scheduled</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map(([to, label]) => (
            <Link key={to} to={to} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700">
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Recent Complaints</h2>
            <Link to="/complaints" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {recent.complaints.map((c) => (
              <Link key={c.id} to="/complaints" className="py-2 flex justify-between gap-3 hover:text-blue-600">
                <span className="truncate">{c.title}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{c.status}</span>
              </Link>
            ))}
            {recent.complaints.length === 0 && <p className="py-2 text-sm text-gray-500">No complaints yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {recent.events.map((ev) => (
              <Link key={ev.id} to="/events" className="py-2 flex justify-between gap-3 hover:text-blue-600">
                <span className="truncate">{ev.name}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{ev.start_date}</span>
              </Link>
            ))}
            {recent.events.length === 0 && <p className="py-2 text-sm text-gray-500">No events scheduled.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
