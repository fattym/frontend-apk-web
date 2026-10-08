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
  Circle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const unwrapList = (data) => data?.results || data || [];

const FLOW_STEPS = [
  {
    icon: School,
    title: 'Create course',
    body: 'Pick the learning area, grade, delivery mode, and visibility rules before publishing.',
    check: (data) => data.courses.length > 0,
  },
  {
    icon: BookOpen,
    title: 'Attach scheme',
    body: 'Link a Scheme of Work and keep the weekly CBC breakdown tied to the class.',
    check: (data) => data.schemes.length > 0,
  },
  {
    icon: Layers3,
    title: 'Generate topics',
    body: 'Turn weekly scheme entries into weekly topics for each topic.',
    check: (data) => data.topics.length > 0,
  },
  {
    icon: MessageSquare,
    title: 'Add posts',
    body: 'Publish notes, assignments, questions, and announcements inside each topic.',
    check: (data) => data.posts.length > 0,
  },
];

const VISIBILITY_RULES = [
  'Draft courses and unpublished topics stay hidden.',
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

  const flowData = useMemo(() => ({ courses, schemes, topics, posts }), [courses, schemes, topics, posts]);

  const completedSteps = useMemo(() => {
    return FLOW_STEPS.filter((step) => step.check(flowData));
  }, [flowData]);

  const completedStepCount = completedSteps.length;
  const totalSteps = FLOW_STEPS.length;
  const progressPct = (completedStepCount / totalSteps) * 100;

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

  const getActiveCourseMissing = () => {
    if (!activeCourse) return [];
    const missing = [];
    if (activeCourseSchemes.length === 0) missing.push('Attach a Scheme of Work');
    if (activeCourseTopics.length === 0) missing.push('Generate weekly topics');
    if (activeCoursePosts.length === 0) missing.push('Add lessons or assignments');
    if (activeCourse.status !== 'published') missing.push('Publish the course feed');
    return missing;
  };

  const activeCourseMissing = useMemo(getActiveCourseMissing, [activeCourse, activeCourseSchemes, activeCourseTopics, activeCoursePosts]);

  const getCourseMissing = (course) => {
    const courseSchemes = schemes.filter((s) => {
      const cid = s.course?.id || s.course || s.course_id;
      return String(cid) === String(course.id);
    });
    const courseTopics = topics.filter((t) => {
      const cid = t.course?.id || t.course || t.course_id;
      return String(cid) === String(course.id);
    });
    const coursePosts = posts.filter((p) => {
      const cid = p.course?.id || p.course || p.course_id;
      return String(cid) === String(course.id);
    });
    const missing = [];
    if (courseSchemes.length === 0) missing.push('Scheme');
    if (courseTopics.length === 0) missing.push('Topics');
    if (coursePosts.length === 0) missing.push('Posts');
    return missing;
  };

  if (loading) {
    return <div className="py-10 text-sm text-brand-navy/60">Loading course flow...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Progress */}
      <section className="glass-card overflow-hidden rounded-[2rem] bg-brand-navy text-white">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-8 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(228,59,26,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.12),transparent_28%)]" />
            <div className="relative max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-orange-100">
                <Sparkles className="h-3.5 w-3.5" />
                CBC course flow
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Course, scheme, topic, post. One clean path from CBC planning to student visibility.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                Build a Learning Area course, connect the Scheme of Work, auto-generate weekly topics,
                and publish lessons or assignments in a classroom-style feed.
              </p>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-300">
                    {completedStepCount} of {totalSteps} steps complete
                  </span>
                  <span className="text-xs text-white/70">{Math.round(progressPct)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-brand-navy/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-orange to-orange-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/courses')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-orange/10"
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
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/10"
                >
                  Student View <PlayCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-brand-navy/60 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/70">{metric.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-brand-orange/20 bg-brand-orange/10 p-4 text-sm text-orange-50">
              <p className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Visibility rule
              </p>
              <p className="mt-1 text-orange-50/80">
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

      {/* Flow Steps with Completion Tracking */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = step.check(flowData);
          const isCurrentStep = !isComplete && index === completedStepCount;
          return (
            <article
              key={step.title}
              className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white ${
                    isComplete
                      ? 'bg-emerald-500'
                      : isCurrentStep
                        ? 'bg-brand-orange'
                        : 'bg-gray-300 text-brand-charcoal'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="text-xs font-medium text-brand-charcoal/70">0{index + 1}</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-brand-navy">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-charcoal">{step.body}</p>
              {isComplete && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              )}
              {isCurrentStep && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-orange">
                  <Circle className="h-3 w-3 fill-current" />
                  In progress
                </span>
              )}
            </article>
          );
        })}
      </section>

      {/* Courses & Student Preview */}
      <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-brand-navy/60">Live pipeline</p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-navy">Courses in the system</h2>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="hidden rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-brand-charcoal/80 transition hover:bg-brand-grayLight/50 md:inline-flex"
            >
              Manage courses
            </button>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-sm text-brand-navy/60">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-grayLight/30 text-brand-charcoal/70">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p>No courses yet. Create a draft in Course Studio to start the flow.</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-orangeHover"
                  >
                    Create your first course
                  </button>
                </div>
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

                const missing = getCourseMissing(course);
                const publishedTopics = courseTopics.filter((t) => t.is_published);

                return (
                  <article key={course.id} className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-brand-navy truncate">{course.title || 'Untitled course'}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            course.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : course.status === 'submitted_for_review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-brand-grayLight/30 text-brand-charcoal/80'
                          }`}>
                            {(course.status || 'draft').replace('_', ' ')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-brand-charcoal">
                          {course.learning_area?.name || course.learning_area || 'Learning area not set'}
                          {course.grade_name ? ` · ${course.grade_name}` : ''}
                          {course.teacher_name ? ` · ${course.teacher_name}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/courses')}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-navy/80"
                      >
                        Open <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-brand-grayLight/50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Schemes</p>
                        <p className="mt-1 text-lg font-semibold text-brand-navy">{courseTopics.length > 0 || publishedTopics.length > 0 ? activeCourseSchemes.length : '—'}</p>
                      </div>
                      <div className="rounded-2xl bg-brand-grayLight/50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Topics</p>
                        <p className="mt-1 text-lg font-semibold text-brand-navy">{courseTopics.length}</p>
                      </div>
                      <div className="rounded-2xl bg-brand-grayLight/50 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Posts</p>
                        <p className="mt-1 text-lg font-semibold text-brand-navy">{coursePosts.length}</p>
                      </div>
                    </div>

                    {missing.length > 0 && (
                      <div className="mt-3 rounded-xl bg-brand-grayLight/50 px-3 py-2">
                        <p className="text-xs font-medium text-brand-navy/60 mb-1">What's missing</p>
                        <div className="flex flex-wrap gap-1.5">
                          {missing.map((item) => (
                            <span key={item} className="inline-flex items-center gap-1 text-xs text-brand-charcoal">
                              <AlertCircle className="h-3 w-3 text-brand-orange" />{item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-brand-navy/60">Student preview</p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-navy">What learners will see</h2>
            </div>
            <CalendarDays className="h-5 w-5 text-brand-charcoal/70" />
          </div>

          <div className="glass-card rounded-2xl p-5">
            {activeCourse ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">{activeCourse.title || 'Untitled course'}</p>
                    <p className="mt-1 text-xs text-brand-navy/60">
                      {activeCourse.learning_area?.name || activeCourse.learning_area || 'Learning area'} ·{' '}
                      {activeCourse.grade_name || 'Grade not set'}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange">
                    Published feed
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-gray-200 bg-brand-grayLight/50 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Course summary</p>
                    <p className="mt-2 text-sm leading-6 text-brand-charcoal/80">
                      Students open a course, browse weekly topics, then read posts, notes, and assignments in one thread.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-brand-navy/60">Visible sections</p>
                    <div className="mt-3 space-y-2">
                      {[
                        ['Topics', activeCourseTopics.length],
                        ['Posts', activeCoursePosts.length],
                        ['Schemes', activeCourseSchemes.length],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-xl bg-brand-grayLight/50 px-3 py-2 text-sm">
                          <span className="text-brand-charcoal/80">{label}</span>
                          <span className="font-medium text-brand-navy">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeCourseMissing.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
                        <AlertCircle className="h-4 w-4" />
                        What's missing
                      </p>
                      <ul className="mt-3 space-y-1 text-sm leading-6 text-amber-900/80">
                        {activeCourseMissing.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <Circle className="h-3 w-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl border border-brand-orange/20 bg-brand-orange/10 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-brand-orange">
                      <CheckCircle2 className="h-4 w-4" />
                      Visibility rules
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-brand-navy/80">
                      {VISIBILITY_RULES.map((rule) => (
                        <li key={rule} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-orange" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-brand-grayLight/50 p-6 text-sm text-brand-navy/60">
                <div className="flex flex-col items-center gap-3 text-center">
                  <School className="h-10 w-10 text-gray-300" />
                  <p>No course available yet. Create the first one in Course Studio.</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-orangeHover"
                  >
                    Create your first course
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CourseFlow;
