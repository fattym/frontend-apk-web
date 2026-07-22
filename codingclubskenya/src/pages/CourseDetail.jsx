import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Layers,
  Megaphone,
  Sparkles,
  Users,
} from 'lucide-react';
import api from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('topics');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, topicsRes, assignmentsRes, postsRes] = await Promise.all([
          api.get(`/api/courses/courses/${id}/`),
          api.get(`/api/courses/courses/${id}/topics/`),
          api.get(`/api/courses/courses/${id}/assignments/`),
          api.get(`/api/courses/courses/${id}/posts/`),
        ]);
        setCourse(courseRes.data);
        setTopics(topicsRes.data.results || topicsRes.data || []);
        setAssignments(assignmentsRes.data.results || assignmentsRes.data || []);
        setPosts(postsRes.data.results || postsRes.data || []);
      } catch (err) {
        setError(JSON.stringify(err.response?.data || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const groupedTopics = useMemo(() => {
    return topics.reduce((acc, topic) => {
      const week = topic.week || 0;
      if (!acc[week]) acc[week] = [];
      acc[week].push(topic);
      return acc;
    }, {});
  }, [topics]);

  const lessonsByTopic = useMemo(() => {
    return (course?.lessons || []).reduce((acc, lesson) => {
      const topicId = lesson.topic?.id || lesson.topic || 'unlinked';
      if (!acc[topicId]) acc[topicId] = [];
      acc[topicId].push(lesson);
      return acc;
    }, {});
  }, [course?.lessons]);

  const openTopic = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  const stats = [
    { label: 'Topics', value: topics.length, icon: Layers },
    { label: 'Lessons', value: course?.lessons?.length || 0, icon: BookOpen },
    { label: 'Assignments', value: assignments.length, icon: ClipboardList },
    { label: 'Stream posts', value: posts.length, icon: Megaphone },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm font-medium text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 shadow-sm">
        <button
          onClick={() => navigate('/my-courses')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
        <p className="mt-4 text-sm text-rose-600">{error || 'Course not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/my-courses')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </button>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.4fr_0.9fr] lg:px-7">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                CBC course
              </span>
              {course.status && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200">
                  {course.status.replaceAll('_', ' ')}
                </span>
              )}
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{course.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 whitespace-pre-wrap">
                {course.description || 'No description has been added yet.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              {course.grade_name && <span className="rounded-full bg-white/10 px-3 py-1">{course.grade_name}</span>}
              {course.stream_name && <span className="rounded-full bg-white/10 px-3 py-1">{course.stream_name}</span>}
              {course.term_name && <span className="rounded-full bg-white/10 px-3 py-1">{course.term_name}</span>}
              {course.year && <span className="rounded-full bg-white/10 px-3 py-1">{course.year}</span>}
              {course.teacher_name && <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">Teacher: {course.teacher_name}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <Icon className="h-4 w-4 text-emerald-300" />
                  </div>
                  <p className="mt-2 text-2xl font-black">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <section className="rounded-[1.6rem] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'topics', label: 'Topics', icon: Layers },
            { id: 'lessons', label: 'Lessons', icon: BookOpen },
            { id: 'assignments', label: 'Assignments', icon: ClipboardList },
            { id: 'posts', label: 'Stream', icon: Megaphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                  active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === 'topics' && (
        <div className="space-y-4">
          {Object.keys(groupedTopics).length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
              <Sparkles className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No topics yet</p>
              <p className="mt-1 text-sm text-slate-500">Topics are generated from the Scheme of Work.</p>
            </div>
          ) : (
            Object.entries(groupedTopics)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([week, weekTopics]) => (
                <section key={week} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Week {week}</h3>
                      <p className="mt-1 text-sm text-slate-500">{weekTopics.length} topic(s)</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">CBC aligned</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {weekTopics.map((topic) => {
                      const linkedLessons = lessonsByTopic[topic.id] || [];
                      return (
                        <button
                          key={topic.id}
                          onClick={() => openTopic(topic.id)}
                          className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Week {topic.week} · {topic.is_published ? 'Published' : 'Draft'}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                              {linkedLessons.length} lesson(s)
                            </span>
                          </div>
                          {topic.learning_outcomes && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {topic.learning_outcomes}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
          )}
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {course.lessons?.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No lessons yet</p>
              <p className="mt-1 text-sm text-slate-500">Open the course studio to add lesson outlines.</p>
            </div>
          ) : (
            course.lessons.map((lesson) => (
              <article key={lesson.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Lesson {lesson.lesson_number}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    lesson.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {lesson.is_published ? 'Published' : 'Draft'}
                  </span>
                  {lesson.topic?.title && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{lesson.topic.title}</span>}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{lesson.title || lesson.strand || 'Lesson'}</h3>
                {lesson.objectives && <p className="mt-2 text-sm leading-7 text-slate-600">{lesson.objectives}</p>}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {lesson.learning_activities && (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Activities</p>
                      <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{lesson.learning_activities}</p>
                    </div>
                  )}
                  {lesson.resources && (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Resources</p>
                      <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{lesson.resources}</p>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
              <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No assignments yet</p>
              <p className="mt-1 text-sm text-slate-500">Assignments linked to a topic will appear here.</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <article key={assignment.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{assignment.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{assignment.instructions}</p>
                    {assignment.topic?.title && (
                      <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        Topic: {assignment.topic.title}
                      </span>
                    )}
                  </div>
                  {assignment.due_date && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Due {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
              <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No stream posts yet</p>
              <p className="mt-1 text-sm text-slate-500">Announcements, notes, and questions will show up here.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    post.post_type === 'announcement' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {post.post_type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {post.teacher_name} · {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{post.title || 'Untitled post'}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{post.content}</p>
                {post.comment_count > 0 && (
                  <p className="mt-3 text-xs text-slate-500">{post.comment_count} comment(s)</p>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
