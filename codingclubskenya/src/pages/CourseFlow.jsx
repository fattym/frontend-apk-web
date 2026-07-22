import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Layers3,
  Sparkles,
  School,
  FileText,
  MessageSquare,
  PlayCircle,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const unwrapList = (data) => data?.results || data || [];

const FLOW_STEPS = [
  {
    icon: School,
    title: 'Create course',
    body: 'Pick the learning area, grade, delivery mode, and visibility rules before publishing.',
  },
  {
    icon: BookOpen,
    title: 'Attach scheme',
    body: 'Link a Scheme of Work and keep the weekly CBC breakdown tied to the class.',
  },
  {
    icon: Layers3,
    title: 'Generate topics',
    body: 'Turn weekly scheme entries into Google Classroom-style topics for each week.',
  },
  {
    icon: MessageSquare,
    title: 'Add posts',
    body: 'Publish notes, assignments, questions, and announcements inside each topic.',
  },
];

const VISIBILITY_RULES = [
  'Draft courses stay hidden from learners.',
  'Published topics become visible automatically.',
  'Posts and lessons inherit topic/course visibility.',
  'Students only see enrolled and published content.',
];

const CourseFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, schemesRes, topicsRes, postsRes] = await Promise.all([
          api.get('/api/courses/courses/'),
          api.get('/api/curriculum/schemes/'),
          api.get('/api/courses/topics/'),
          api.get('/api/courses/posts/'),
        ]);
        setCourses(unwrapList(coursesRes.data));
        setSchemes(unwrapList(schemesRes.data));
        setTopics(unwrapList(topicsRes.data));
        setPosts(unwrapList(postsRes.data));
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load course flow');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const publishedCourses = courses.filter((course) => course.status === 'published').length;
    const draftCourses = courses.filter((course) => course.status === 'draft').length;
    const publishedTopics = topics.filter((topic) => topic.is_published).length;
    const attachedSchemes = schemes.length;

    return [
      { label: 'Courses', value: courses.length, note: `${publishedCourses} published · ${draftCourses} drafts` },
      { label: 'Schemes', value: attachedSchemes, note: 'CBC weekly breakdowns' },
      { label: 'Topics', value: topics.length, note: `${publishedTopics} visible to learners` },
      { label: 'Posts', value: posts.length, note: 'Lessons, assignments, announcements' },
    ];
  }, [courses, schemes, topics, posts]);

  const activeCourse = useMemo(
    () => courses.find((course) => course.status === 'published') || courses[0] || null,
    [courses]
  );

  const activeCourseTopics = useMemo(() => {
    if (!activeCourse) return [];
    return topics.filter((topic) => {
      const topicCourseId = topic.course?.id || topic.course || topic.course_id;
      return String(topicCourseId) === String(activeCourse.id);
    });
  }, [activeCourse, topics]);

  const activeCoursePosts = useMemo(() => {
    if (!activeCourse) return [];
    return posts.filter((post) => {
      const postCourseId = post.course?.id || post.course || post.course_id;
      return String(postCourseId) === String(activeCourse.id);
    });
  }, [activeCourse, posts]);

  const activeCourseSchemes = useMemo(() => {
    if (!activeCourse) return [];
    return schemes.filter((scheme) => {
      const schemeCourseId = scheme.course?.id || scheme.course || scheme.course_id;
      return String(schemeCourseId) === String(activeCourse.id);
    });
  }, [activeCourse, schemes]);

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading course flow...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem] bg-slate-950 text-white">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-8 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(228,59,26,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.12),transparent_28%)]" />
            <div className="relative max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-red-100">
                <Sparkles className="h-3.5 w-3.5" />
                CBC course flow
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Course, scheme, topic, post. One clean path from CBC planning to student visibility.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Build a Learning Area course, connect the Scheme of Work, auto-generate weekly topics,
                and publish lessons or assignments in a classroom-style feed.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/courses')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-red-50"
                >
                  Open Course Studio <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/schemes-of-work')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Review Schemes <FileText className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(user?.role === 'STUDENT' ? '/my-courses' : '/courses')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Student View <PlayCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{metric.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-50">
              <p className="font-medium">Visibility rule</p>
              <p className="mt-1 text-red-50/80">
                Draft courses and unpublished topics stay hidden. Only the published classroom feed reaches learners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="glass-card rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-slate-400">0{index + 1}</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live pipeline</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Courses in the system</h2>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:inline-flex"
            >
              Manage courses
            </button>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-sm text-slate-500">
                No courses yet. Create a draft in Course Studio to start the flow.
              </div>
            ) : (
              courses.slice(0, 6).map((course) => {
                const courseTopics = topics.filter((topic) => {
                  const topicCourseId = topic.course?.id || topic.course || topic.course_id;
                  return String(topicCourseId) === String(course.id);
                });
                const coursePosts = posts.filter((post) => {
                  const postCourseId = post.course?.id || post.course || post.course_id;
                  return String(postCourseId) === String(course.id);
                });

                return (
                  <article key={course.id} className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{course.title || 'Untitled course'}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            course.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : course.status === 'submitted_for_review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(course.status || 'draft').replace('_', ' ')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {course.learning_area?.name || course.learning_area || 'Learning area not set'}
                          {course.grade_name ? ` · ${course.grade_name}` : ''}
                          {course.teacher_name ? ` · ${course.teacher_name}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/courses')}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Open <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Schemes</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{activeCourse && String(activeCourse.id) === String(course.id) ? activeCourseSchemes.length : '—'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Topics</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{courseTopics.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Posts</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{coursePosts.length}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Student preview</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">What learners will see</h2>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>

          <div className="glass-card rounded-2xl p-5">
            {activeCourse ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activeCourse.title || 'Untitled course'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeCourse.learning_area?.name || activeCourse.learning_area || 'Learning area'} ·{' '}
                      {activeCourse.grade_name || 'Grade not set'}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                    Published feed
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Course summary</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Students open a course, browse weekly topics, then read posts, notes, and assignments in one thread.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Visible sections</p>
                    <div className="mt-3 space-y-2">
                      {[
                        ['Topics', activeCourseTopics.length],
                        ['Posts', activeCoursePosts.length],
                        ['Schemes', activeCourseSchemes.length],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                          <span className="text-slate-700">{label}</span>
                          <span className="font-medium text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-red-900">
                      <CheckCircle2 className="h-4 w-4" />
                      Visibility rules
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-red-950/80">
                      {VISIBILITY_RULES.map((rule) => (
                        <li key={rule} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-600" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No course available yet. Create the first one in Course Studio.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CourseFlow;
