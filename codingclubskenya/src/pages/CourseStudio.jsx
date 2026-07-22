import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  School,
  Layers3,
  Sparkles,
  MessageSquare,
  Users,
  CalendarDays,
  CheckCircle2,
  Plus,
  ArrowRight,
  Save,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Tabs from '../components/Tabs';

const unwrap = (data) => data?.results || data || [];

const CBC_CORE_COMPETENCIES = [
  { id: 'communication_collaboration', name: 'Communication and Collaboration' },
  { id: 'critical_thinking', name: 'Critical Thinking and Problem Solving' },
  { id: 'creativity_imagination', name: 'Creativity and Imagination' },
  { id: 'citizenship', name: 'Citizenship' },
  { id: 'digital_literacy', name: 'Digital Literacy' },
  { id: 'learning_to_learn', name: 'Learning to Learn' },
  { id: 'self_efficacy', name: 'Self-Efficacy' },
];

const CBC_VALUES = [
  { id: 'love', name: 'Love' },
  { id: 'responsibility', name: 'Responsibility' },
  { id: 'respect', name: 'Respect' },
  { id: 'unity', name: 'Unity' },
  { id: 'peace', name: 'Peace' },
  { id: 'patriotism', name: 'Patriotism' },
  { id: 'social_justice', name: 'Social Justice' },
  { id: 'integrity', name: 'Integrity' },
];

const CBC_PCIS = [
  { id: 'health_education', name: 'Health Education' },
  { id: 'citizenship_governance', name: 'Citizenship & Governance' },
  { id: 'life_skills', name: 'Life Skills' },
  { id: 'environmental_sustainability', name: 'Environmental Sustainability' },
  { id: 'financial_literacy', name: 'Financial Literacy' },
];

const STATUS_LABELS = {
  draft: 'Draft',
  submitted_for_review: 'Review',
  published: 'Published',
};

const MODE_LABELS = {
  teacher_led: 'Teacher Led',
  self_paced: 'Self Paced',
  blended: 'Blended',
};

const emptyCourse = () => ({
  learning_area: '',
  grade: '',
  stream: '',
  term: '',
  year: '',
  title: '',
  description: '',
  delivery_mode: 'blended',
  status: 'draft',
  available_from: '',
  requires_parent_unlock: false,
  section: '',
  room: '',
  allow_student_posts: false,
  core_competencies: [],
  values: [],
  pcis: [],
});

const normalizeCourse = (course) => ({
  ...course,
  core_competencies: course.core_competencies || [],
  values: course.values || [],
  pcis: course.pcis || [],
  lessons: course.lessons || [],
  enrollments: course.enrollments || [],
});

const CourseStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'TEACHER';

  const [courses, setCourses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [active, setActive] = useState(null);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [schemeWeeks, setSchemeWeeks] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [enrollGradeId, setEnrollGradeId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('general');

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesRes, areasRes, gradesRes, studentsRes, schemesRes] = await Promise.all([
          api.get('/api/courses/courses/'),
          api.get('/api/academics/learning-areas/'),
          api.get('/api/academics/grades/'),
          api.get('/api/auth/users/students/'),
          api.get('/api/curriculum/schemes/'),
        ]);
        setCourses(unwrap(coursesRes.data));
        setAreas(unwrap(areasRes.data));
        setGrades(unwrap(gradesRes.data));
        setStudents(unwrap(studentsRes.data));
        setSchemes(unwrap(schemesRes.data));
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load course studio');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!active?.id) return;

    const loadCourseBits = async () => {
      try {
        const [topicsRes, postsRes, assignmentsRes, schemesRes] = await Promise.all([
          api.get(`/api/courses/topics/?course=${active.id}`),
          api.get(`/api/courses/posts/?course=${active.id}`),
          api.get(`/api/courses/assignments/?course=${active.id}`),
          api.get(`/api/curriculum/schemes/?course=${active.id}`),
        ]);

        setTopics(unwrap(topicsRes.data));
        setPosts(unwrap(postsRes.data));
        setAssignments(unwrap(assignmentsRes.data));
        const activeSchemes = unwrap(schemesRes.data);
        const weeks = [];
        activeSchemes.forEach((scheme) => {
          if (scheme.weeks) weeks.push(...scheme.weeks);
        });
        setSchemeWeeks(weeks);
      } catch (err) {
        setTopics([]);
        setPosts([]);
        setAssignments([]);
        setSchemeWeeks([]);
      }
    };

    loadCourseBits();
  }, [active?.id]);

  const metrics = useMemo(() => {
    const published = courses.filter((course) => course.status === 'published').length;
    const topicsCount = topics.length;
    const lessonsCount = active?.lessons?.length || 0;
    const postsCount = posts.length;
    return [
      { label: 'Courses', value: courses.length, note: `${published} published` },
      { label: 'Topics', value: topicsCount, note: 'Weekly CBC topic cards' },
      { label: 'Lessons', value: lessonsCount, note: 'Teacher-authored notes' },
      { label: 'Posts', value: postsCount, note: 'Materials, questions, assignments' },
    ];
  }, [courses, active, topics, posts]);

  const activeCourse = active ? normalizeCourse(active) : null;

  const courseSchemes = useMemo(() => {
    if (!activeCourse) return [];
    return schemes.filter((scheme) => String(scheme.course?.id || scheme.course || scheme.course_id) === String(activeCourse.id));
  }, [schemes, activeCourse]);

  const activeStudents = useMemo(() => {
    if (!activeCourse) return [];
    return students.filter((student) => activeCourse.enrollments.some((enrollment) => String(enrollment.learner) === String(student.id)));
  }, [students, activeCourse]);

  const availableStudents = useMemo(() => {
    if (!activeCourse) return students;
    return students.filter((student) => !activeCourse.enrollments.some((enrollment) => String(enrollment.learner) === String(student.id)));
  }, [students, activeCourse]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return availableStudents;
    const term = studentSearch.toLowerCase();
    return availableStudents.filter((student) =>
      `${student.first_name} ${student.last_name} ${student.email}`.toLowerCase().includes(term)
    );
  }, [availableStudents, studentSearch]);

  const openCourse = async (courseId) => {
    setError('');
    try {
      const res = await api.get(`/api/courses/courses/${courseId}/`);
      setActive(normalizeCourse(res.data));
      setTab('general');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to open course');
    }
  };

  const openNew = () => {
    setActive(emptyCourse());
    setTab('general');
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    if (!activeCourse?.learning_area) {
      setError('Select a learning area before saving.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = { ...activeCourse };
      payload.learning_area = typeof payload.learning_area === 'object' ? payload.learning_area?.id : payload.learning_area;
      payload.grade = typeof payload.grade === 'object' ? payload.grade?.id : payload.grade || null;
      payload.stream = typeof payload.stream === 'object' ? payload.stream?.id : payload.stream || null;
      payload.term = typeof payload.term === 'object' ? payload.term?.id : payload.term || null;

      if (payload.available_from) {
        payload.available_from = new Date(payload.available_from).toISOString();
      } else {
        delete payload.available_from;
      }

      let response;
      if (activeCourse.id) {
        response = await api.patch(`/api/courses/courses/${activeCourse.id}/`, payload);
      } else {
        response = await api.post('/api/courses/courses/', payload);
      }

      const updated = normalizeCourse(response.data);
      setActive(updated);
      setCourses((prev) => {
        const exists = prev.some((course) => course.id === updated.id);
        return exists ? prev.map((course) => (course.id === updated.id ? updated : course)) : [updated, ...prev];
      });
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const toggleMultiValue = (field, value) => {
    const current = activeCourse?.[field] || [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    setActive({ ...activeCourse, [field]: next });
  };

  const doAction = async (action, successMessage) => {
    if (!activeCourse?.id) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/api/courses/courses/${activeCourse.id}/${action}/`);
      const refreshed = await api.get(`/api/courses/courses/${activeCourse.id}/`);
      const normalized = normalizeCourse(refreshed.data);
      setActive(normalized);
      setCourses((prev) => prev.map((course) => (course.id === normalized.id ? normalized : course)));
      if (successMessage) {
        setError(successMessage);
      }
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const generateTopicsFromScheme = async () => {
    if (!activeCourse?.id) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/api/courses/courses/${activeCourse.id}/generate_topics_from_scheme/`, {
        scheme_id: selectedSchemeId ? Number(selectedSchemeId) : undefined,
      });
      const res = await api.get(`/api/courses/topics/?course=${activeCourse.id}`);
      setTopics(unwrap(res.data));
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const addTopic = async () => {
    if (!activeCourse?.id) return;
    const payload = {
      course: activeCourse.id,
      learning_area: activeCourse.learning_area?.id || activeCourse.learning_area,
      title: 'New Topic',
      week: topics.length + 1,
      order: topics.length + 1,
      learning_outcomes: '',
    };

    try {
      const res = await api.post('/api/courses/topics/', payload);
      setTopics((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const saveTopic = async (topic) => {
    try {
      if (topic.id) {
        const res = await api.patch(`/api/courses/topics/${topic.id}/`, topic);
        setTopics((prev) => prev.map((item) => (item.id === topic.id ? res.data : item)));
      } else {
        const res = await api.post('/api/courses/topics/', topic);
        setTopics((prev) => [...prev.filter((item) => item !== topic), res.data]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const publishTopic = async (topicId) => {
    try {
      await api.post(`/api/courses/topics/${topicId}/publish/`);
      setTopics((prev) => prev.map((topic) => (topic.id === topicId ? { ...topic, is_published: true } : topic)));
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const addLessonFromScheme = async (week) => {
    if (!activeCourse?.id || !week?.sub_strand?.id) {
      setError('Select a scheme week with a sub-strand first.');
      return;
    }

    try {
      const res = await api.post('/api/courses/lessons/', {
        course: activeCourse.id,
        sub_strand: week.sub_strand.id,
        title: week.sub_strand?.name || `Lesson ${activeCourse.lessons.length + 1}`,
        lesson_number: activeCourse.lessons.length + 1,
        strand: week.strand?.name || '',
        objectives: week.specific_learning_outcomes || '',
        learning_activities: '',
        resources: '',
        assessment: '',
        remarks: '',
        content: '',
        is_published: false,
      });
      setActive({ ...activeCourse, lessons: [...activeCourse.lessons, res.data] });
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const saveLesson = async (lesson) => {
    try {
      if (lesson.id) {
        const res = await api.patch(`/api/courses/lessons/${lesson.id}/`, lesson);
        setActive({
          ...activeCourse,
          lessons: activeCourse.lessons.map((item) => (item.id === lesson.id ? res.data : item)),
        });
      } else {
        const res = await api.post('/api/courses/lessons/', lesson);
        setActive({
          ...activeCourse,
          lessons: [...activeCourse.lessons.filter((item) => item !== lesson), res.data],
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const publishLesson = async (lessonId) => {
    try {
      await api.post(`/api/courses/lessons/${lessonId}/publish/`);
      setActive({
        ...activeCourse,
        lessons: activeCourse.lessons.map((item) => (item.id === lessonId ? { ...item, is_published: true } : item)),
      });
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const removeLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/api/courses/lessons/${lessonId}/`);
      setActive({
        ...activeCourse,
        lessons: activeCourse.lessons.filter((item) => item.id !== lessonId),
      });
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const enrollStudent = async (studentId) => {
    try {
      await api.post(`/api/courses/courses/${activeCourse.id}/enroll/`, { learner_id: studentId });
      const refreshed = await api.get(`/api/courses/courses/${activeCourse.id}/`);
      setActive(normalizeCourse(refreshed.data));
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const unenrollStudent = async (studentId) => {
    try {
      await api.post(`/api/courses/courses/${activeCourse.id}/unenroll/`, { learner_id: studentId });
      const refreshed = await api.get(`/api/courses/courses/${activeCourse.id}/`);
      setActive(normalizeCourse(refreshed.data));
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  const enrollByGrade = async () => {
    if (!enrollGradeId) return;
    try {
      await api.post(`/api/courses/courses/${activeCourse.id}/enroll_by_grade/`, { grade_id: Number(enrollGradeId) });
      const refreshed = await api.get(`/api/courses/courses/${activeCourse.id}/`);
      setActive(normalizeCourse(refreshed.data));
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data || err.message));
    }
  };

  if (loading) {
    return <div className="py-10 text-sm text-slate-500">Loading course studio...</div>;
  }

  if (!isTeacher) {
    return (
      <div className="glass-card rounded-2xl p-6 text-sm text-slate-600">
        Course Studio is a teacher workspace.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem] bg-slate-950 text-white">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-8 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.16),transparent_28%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
                <Sparkles className="h-3.5 w-3.5" />
                CBC Classroom Studio
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Build a CBC course like Google Classroom, but with weekly scheme-driven topics.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Use the Kenya CBC structure to create the course, map core competencies, generate topics from the scheme of work, and publish lessons, posts, and assignments for learners.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={openNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-teal-50"
                >
                  <Plus className="h-4 w-4" />
                  New Course
                </button>
                <button
                  onClick={() => navigate('/course-flow')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Review flow <ArrowRight className="h-4 w-4" />
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
            <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/10 p-4 text-sm text-teal-50">
              <p className="font-medium">CBC ready</p>
              <p className="mt-1 text-teal-50/80">Topics come from schemes of work. Lessons and posts stay tied to the active course.</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="glass-card rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="glass-card rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Course list</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Teaching workspace</h2>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No courses yet. Create one to start the CBC classroom flow.
              </div>
            ) : (
              courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => openCourse(course.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                    activeCourse?.id === course.id
                      ? 'border-teal-300 bg-teal-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{course.title || 'Untitled course'}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {course.learning_area?.name || course.learning_area || 'Learning area'}
                        {course.grade_name ? ` · ${course.grade_name}` : ''}
                        {course.teacher_name ? ` · ${course.teacher_name}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {STATUS_LABELS[course.status] || course.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] overflow-hidden">
          {activeCourse ? (
            <>
              <div className="border-b border-slate-200 bg-white/60 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-teal-700">Course editor</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">{activeCourse.title || 'Untitled course'}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeCourse.learning_area?.name || activeCourse.learning_area || 'Learning area'} · {activeCourse.grade_name || 'No grade'} · {activeCourse.teacher_name || 'No teacher'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => doAction(activeCourse.status === 'draft' ? 'submit' : 'publish')}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {activeCourse.status === 'draft' ? 'Submit' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => doAction('clone')}
                      disabled={saving || activeCourse.status !== 'published'}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Clone
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 pt-3">
                <Tabs
                  tabs={[
                    { key: 'general', label: 'General' },
                    { key: 'cbc', label: 'CBC' },
                    { key: 'curriculum', label: 'Curriculum' },
                    { key: 'roster', label: 'Roster' },
                    { key: 'feed', label: 'Class Feed' },
                  ]}
                  active={tab}
                  onChange={setTab}
                />
              </div>

              <div className="p-5">
                {tab === 'general' && (
                  <form onSubmit={saveCourse} className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={activeCourse.title || ''}
                        onChange={(e) => setActive({ ...activeCourse, title: e.target.value })}
                        placeholder="e.g. Grade 4 Agriculture & Nutrition"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Learning Area</label>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={typeof activeCourse.learning_area === 'object' ? activeCourse.learning_area?.id || '' : activeCourse.learning_area || ''}
                        onChange={(e) => setActive({ ...activeCourse, learning_area: e.target.value ? Number(e.target.value) : '' })}
                      >
                        <option value="">Select learning area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Grade</label>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={typeof activeCourse.grade === 'object' ? activeCourse.grade?.id || '' : activeCourse.grade || ''}
                        onChange={(e) => setActive({ ...activeCourse, grade: e.target.value ? Number(e.target.value) : '' })}
                      >
                        <option value="">Select grade</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Stream</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={typeof activeCourse.stream === 'object' ? activeCourse.stream?.id || '' : activeCourse.stream || ''}
                        onChange={(e) => setActive({ ...activeCourse, stream: e.target.value ? Number(e.target.value) : '' })}
                        placeholder="Stream id or leave blank"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Term</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={typeof activeCourse.term === 'object' ? activeCourse.term?.id || '' : activeCourse.term || ''}
                        onChange={(e) => setActive({ ...activeCourse, term: e.target.value ? Number(e.target.value) : '' })}
                        placeholder="Term id or leave blank"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Delivery Mode</label>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={activeCourse.delivery_mode || 'blended'}
                        onChange={(e) => setActive({ ...activeCourse, delivery_mode: e.target.value })}
                      >
                        {Object.entries(MODE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Available From</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={activeCourse.available_from ? String(activeCourse.available_from).slice(0, 16) : ''}
                        onChange={(e) => setActive({ ...activeCourse, available_from: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Section</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={activeCourse.section || ''}
                        onChange={(e) => setActive({ ...activeCourse, section: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Room</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-teal-400"
                        value={activeCourse.room || ''}
                        onChange={(e) => setActive({ ...activeCourse, room: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        rows="4"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-400"
                        value={activeCourse.description || ''}
                        onChange={(e) => setActive({ ...activeCourse, description: e.target.value })}
                        placeholder="Course summary"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-4 rounded-2xl bg-slate-50 p-4">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!activeCourse.requires_parent_unlock}
                          onChange={(e) => setActive({ ...activeCourse, requires_parent_unlock: e.target.checked })}
                        />
                        Requires parent unlock
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!activeCourse.allow_student_posts}
                          onChange={(e) => setActive({ ...activeCourse, allow_student_posts: e.target.checked })}
                        />
                        Allow student posts
                      </label>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        Save Course
                      </button>
                    </div>
                  </form>
                )}

                {tab === 'cbc' && (
                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <School className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-semibold text-slate-900">Core Competencies</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CBC_CORE_COMPETENCIES.map((item) => {
                          const activeFlag = activeCourse.core_competencies.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleMultiValue('core_competencies', item.id)}
                              className={`rounded-full border px-3 py-2 text-sm transition ${
                                activeFlag ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-semibold text-slate-900">Values</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CBC_VALUES.map((item) => {
                          const activeFlag = activeCourse.values.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleMultiValue('values', item.id)}
                              className={`rounded-full border px-3 py-2 text-sm transition ${
                                activeFlag ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-semibold text-slate-900">PCIs</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CBC_PCIS.map((item) => {
                          const activeFlag = activeCourse.pcis.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleMultiValue('pcis', item.id)}
                              className={`rounded-full border px-3 py-2 text-sm transition ${
                                activeFlag ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      These selections are stored on the course record and can later be pushed into lesson planning, report narratives, and scheme suggestions.
                    </div>
                  </div>
                )}

                {tab === 'curriculum' && (
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-slate-950 p-5 text-white">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-teal-200">Scheme linkage</p>
                          <h3 className="mt-1 text-xl font-semibold">Generate topics from CBC Scheme of Work</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <select
                            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                            value={selectedSchemeId}
                            onChange={(e) => setSelectedSchemeId(e.target.value)}
                          >
                            <option value="">Use the current course scheme</option>
                            {courseSchemes.map((scheme) => (
                              <option key={scheme.id} value={scheme.id}>
                                {scheme.term?.name || `Scheme #${scheme.id}`}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={generateTopicsFromScheme}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-teal-50 disabled:opacity-50"
                          >
                            <Sparkles className="h-4 w-4" />
                            Generate Topics
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Topics</p>
                        <h3 className="text-lg font-semibold text-slate-900">{topics.length} topic cards</h3>
                      </div>
                      <button
                        type="button"
                        onClick={addTopic}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        <Plus className="h-4 w-4" />
                        Add Topic
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {topics.map((topic) => (
                        <div key={topic.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <input
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                                value={topic.title || ''}
                                onChange={(e) => setTopics((prev) => prev.map((item) => (item.id === topic.id ? { ...item, title: e.target.value } : item)))}
                              />
                              <p className="mt-2 text-xs text-slate-500">
                                Week {topic.week || 0} · {topic.is_published ? 'Published' : 'Draft'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => publishTopic(topic.id)}
                              className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                            >
                              Publish
                            </button>
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <input
                              type="number"
                              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                              value={topic.week || 0}
                              onChange={(e) => setTopics((prev) => prev.map((item) => (item.id === topic.id ? { ...item, week: Number(e.target.value) } : item)))}
                              placeholder="Week"
                            />
                            <input
                              type="number"
                              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                              value={topic.order || 0}
                              onChange={(e) => setTopics((prev) => prev.map((item) => (item.id === topic.id ? { ...item, order: Number(e.target.value) } : item)))}
                              placeholder="Order"
                            />
                            <button
                              type="button"
                              onClick={() => saveTopic(topic)}
                              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                            >
                              Save
                            </button>
                          </div>

                          <textarea
                            rows="3"
                            className="mt-3 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                            value={topic.learning_outcomes || ''}
                            onChange={(e) => setTopics((prev) => prev.map((item) => (item.id === topic.id ? { ...item, learning_outcomes: e.target.value } : item)))}
                            placeholder="CBC learning outcomes"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Layers3 className="h-4 w-4 text-teal-700" />
                        Lessons
                      </div>
                      <div className="mt-3 space-y-3">
                        {schemeWeeks.slice(0, 6).map((week) => (
                          <div key={week.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">Week {week.week_number}</p>
                              <p className="text-xs text-slate-500">{week.sub_strand?.name || week.strand?.name || 'Scheme week'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addLessonFromScheme(week)}
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                              <Plus className="h-4 w-4" />
                              Add lesson
                            </button>
                          </div>
                        ))}
                        {schemeWeeks.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                            No scheme weeks loaded yet. Link a scheme of work first.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 space-y-3">
                        {(activeCourse.lessons || []).map((lesson) => (
                          <div key={lesson.id || lesson.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <input
                                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                                  value={lesson.title || ''}
                                  onChange={(e) => setActive({
                                    ...activeCourse,
                                    lessons: activeCourse.lessons.map((item) => (item === lesson ? { ...item, title: e.target.value } : item)),
                                  })}
                                />
                                <p className="mt-2 text-xs text-slate-500">{lesson.is_published ? 'Published' : 'Draft'} · {lesson.strand || 'No strand'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => publishLesson(lesson.id)}
                                  className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
                                >
                                  Publish
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeLesson(lesson.id)}
                                  className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <textarea
                                rows="3"
                                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                                value={lesson.objectives || ''}
                                onChange={(e) => setActive({
                                  ...activeCourse,
                                  lessons: activeCourse.lessons.map((item) => (item === lesson ? { ...item, objectives: e.target.value } : item)),
                                })}
                                placeholder="Learning objectives"
                              />
                              <textarea
                                rows="3"
                                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
                                value={lesson.learning_activities || ''}
                                onChange={(e) => setActive({
                                  ...activeCourse,
                                  lessons: activeCourse.lessons.map((item) => (item === lesson ? { ...item, learning_activities: e.target.value } : item)),
                                })}
                                placeholder="Learning activities"
                              />
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() => saveLesson(lesson)}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                              >
                                <Save className="h-4 w-4" />
                                Save lesson
                              </button>
                            </div>
                          </div>
                        ))}
                        {(activeCourse.lessons || []).length === 0 && (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                            No lessons yet. Use a scheme week to create the first lesson.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'roster' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                        value={enrollGradeId}
                        onChange={(e) => setEnrollGradeId(e.target.value)}
                      >
                        <option value="">Enroll by grade</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={enrollByGrade}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                      >
                        Enroll grade
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-semibold text-slate-900">Enrolled learners ({activeStudents.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {activeStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => unenrollStudent(student.id)}
                              className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-rose-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {activeStudents.length === 0 && (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                            No learners enrolled yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <School className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-semibold text-slate-900">Search students</h3>
                      </div>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-teal-400"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name or email"
                      />
                      <div className="mt-3 max-h-60 space-y-2 overflow-auto">
                        {filteredStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => enrollStudent(student.id)}
                              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                        {filteredStudents.length === 0 && (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                            No matching students found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'feed' && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-teal-700" />
                          <h3 className="text-sm font-semibold text-slate-900">Class posts</h3>
                        </div>
                        <div className="space-y-3">
                          {posts.map((post) => (
                            <div key={post.id} className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-900">{post.title || post.post_type}</p>
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">{post.post_type}</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{post.content}</p>
                            </div>
                          ))}
                          {posts.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                              No posts yet. Teachers can publish assignments, materials, or questions.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-teal-700" />
                          <h3 className="text-sm font-semibold text-slate-900">Assignments</h3>
                        </div>
                        <div className="space-y-3">
                          {assignments.map((assignment) => (
                            <div key={assignment.id} className="rounded-2xl bg-slate-50 p-3">
                              <p className="text-sm font-medium text-slate-900">{assignment.title}</p>
                              <p className="mt-1 text-sm text-slate-600">{assignment.instructions}</p>
                              {assignment.due_date && (
                                <p className="mt-2 text-xs text-slate-500">
                                  Due {new Date(assignment.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                          {assignments.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                              No assignments yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      The backend already supports topic publishing, lesson visibility, assignments, posts, quizzes, and comments. This studio gives you a CBC-first control panel on top of that structure.
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center p-10 text-center">
              <div className="max-w-md">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">Select a course to edit</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Start by creating a CBC course, then attach the scheme of work and generate weekly topics.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-teal-700" />
          CBC classroom workspace
        </span>
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-teal-700" />
          Scheme-driven topics and published learner feed
        </span>
      </div>
    </div>
  );
};

export default CourseStudio;
