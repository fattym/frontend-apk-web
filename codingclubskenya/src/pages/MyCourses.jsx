import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyCoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/api/courses/courses/')
      .then((r) => setCourses(r.data.results || r.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-700">Learner space</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">My Courses</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Open a published course to browse weekly topics, notes, assignments, and class posts in one place.
            </p>
          </div>
          <button
            onClick={() => navigate('/course-flow')}
            className="inline-flex items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100"
          >
            View course flow
          </button>
        </div>
      </section>

      {error && <p className="text-sm break-words text-rose-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Loading courses...</p>
      ) : (
        <div className="glass-card divide-y divide-slate-200 overflow-hidden rounded-[2rem]">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/my-courses/${c.id}`)}
              className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/70"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">{c.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {c.learning_area?.name || c.learning_area}
                  {c.grade_name && c.stream_name ? ` · ${c.grade_name} ${c.stream_name}` : ''}
                  {c.term_name ? ` · ${c.term_name}` : ''}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {c.teacher_name || 'School teacher'} · {(c.topics?.length || 0)} topics
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  c.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {(c.status || 'published').replace('_', ' ')}
                </span>
                <span className="text-sm font-medium text-teal-700">Open →</span>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="p-6 text-sm text-slate-500">You are not enrolled in any courses yet.</p>}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
