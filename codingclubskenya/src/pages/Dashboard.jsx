import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const STATS = [
  { key: 'students', label: 'Students', endpoint: '/api/auth/users/?role=STUDENT', link: '/students', accent: 'text-brand-orange' },
  { key: 'teachers', label: 'Teachers', endpoint: '/api/auth/users/?role=TEACHER', link: '/teachers', accent: 'text-brand-orange' },
  { key: 'parents', label: 'Parents', endpoint: '/api/auth/users/?role=PARENT', link: '/parents', accent: 'text-brand-orange' },
  { key: 'streams', label: 'Classes', endpoint: '/api/academics/streams/', link: '/classes', accent: 'text-brand-orange' },
  { key: 'learningAreas', label: 'Learning Areas', endpoint: '/api/academics/learning-areas/', link: '/learning-areas', accent: 'text-brand-orange' },
  { key: 'assessments', label: 'Assessments', endpoint: '/api/assessment/assessments/', link: '/assessments', accent: 'text-brand-orange' },
  { key: 'exams', label: 'Exams', endpoint: '/api/exams/exams/', link: '/exams', accent: 'text-brand-orange' },
  { key: 'invoices', label: 'Fee Invoices', endpoint: '/api/fees/invoices/', link: '/fees', accent: 'text-brand-orange' },
  { key: 'books', label: 'Library Books', endpoint: '/api/library/books/', link: '/library', accent: 'text-brand-orange' },
  { key: 'announcements', label: 'Announcements', endpoint: '/api/messaging/announcements/', link: '/messaging', accent: 'text-brand-orange' },
  { key: 'clubs', label: 'Clubs', endpoint: '/api/clubs/clubs/', link: '/clubs', accent: 'text-brand-orange' },
  { key: 'teacherAssignments', label: 'Teacher Assignments', endpoint: '/api/academics/teacher-assignments/', link: '/teacher-assignments', accent: 'text-brand-orange' },
  { key: 'complaints', label: 'Open Complaints', endpoint: '/api/complaints/complaints/?status=Pending', link: '/complaints', accent: 'text-brand-orange' },
  { key: 'events', label: 'Events', endpoint: '/api/events/events/', link: '/events', accent: 'text-brand-orange' },
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
      <h1 className="text-3xl font-bold mb-2 text-brand-navy">Dashboard</h1>
      <p className="text-brand-navy/70 mb-6">Welcome, {user?.first_name || 'Admin'}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((s) => (
          <Link key={s.key} to={s.link} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition block">
            <h3 className="text-brand-navy/60 text-sm">{s.label}</h3>
            <p className={`text-3xl font-bold ${s.accent}`}>{loading ? '…' : counts[s.key]}</p>
          </Link>
        ))}
      </div>

      {ov && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-brand-navy/60 text-xs uppercase tracking-wide">Attendance</h3>
            <p className="text-2xl font-bold text-brand-orange">{ov.attendance.present_pct}%</p>
            <p className="text-xs text-brand-navy/40">{ov.attendance.present} present / {ov.attendance.total} records</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-brand-navy/60 text-xs uppercase tracking-wide">Fee Collection</h3>
            <p className="text-2xl font-bold text-brand-orange">{ov.fee_collection.rate}%</p>
            <p className="text-xs text-brand-navy/40">{ov.fee_collection.overdue} overdue · Ksh {ov.fee_collection.collected}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-brand-navy/60 text-xs uppercase tracking-wide">Avg Exam Score</h3>
            <p className="text-2xl font-bold text-brand-orange">{ov.performance.avg_exam_pct}%</p>
            <p className="text-xs text-brand-navy/40">{ov.performance.assessments_me_ee} ME/EE assessments</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="text-brand-navy/60 text-xs uppercase tracking-wide">Homework</h3>
            <p className="text-2xl font-bold text-brand-orange">{ov.homeworks}</p>
            <p className="text-xs text-brand-navy/40">{ov.events} events scheduled</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-brand-navy mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map(([to, label]) => (
            <Link key={to} to={to} className="px-4 py-2 bg-brand-grayLight hover:bg-brand-grayLight/70 rounded-xl text-sm font-medium text-brand-navy">
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-brand-navy">Recent Complaints</h2>
            <Link to="/complaints" className="text-sm text-brand-orange hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {recent.complaints.map((c) => (
              <Link key={c.id} to="/complaints" className="py-2 flex justify-between gap-3 hover:text-brand-orange">
                <span className="truncate">{c.title}</span>
                <span className="text-xs text-brand-navy/40 whitespace-nowrap">{c.status}</span>
              </Link>
            ))}
            {recent.complaints.length === 0 && <p className="py-2 text-sm text-brand-navy/60">No complaints yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-brand-navy">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-brand-orange hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {recent.events.map((ev) => (
              <Link key={ev.id} to="/events" className="py-2 flex justify-between gap-3 hover:text-brand-orange">
                <span className="truncate">{ev.name}</span>
                <span className="text-xs text-brand-navy/40 whitespace-nowrap">{ev.start_date}</span>
              </Link>
            ))}
            {recent.events.length === 0 && <p className="py-2 text-sm text-brand-navy/60">No events scheduled.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
