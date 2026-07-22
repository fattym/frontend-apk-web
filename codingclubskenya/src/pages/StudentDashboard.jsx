import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, assessRes, rcRes, assignRes, postsRes] = await Promise.all([
          api.get('/api/attendance/attendance-records/'),
          api.get('/api/assessment/assessments/'),
          api.get('/api/exams/report-cards/'),
          api.get('/api/courses/assignments/'),
          api.get('/api/courses/posts/'),
        ]);
        setAttendance(attRes.data.results || attRes.data);
        setAssessments(assessRes.data.results || assessRes.data);
        setReportCards(rcRes.data.results || rcRes.data);
        setAssignments(assignRes.data.results || assignRes.data);
        setPosts(postsRes.data.results || postsRes.data);
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
  const meCount = assessments.filter(a => a.level_achieved === 'ME').length;
  const eeCount = assessments.filter(a => a.level_achieved === 'EE').length;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-700">Learner dashboard</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Student Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Welcome, {user?.first_name} {user?.last_name}. Track attendance, competency growth, assignments, and recent class posts.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-slate-500">Meeting expectations</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{meCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-slate-500">Exceeding expectations</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{eeCount}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-slate-500">Report cards</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{reportCards.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-slate-500">Assignments</h3>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{assignments.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming Assignments</h2>
          </div>
          <div className="p-6">
            {assignments.length === 0 && <p className="text-sm text-slate-500">No assignments yet.</p>}
            <div className="space-y-3">
              {assignments.slice(0, 5).map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                  <p className="font-medium text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.course?.title || a.course} · Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Recent Announcements</h2>
          </div>
          <div className="p-6">
            {posts.length === 0 && <p className="text-sm text-slate-500">No announcements yet.</p>}
            <div className="space-y-3">
              {posts.slice(0, 5).map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.post_type === 'announcement' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {p.post_type}
                  </span>
                  <p className="mt-2 text-sm text-slate-700 line-clamp-2">{p.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Recent Attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendance.slice(0, 10).map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.stream?.name || a.stream}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : a.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No attendance records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Recent Competency Assessments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Term</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assessments.slice(0, 10).map((a) => (
                  <tr key={a.id}>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-700">{a.outcome?.description || a.outcome}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.level_achieved === 'EE' ? 'bg-blue-100 text-blue-800' : a.level_achieved === 'ME' ? 'bg-emerald-100 text-emerald-800' : a.level_achieved === 'AE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        {a.level_achieved}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.term?.name || a.term}</td>
                  </tr>
                ))}
                {assessments.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No assessments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
