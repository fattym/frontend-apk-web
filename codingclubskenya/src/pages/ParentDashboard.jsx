import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linksRes, attRes, assessRes, notifRes] = await Promise.all([
          api.get('/api/auth/parent-learner-links/'),
          api.get('/api/attendance/attendance-records/'),
          api.get('/api/assessment/assessments/'),
          api.get('/api/attendance/attendance-notifications/'),
        ]);
        const links = linksRes.data.results || linksRes.data || [];
        setChildren(links);
        setAttendance(attRes.data.results || attRes.data || []);
        setAssessments(assessRes.data.results || assessRes.data || []);
        setNotifications(notifRes.data.results || notifRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-orange">Parent dashboard</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">Parent Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-brand-navy/70">
              Welcome, {user?.first_name} {user?.last_name}. Track your children's attendance, assessments, and fees.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-700">Present</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-900">{presentCount}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-rose-700">Absent</p>
              <p className="mt-1 text-2xl font-semibold text-rose-900">{absentCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Attendance Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-brand-navy">{attendancePct}%</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">My Children</h3>
          <p className="mt-2 text-3xl font-semibold text-brand-navy">{children.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Recent Assessments</h3>
          <p className="mt-2 text-3xl font-semibold text-brand-navy">{assessments.length}</p>
        </div>
      </div>

      {notifications.filter(n => !n.is_read).length > 0 && (
        <div className="rounded-2xl border border-brand-orange/20 bg-brand-orange/10 p-4">
          <h3 className="text-sm font-semibold text-brand-navy">Attendance Alerts</h3>
          <div className="mt-2 space-y-2">
            {notifications.filter(n => !n.is_read).slice(0, 5).map(n => (
              <div key={n.id} className="text-sm text-brand-navy/80">{n.message}</div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-[2rem]">
        <div className="border-b border-brand-navy/10 px-6 py-4">
          <h2 className="text-xl font-semibold text-brand-navy">My Children</h2>
        </div>
        <div className="divide-y divide-brand-navy/10">
          {children.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-brand-navy/60">No children linked to your account.</p>
          ) : (
            children.map((link) => (
              <div key={link.id} className="px-6 py-4 flex justify-between items-center gap-3">
                <div>
                  <p className="font-medium text-brand-navy">{link.learner?.first_name} {link.learner?.last_name}</p>
                  <p className="text-sm text-brand-navy/60">{link.relationship} • {link.learner?.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-[2rem]">
        <div className="border-b border-brand-navy/10 px-6 py-4">
          <h2 className="text-xl font-semibold text-brand-navy">Recent Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-brand-grayLight/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/10">
              {attendance.slice(0, 10).map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4 text-sm text-brand-navy/80">{a.date}</td>
                  <td className="px-6 py-4 text-sm text-brand-navy/80">{a.student?.first_name} {a.student?.last_name || a.student?.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : a.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-navy/40">{a.note || '-'}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-brand-navy/60">No attendance records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
