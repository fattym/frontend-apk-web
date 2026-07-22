import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Layers,
  Megaphone,
  Plus,
  Save,
  Search,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";
import api from "../services/api";

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  submitted_for_review: "bg-amber-50 text-amber-800 border-amber-200",
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const MODE_LABELS = {
  teacher_led: "Teacher Led",
  self_paced: "Self Paced",
  blended: "Blended",
};

const POST_TYPES = [
  { value: "material", label: "Material" },
  { value: "question", label: "Question" },
  { value: "assignment", label: "Assignment" },
];

const CBC_CORE_COMPETENCIES = [
  {
    id: "communication_collaboration",
    name: "Communication and Collaboration",
  },
  { id: "critical_thinking", name: "Critical Thinking and Problem Solving" },
  { id: "creativity_imagination", name: "Creativity and Imagination" },
  { id: "citizenship", name: "Citizenship" },
  { id: "digital_literacy", name: "Digital Literacy" },
  { id: "learning_to_learn", name: "Learning to Learn" },
  { id: "self_efficacy", name: "Self-Efficacy" },
];

const CBC_VALUES = [
  { id: "love", name: "Love" },
  { id: "responsibility", name: "Responsibility" },
  { id: "respect", name: "Respect" },
  { id: "unity", name: "Unity" },
  { id: "peace", name: "Peace" },
  { id: "patriotism", name: "Patriotism" },
  { id: "social_justice", name: "Social Justice" },
  { id: "integrity", name: "Integrity" },
];

const CBC_PCIS = [
  { id: "health_education", name: "Health Education" },
  { id: "citizenship_governance", name: "Global Citizenship & Governance" },
  { id: "life_skills", name: "Life Skills & Values Education" },
  {
    id: "environmental_sustainability",
    name: "Environmental & Climate Sustainability",
  },
  { id: "financial_literacy", name: "Financial & Economic Literacy" },
];

const emptyCourse = () => ({
  learning_area: "",
  grade: "",
  stream: "",
  term: "",
  year: "",
  title: "",
  description: "",
  delivery_mode: "blended",
  status: "draft",
  available_from: "",
  requires_parent_unlock: false,
  section: "",
  room: "",
  allow_student_posts: false,
  core_competencies: [],
  values: [],
  pcis: [],
});

const emptyTopic = (courseId = "", order = 1) => ({
  course: courseId,
  title: "",
  week: order,
  order,
  learning_outcomes: "",
  sub_strand: "",
});

const emptyPost = (courseId = "", topicId = "") => ({
  course: courseId,
  topic: topicId,
  post_type: "material",
  title: "",
  content: "",
  due_date: "",
  attachments: [],
});

const emptyAssignment = (courseId = "", topicId = "") => ({
  course: courseId,
  topic: topicId,
  title: "",
  instructions: "",
  due_date: "",
});

const emptyLesson = (
  courseId = "",
  lessonNumber = 1,
  topicId = "",
  subStrandId = "",
) => ({
  course: courseId,
  topic: topicId,
  sub_strand: subStrandId,
  title: "",
  lesson_number: lessonNumber,
  strand: "",
  objectives: "",
  learning_activities: "",
  resources: "",
  assessment: "",
  remarks: "",
  content: "",
  video_url: "",
  attachment: null,
  order: lessonNumber,
  prerequisite: "",
  is_published: false,
  publish_at: "",
  __clientId: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
});

const formatDateTime = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const normalizeId = (value) =>
  value && typeof value === "object" ? value.id : value || "";

const normalizeCourse = (course) => ({
  ...emptyCourse(),
  ...course,
  core_competencies: Array.isArray(course?.core_competencies)
    ? course.core_competencies
    : [],
  values: Array.isArray(course?.values) ? course.values : [],
  pcis: Array.isArray(course?.pcis) ? course.pcis : [],
  lessons: Array.isArray(course?.lessons) ? course.lessons : [],
  enrollments: Array.isArray(course?.enrollments) ? course.enrollments : [],
});

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [areas, setAreas] = useState([]);
  const [streams, setStreams] = useState([]);
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [subStrands, setSubStrands] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [active, setActive] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState("");
  const [enrollGradeId, setEnrollGradeId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [topicDraft, setTopicDraft] = useState(emptyTopic());
  const [postDraft, setPostDraft] = useState(emptyPost());
  const [assignmentDraft, setAssignmentDraft] = useState(emptyAssignment());

  const loadCourses = useCallback(async () => {
    const response = await api.get("/api/courses/courses/");
    setCourses(response.data.results || response.data || []);
  }, []);

  const loadReferenceData = useCallback(async () => {
    const [gradesRes, areasRes, streamsRes, termsRes, studentsRes, schemesRes] =
      await Promise.all([
        api.get("/api/academics/grades/"),
        api.get("/api/academics/learning-areas/"),
        api.get("/api/academics/streams/"),
        api.get("/api/academics/terms/"),
        api.get("/api/auth/users/students/"),
        api.get("/api/curriculum/schemes/"),
      ]);

    setGrades(gradesRes.data.results || gradesRes.data || []);
    setAreas(areasRes.data.results || areasRes.data || []);
    setStreams(streamsRes.data.results || streamsRes.data || []);
    setTerms(termsRes.data.results || termsRes.data || []);
    setStudents(studentsRes.data.results || studentsRes.data || []);
    setSchemes(schemesRes.data.results || schemesRes.data || []);
  }, []);

  const loadWorkspace = useCallback(async (course) => {
    if (!course?.id) return;
    const [topicsRes, postsRes, assignmentsRes, schemeWeeksRes, subStrandsRes] =
      await Promise.all([
        api.get(`/api/courses/courses/${course.id}/topics/`),
        api.get(`/api/courses/courses/${course.id}/posts/`),
        api.get(`/api/courses/courses/${course.id}/assignments/`),
        api.get(`/api/curriculum/schemes/?course=${course.id}`),
        course.learning_area
          ? api.get(
              `/api/academics/sub-strands/?learning_area=${normalizeId(course.learning_area)}`,
            )
          : Promise.resolve({ data: [] }),
      ]);

    const schemeData = schemeWeeksRes.data.results || schemeWeeksRes.data || [];
    const allWeeks = [];
    schemeData.forEach((scheme) => {
      if (Array.isArray(scheme.weeks)) {
        allWeeks.push(...scheme.weeks);
      }
    });

    setTopics(topicsRes.data.results || topicsRes.data || []);
    setPosts(postsRes.data.results || postsRes.data || []);
    setAssignments(assignmentsRes.data.results || assignmentsRes.data || []);
    setSubStrands(subStrandsRes.data.results || subStrandsRes.data || []);
    setSelectedSchemeId(schemeData[0]?.id ? String(schemeData[0].id) : "");
    setTopicDraft((prev) => ({
      ...prev,
      course: course.id,
      topic: prev.topic || "",
    }));
    setPostDraft((prev) => ({
      ...prev,
      course: course.id,
      topic: prev.topic || topicsRes.data?.[0]?.id || "",
    }));
    setAssignmentDraft((prev) => ({
      ...prev,
      course: course.id,
      topic: prev.topic || topicsRes.data?.[0]?.id || "",
    }));

    return allWeeks;
  }, []);

  const refreshCourse = useCallback(async (courseId) => {
    const response = await api.get(`/api/courses/courses/${courseId}/`);
    return normalizeCourse(response.data);
  }, []);

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([loadCourses(), loadReferenceData()]);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data || err.message),
        );
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [loadCourses, loadReferenceData]);

  useEffect(() => {
    if (!active?.id) return;

    const sync = async () => {
      try {
        const course = normalizeCourse(await refreshCourse(active.id));
        setActive(course);
        await loadWorkspace(course);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            JSON.stringify(err.response?.data || err.message),
        );
      }
    };

    sync();
  }, [active?.id, refreshCourse, loadWorkspace]);

  useEffect(() => {
    if (!active?.learning_area) {
      setSubStrands([]);
      return;
    }

    const learningAreaId = normalizeId(active.learning_area);
    api
      .get(`/api/academics/sub-strands/?learning_area=${learningAreaId}`)
      .then((response) =>
        setSubStrands(response.data.results || response.data || []),
      )
      .catch(() => setSubStrands([]));
  }, [active?.learning_area]);

  useEffect(() => {
    if (!active?.id) return;
    setTopicDraft(emptyTopic(active.id, (topics.length || 0) + 1));
    setPostDraft(emptyPost(active.id));
    setAssignmentDraft(emptyAssignment(active.id));
  }, [active?.id]);

  useEffect(() => {
    if (!active?.id) return;
    const firstTopicId = topics[0]?.id || "";
    if (!postDraft.topic && firstTopicId) {
      setPostDraft((prev) => ({ ...prev, topic: firstTopicId }));
    }
    if (!assignmentDraft.topic && firstTopicId) {
      setAssignmentDraft((prev) => ({ ...prev, topic: firstTopicId }));
    }
  }, [active?.id, topics, postDraft.topic, assignmentDraft.topic]);

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((course) => {
      if (!q) return true;
      const areaName =
        areas.find((area) => String(area.id) === String(course.learning_area))
          ?.name || "";
      const gradeName = course.grade_name || "";
      const streamName = course.stream_name || "";
      const termName = course.term_name || "";
      return [
        course.title,
        course.description,
        areaName,
        gradeName,
        streamName,
        termName,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      );
    });
  }, [courses, search]);

  const activeLearningAreaId = normalizeId(active?.learning_area);
  const availableAreas = useMemo(() => {
    if (!active?.grade) return areas;
    const gradeId = normalizeId(active.grade);
    return areas.filter((area) => String(area.grade) === String(gradeId));
  }, [areas, active?.grade]);

  const availableStreams = useMemo(() => {
    if (!active?.grade) return streams;
    const gradeId = normalizeId(active.grade);
    return streams.filter((stream) => String(stream.grade) === String(gradeId));
  }, [streams, active?.grade]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter((student) => {
      const fullName =
        `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
      return (
        fullName.includes(q) ||
        String(student.email || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [students, studentSearch]);

  const selectedCourseStats = useMemo(() => {
    if (!active) {
      return { topics: 0, lessons: 0, posts: 0, assignments: 0, learners: 0 };
    }

    return {
      topics: topics.length,
      lessons: active.lessons?.length || 0,
      posts: posts.length,
      assignments: assignments.length,
      learners: active.enrollments?.length || 0,
    };
  }, [active, topics.length, posts.length, assignments.length]);

  const groupedTopics = useMemo(() => {
    return topics.reduce((acc, topic) => {
      const week = topic.week || 0;
      if (!acc[week]) acc[week] = [];
      acc[week].push(topic);
      return acc;
    }, {});
  }, [topics]);

  const lessonsByTopic = useMemo(() => {
    return (active?.lessons || []).reduce((acc, lesson) => {
      const topicId = lesson.topic?.id || lesson.topic || "unlinked";
      if (!acc[topicId]) acc[topicId] = [];
      acc[topicId].push(lesson);
      return acc;
    }, {});
  }, [active?.lessons]);

  const courseLessonsSorted = useMemo(() => {
    return [...(active?.lessons || [])].sort((a, b) => {
      const orderA = Number(a.order || a.lesson_number || 0);
      const orderB = Number(b.order || b.lesson_number || 0);
      if (orderA !== orderB) return orderA - orderB;
      return Number(a.lesson_number || 0) - Number(b.lesson_number || 0);
    });
  }, [active?.lessons]);

  const updateActive = (patch) => {
    setActive((prev) => (prev ? normalizeCourse({ ...prev, ...patch }) : prev));
  };

  const saveCourse = async () => {
    if (!active) return;
    const payload = {
      ...active,
      learning_area: normalizeId(active.learning_area),
      grade: normalizeId(active.grade),
      stream: normalizeId(active.stream),
      term: normalizeId(active.term),
      available_from: active.available_from
        ? new Date(active.available_from).toISOString()
        : null,
    };

    if (!payload.learning_area) {
      setError("Select a learning area before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (active.id) {
        const response = await api.patch(
          `/api/courses/courses/${active.id}/`,
          payload,
        );
        const next = normalizeCourse(response.data);
        setActive(next);
        setCourses((prev) =>
          prev.map((course) => (course.id === next.id ? next : course)),
        );
      } else {
        const response = await api.post("/api/courses/courses/", payload);
        const next = normalizeCourse(response.data);
        setActive(next);
        setCourses((prev) => [
          next,
          ...prev.filter((course) => course.id !== next.id),
        ]);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const createNewCourse = () => {
    setActive(normalizeCourse(emptyCourse()));
    setTopics([]);
    setPosts([]);
    setAssignments([]);
    setSubStrands([]);
    setTopicDraft(emptyTopic());
    setPostDraft(emptyPost());
    setAssignmentDraft(emptyAssignment());
    setActiveTab("overview");
    setError("");
  };

  const addLesson = () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    const nextLessonNumber = (active.lessons?.length || 0) + 1;
    const defaultTopicId = topics[0]?.id || "";
    const defaultSubStrandId = subStrands[0]?.id || "";
    setActive((prev) => {
      if (!prev) return prev;
      return normalizeCourse({
        ...prev,
        lessons: [
          ...(prev.lessons || []),
          emptyLesson(
            prev.id,
            nextLessonNumber,
            defaultTopicId,
            defaultSubStrandId,
          ),
        ],
      });
    });
    setActiveTab("topics");
  };

  const openCourse = async (course) => {
    setError("");
    try {
      const response = await api.get(`/api/courses/courses/${course.id}/`);
      const next = normalizeCourse(response.data);
      setActive(next);
      setActiveTab("overview");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    }
  };

  const publishCourse = async () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post(`/api/courses/courses/${active.id}/publish/`);
      const next = await refreshCourse(active.id);
      setActive(next);
      setCourses((prev) =>
        prev.map((course) => (course.id === next.id ? next : course)),
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const cloneCourse = async () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await api.post(
        `/api/courses/courses/${active.id}/clone/`,
      );
      const cloned = normalizeCourse(response.data);
      setCourses((prev) => [cloned, ...prev]);
      setActive(cloned);
      await loadWorkspace(cloned);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleArrayToggle = (field, value) => {
    if (!active) return;
    const current = Array.isArray(active[field]) ? active[field] : [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateActive({ [field]: next });
  };

  const updateLessonAtIndex = (index, patch) => {
    setActive((prev) => {
      if (!prev) return prev;
      const lessons = [...(prev.lessons || [])];
      lessons[index] = { ...lessons[index], ...patch };
      return normalizeCourse({ ...prev, lessons });
    });
  };

  const saveLessonAtIndex = async (index) => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    const lesson = active.lessons?.[index];
    if (!lesson) return;

    const topicId = normalizeId(lesson.topic);
    const topicMatch = topics.find(
      (item) => String(item.id) === String(topicId),
    );
    const resolvedSubStrand =
      normalizeId(lesson.sub_strand) || normalizeId(topicMatch?.sub_strand);

    if (!resolvedSubStrand) {
      setError("Select a CBC sub-strand before saving the lesson.");
      return;
    }

    const payload = {
      course: active.id,
      topic_id: topicId || null,
      sub_strand: resolvedSubStrand,
      title: lesson.title || "",
      lesson_number: Number(lesson.lesson_number || index + 1),
      strand: lesson.strand || "",
      objectives: lesson.objectives || "",
      learning_activities: lesson.learning_activities || "",
      resources: lesson.resources || "",
      assessment: lesson.assessment || "",
      remarks: lesson.remarks || "",
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      order: Number(lesson.order || lesson.lesson_number || index + 1),
      prerequisite: normalizeId(lesson.prerequisite) || null,
      is_published: Boolean(lesson.is_published),
      publish_at: lesson.publish_at
        ? new Date(lesson.publish_at).toISOString()
        : null,
    };

    setSaving(true);
    setError("");
    try {
      const response = lesson.id
        ? await api.patch(`/api/courses/lessons/${lesson.id}/`, payload)
        : await api.post("/api/courses/lessons/", payload);
      const saved = response.data;
      setActive((prev) => {
        if (!prev) return prev;
        const lessons = [...(prev.lessons || [])];
        lessons[index] = saved;
        return normalizeCourse({ ...prev, lessons });
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleLessonPublish = async (index) => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    const lesson = active.lessons?.[index];
    if (!lesson?.id) {
      setError("Save the lesson before publishing it.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const endpoint = lesson.is_published ? "unpublish" : "publish";
      await api.post(`/api/courses/lessons/${lesson.id}/${endpoint}/`);
      setActive((prev) => {
        if (!prev) return prev;
        const lessons = [...(prev.lessons || [])];
        lessons[index] = {
          ...lessons[index],
          is_published: !lesson.is_published,
        };
        return normalizeCourse({ ...prev, lessons });
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const removeLessonAtIndex = async (index) => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    const lesson = active.lessons?.[index];
    if (!lesson) return;

    if (lesson.id && !window.confirm("Delete this lesson?")) return;

    setSaving(true);
    setError("");
    try {
      if (lesson.id) {
        await api.delete(`/api/courses/lessons/${lesson.id}/`);
      }
      setActive((prev) => {
        if (!prev) return prev;
        const lessons = [...(prev.lessons || [])];
        lessons.splice(index, 1);
        return normalizeCourse({ ...prev, lessons });
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const saveTopic = async () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    if (!topicDraft.title.trim()) {
      setError("Topic title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...topicDraft,
        course: active.id,
        learning_area: activeLearningAreaId,
        week: Number(topicDraft.week || 0),
        order: Number(topicDraft.order || 0),
        sub_strand: normalizeId(topicDraft.sub_strand) || undefined,
      };

      const response = topicDraft.id
        ? await api.patch(`/api/courses/topics/${topicDraft.id}/`, payload)
        : await api.post("/api/courses/topics/", payload);

      const saved = response.data;
      const updatedTopics = topicDraft.id
        ? topics.map((topic) => (topic.id === saved.id ? saved : topic))
        : [saved, ...topics];

      setTopics(updatedTopics);
      setTopicDraft(emptyTopic(active.id, updatedTopics.length + 1));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const publishTopic = async (topicId) => {
    try {
      await api.post(`/api/courses/topics/${topicId}/publish/`);
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId ? { ...topic, is_published: true } : topic,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    }
  };

  const savePost = async () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    if (!postDraft.content.trim()) {
      setError("Stream post content is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await api.post("/api/courses/posts/", {
        ...postDraft,
        course: active.id,
        topic: normalizeId(postDraft.topic) || null,
        due_date: postDraft.due_date
          ? new Date(postDraft.due_date).toISOString()
          : null,
      });
      setPosts((prev) => [response.data, ...prev]);
      setPostDraft(emptyPost(active.id, postDraft.topic));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAssignment = async () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    if (!assignmentDraft.title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await api.post("/api/courses/assignments/", {
        ...assignmentDraft,
        course: active.id,
        topic: normalizeId(assignmentDraft.topic) || null,
        due_date: assignmentDraft.due_date
          ? new Date(assignmentDraft.due_date).toISOString()
          : null,
      });
      setAssignments((prev) => [response.data, ...prev]);
      setAssignmentDraft(emptyAssignment(active.id, assignmentDraft.topic));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const enrollStudent = async (learnerId) => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    try {
      const response = await api.post(
        `/api/courses/courses/${active.id}/enroll/`,
        { learner_id: learnerId },
      );
      if (response.data?.enrollment) {
        const learner = students.find(
          (student) => String(student.id) === String(learnerId),
        );
        setActive((prev) => ({
          ...prev,
          enrollments: [
            ...(prev?.enrollments || []),
            {
              id: response.data.enrollment.id,
              learner: learnerId,
              learner_name: learner
                ? `${learner.first_name || ""} ${learner.last_name || ""}`.trim()
                : String(learnerId),
              enrolled_at: new Date().toISOString(),
            },
          ],
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    }
  };

  const unenrollStudent = async (learnerId) => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    try {
      await api.post(`/api/courses/courses/${active.id}/unenroll/`, {
        learner_id: learnerId,
      });
      setActive((prev) => ({
        ...prev,
        enrollments: (prev?.enrollments || []).filter(
          (enrollment) => String(enrollment.learner) !== String(learnerId),
        ),
      }));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    }
  };

  const enrollByGrade = async () => {
    if (!active?.id || !enrollGradeId) return;
    setSaving(true);
    setError("");
    try {
      await api.post(`/api/courses/courses/${active.id}/enroll_by_grade/`, {
        grade_id: Number(enrollGradeId),
      });
      const next = await refreshCourse(active.id);
      setActive(next);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  const generateTopicsFromScheme = async () => {
    if (!active?.id) {
      setError("Please save the course first.");
      return;
    }
    setSaving(true);
    setError("");
    let refreshOk = false;
    try {
      await api.post(
        `/api/courses/courses/${active.id}/generate_topics_from_scheme/`,
        {
          scheme_id: selectedSchemeId ? Number(selectedSchemeId) : undefined,
        },
      );
      const next = await refreshCourse(active.id);
      setActive(next);
      refreshOk = true;
      await loadWorkspace(next);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data || err.message),
      );
    } finally {
      setSaving(false);
      if (refreshOk) {
        setShowSchemeModal(false);
      }
    }
  };

  const activeEnrollments = active?.enrollments || [];
  const activeLessons = active?.lessons || [];
  const selectedScheme = schemes.find(
    (scheme) => String(scheme.id) === String(selectedSchemeId),
  );
  const currentLearningArea = areas.find(
    (area) => String(area.id) === String(activeLearningAreaId),
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white/70 p-10 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading course studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.4fr_0.9fr] lg:px-7">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                CBC course studio
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                Google Classroom-style flow
              </span>
            </div>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Build CBC courses as weekly learning spaces, not just subject
                records.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Create a course, map the Scheme of Work, generate weekly topics,
                then publish lessons, posts, and assignments in one clean
                workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={createNewCourse}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                New course
              </button>
              {active && (
                <>
                  <button
                    onClick={saveCourse}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  {active.id && (
                    <button
                      onClick={publishCourse}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <Shield className="h-4 w-4" />
                      Publish
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: "Courses", value: courses.length },
              { label: "Topics", value: selectedCourseStats.topics },
              { label: "Lessons", value: selectedCourseStats.lessons },
              { label: "Learners", value: selectedCourseStats.learners },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-black">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Search className="h-4 w-4 text-slate-500" />
              Course list
            </div>
            <div className="mt-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {visibleCourses.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
                <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No courses found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Create a CBC course or clear the search.
                </p>
                <button
                  onClick={createNewCourse}
                  className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Create course
                </button>
              </div>
            ) : (
              visibleCourses.map((course) => {
                const isActive = active?.id === course.id;
                const statusClass =
                  STATUS_STYLES[course.status] || STATUS_STYLES.draft;
                const courseArea = areas.find(
                  (area) => String(area.id) === String(course.learning_area),
                );
                return (
                  <button
                    key={course.id}
                    onClick={() => openCourse(course)}
                    className={`w-full rounded-[1.75rem] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? "border-emerald-400 ring-2 ring-emerald-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusClass}`}
                        >
                          {(course.status || "draft").replaceAll("_", " ")}
                        </span>
                        <h3 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900">
                          {course.title || "Untitled course"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {courseArea?.name || "CBC learning area"}
                        </p>
                      </div>
                      <ChevronRight
                        className={`mt-1 h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-300"}`}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {course.grade_name && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {course.grade_name}
                        </span>
                      )}
                      {course.stream_name && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {course.stream_name}
                        </span>
                      )}
                      {course.term_name && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {course.term_name}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span>{course.lessons?.length || 0} lessons</span>
                      <span>{course.enrollments?.length || 0} learners</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="space-y-5">
          {active ? (
            <>
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[active.status] || STATUS_STYLES.draft}`}
                      >
                        {(active.status || "draft").replaceAll("_", " ")}
                      </span>
                      {active.course_code && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                          Class code {active.course_code}
                        </span>
                      )}
                      {active.delivery_mode && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                          {MODE_LABELS[active.delivery_mode] ||
                            active.delivery_mode}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        {active.title || "Untitled course"}
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                        {active.description ||
                          "Use this workspace to align CBC learning outcomes, weekly topics, classroom posts, and assessments."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {active.grade_name && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {active.grade_name}
                        </span>
                      )}
                      {active.stream_name && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {active.stream_name}
                        </span>
                      )}
                      {active.term_name && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {active.term_name}
                        </span>
                      )}
                      {currentLearningArea?.name && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {currentLearningArea.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:min-w-[300px]">
                    {[
                      { label: "Topics", value: selectedCourseStats.topics },
                      { label: "Posts", value: selectedCourseStats.posts },
                      {
                        label: "Assignments",
                        value: selectedCourseStats.assignments,
                      },
                      {
                        label: "Learners",
                        value: selectedCourseStats.learners,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "overview", label: "Overview", icon: BookOpen },
                    { id: "cbc", label: "CBC Alignment", icon: Target },
                    { id: "topics", label: "Topics & Lessons", icon: Layers },
                    { id: "stream", label: "Class Stream", icon: Megaphone },
                    {
                      id: "assignments",
                      label: "Assignments",
                      icon: ClipboardList,
                    },
                    { id: "students", label: "Students", icon: Users },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const activeClass = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                          activeClass
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {activeTab === "overview" && (
                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Course setup
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Core CBC course record and visibility controls.
                        </p>
                      </div>
                      <button
                        onClick={saveCourse}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        Save changes
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <Field
                        label="Course title"
                        value={active.title || ""}
                        onChange={(value) => updateActive({ title: value })}
                        placeholder="e.g. Grade 4 Mathematics"
                      />
                      <SelectField
                        label="Learning area"
                        value={activeLearningAreaId}
                        onChange={(value) =>
                          updateActive({ learning_area: value })
                        }
                        options={availableAreas.map((area) => ({
                          value: area.id,
                          label: area.name,
                        }))}
                        placeholder="Select learning area"
                      />
                      <SelectField
                        label="Grade"
                        value={normalizeId(active.grade)}
                        onChange={(value) => updateActive({ grade: value })}
                        options={grades.map((grade) => ({
                          value: grade.id,
                          label: grade.name,
                        }))}
                        placeholder="Select grade"
                      />
                      <SelectField
                        label="Stream"
                        value={normalizeId(active.stream)}
                        onChange={(value) => updateActive({ stream: value })}
                        options={availableStreams.map((stream) => ({
                          value: stream.id,
                          label: stream.name,
                        }))}
                        placeholder="Select stream"
                      />
                      <SelectField
                        label="Term"
                        value={normalizeId(active.term)}
                        onChange={(value) => updateActive({ term: value })}
                        options={terms.map((term) => ({
                          value: term.id,
                          label: `${term.name} · ${term.academic_year}`,
                        }))}
                        placeholder="Select term"
                      />
                      <Field
                        label="Academic year"
                        value={active.year || ""}
                        onChange={(value) => updateActive({ year: value })}
                        placeholder="2026"
                      />
                      <SelectField
                        label="Delivery mode"
                        value={active.delivery_mode || "blended"}
                        onChange={(value) =>
                          updateActive({ delivery_mode: value })
                        }
                        options={Object.entries(MODE_LABELS).map(
                          ([value, label]) => ({ value, label }),
                        )}
                      />
                      <Field
                        label="Available from"
                        value={
                          active.available_from
                            ? String(active.available_from).slice(0, 16)
                            : ""
                        }
                        onChange={(value) =>
                          updateActive({ available_from: value })
                        }
                        type="datetime-local"
                      />
                      <Field
                        label="Room / section"
                        value={active.room || ""}
                        onChange={(value) => updateActive({ room: value })}
                        placeholder="Lab 2 / Section A"
                      />
                      <Field
                        label="Course section"
                        value={active.section || ""}
                        onChange={(value) => updateActive({ section: value })}
                        placeholder="Alpha / East"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Course description
                      </label>
                      <textarea
                        rows={4}
                        value={active.description || ""}
                        onChange={(e) =>
                          updateActive({ description: e.target.value })
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                        placeholder="Describe the CBC course goals and learning flow."
                      />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {[
                        {
                          label: "Requires parent unlock",
                          description:
                            "Hide content until a parent approves access.",
                          field: "requires_parent_unlock",
                        },
                        {
                          label: "Allow student posts",
                          description:
                            "Let learners comment or ask questions in the stream.",
                          field: "allow_student_posts",
                        },
                      ].map((item) => (
                        <button
                          key={item.field}
                          type="button"
                          onClick={() =>
                            updateActive({ [item.field]: !active[item.field] })
                          }
                          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                            active[item.field]
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                              active[item.field]
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {active[item.field] && (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {item.label}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {item.description}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <InfoPanel
                      title="CBC flow"
                      icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
                      body="Course -> Scheme of Work -> Weekly Topic -> Lesson -> Post/Assignment. This keeps the course aligned to KICD structure while still feeling like Google Classroom."
                    />

                    <InfoPanel
                      title="Course code"
                      icon={<Shield className="h-4 w-4 text-slate-500" />}
                      body={
                        active.course_code
                          ? `Students can join or identify the class using ${active.course_code}.`
                          : "The class code will be generated once the course is saved."
                      }
                    />

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                        Quick actions
                      </h3>
                      <div className="mt-4 space-y-3">
                        <ActionButton
                          icon={<Sparkles className="h-4 w-4" />}
                          label="Generate topics from scheme"
                          onClick={() => setShowSchemeModal(true)}
                        />
                        <ActionButton
                          icon={<Plus className="h-4 w-4" />}
                          label="Add new topic"
                          onClick={() => setActiveTab("topics")}
                        />
                        <ActionButton
                          icon={<Megaphone className="h-4 w-4" />}
                          label="Create class post"
                          onClick={() => setActiveTab("stream")}
                        />
                        <ActionButton
                          icon={<ClipboardList className="h-4 w-4" />}
                          label="Create assignment"
                          onClick={() => setActiveTab("assignments")}
                        />
                        <ActionButton
                          icon={<Users className="h-4 w-4" />}
                          label="Manage roster"
                          onClick={() => setActiveTab("students")}
                        />
                        <ActionButton
                          icon={<Layers className="h-4 w-4" />}
                          label="Duplicate course"
                          onClick={cloneCourse}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "cbc" && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <CbcPanel
                    title="Core competencies"
                    items={CBC_CORE_COMPETENCIES}
                    selected={active.core_competencies}
                    onToggle={(id) =>
                      handleArrayToggle("core_competencies", id)
                    }
                  />
                  <CbcPanel
                    title="Values"
                    items={CBC_VALUES}
                    selected={active.values}
                    onToggle={(id) => handleArrayToggle("values", id)}
                  />
                  <CbcPanel
                    title="PCIs"
                    items={CBC_PCIS}
                    selected={active.pcis}
                    onToggle={(id) => handleArrayToggle("pcis", id)}
                  />
                </div>
              )}

              {activeTab === "topics" && (
                <div className="space-y-5">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Weekly topics
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Generate topics from the Scheme of Work or add them
                          manually.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setShowSchemeModal(true)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <Sparkles className="h-4 w-4" />
                          Import from scheme
                        </button>
                        <button
                          onClick={saveTopic}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          {topicDraft.id ? "Update topic" : "Save topic"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-4">
                      <Field
                        label="Topic title"
                        value={topicDraft.title}
                        onChange={(value) =>
                          setTopicDraft((prev) => ({ ...prev, title: value }))
                        }
                        placeholder="Week 1: Numbers"
                      />
                      <Field
                        label="Week"
                        value={String(topicDraft.week || "")}
                        onChange={(value) =>
                          setTopicDraft((prev) => ({ ...prev, week: value }))
                        }
                        type="number"
                      />
                      <Field
                        label="Order"
                        value={String(topicDraft.order || "")}
                        onChange={(value) =>
                          setTopicDraft((prev) => ({ ...prev, order: value }))
                        }
                        type="number"
                      />
                      <SelectField
                        label="Sub-strand"
                        value={normalizeId(topicDraft.sub_strand)}
                        onChange={(value) =>
                          setTopicDraft((prev) => ({
                            ...prev,
                            sub_strand: value,
                          }))
                        }
                        options={subStrands.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                        placeholder="Select CBC sub-strand"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Learning outcomes
                      </label>
                      <textarea
                        rows={4}
                        value={topicDraft.learning_outcomes || ""}
                        onChange={(e) =>
                          setTopicDraft((prev) => ({
                            ...prev,
                            learning_outcomes: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                        placeholder="Paste the weekly CBC learning outcomes here."
                      />
                    </div>
                  </section>

                  {Object.keys(groupedTopics).length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                      <Layers className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No topics yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Import from the scheme of work or create topics
                        manually.
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedTopics)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([week, weekTopics]) => (
                        <section
                          key={week}
                          className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                                Week {week}
                              </h4>
                              <p className="mt-1 text-sm text-slate-500">
                                {weekTopics.length} topic(s)
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              CBC aligned
                            </span>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            {weekTopics.map((topic) => {
                              const linkedLessons =
                                lessonsByTopic[topic.id] || [];
                              return (
                                <div
                                  key={topic.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {topic.title}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        Order {topic.order || 0} ·{" "}
                                        {topic.is_published
                                          ? "Published"
                                          : "Draft"}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          setTopicDraft({
                                            ...topic,
                                            course: active.id,
                                          })
                                        }
                                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => publishTopic(topic.id)}
                                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm"
                                      >
                                        Publish
                                      </button>
                                    </div>
                                  </div>

                                  {topic.learning_outcomes && (
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                      {topic.learning_outcomes}
                                    </p>
                                  )}

                                  {linkedLessons.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                      {linkedLessons.map((lesson) => (
                                        <div
                                          key={lesson.id}
                                          className="rounded-xl bg-white p-3 text-sm"
                                        >
                                          <p className="font-medium text-slate-900">
                                            {lesson.lesson_number}.{" "}
                                            {lesson.title ||
                                              lesson.strand ||
                                              "Lesson"}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                            {lesson.is_published
                                              ? "Published"
                                              : "Draft"}
                                            {lesson.publish_at
                                              ? ` · ${formatDateTime(lesson.publish_at)}`
                                              : ""}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ))
                  )}

                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Lesson outlines
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Edit lesson notes, resources, and publish state
                          inline.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {activeLessons.length} lessons
                        </span>
                        <button
                          onClick={addLesson}
                          disabled={!active?.id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          Add lesson
                        </button>
                      </div>
                    </div>

                    {activeLessons.length === 0 ? (
                      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                        No lessons attached to this course yet. Add one to start
                        building your weekly delivery flow.
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {courseLessonsSorted.map((lesson, index) => {
                          const lessonTopicId = normalizeId(lesson.topic);
                          const linkedTopic = topics.find(
                            (topic) =>
                              String(topic.id) === String(lessonTopicId),
                          );
                          const subStrandId = normalizeId(lesson.sub_strand);
                          const linkedSubStrand = subStrands.find(
                            (item) => String(item.id) === String(subStrandId),
                          );
                          const isSaved = !!lesson.id;

                          return (
                            <article
                              key={
                                lesson.id ||
                                lesson.__clientId ||
                                `${index}-${lesson.lesson_number}`
                              }
                              className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
                            >
                              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                      Lesson {lesson.lesson_number || index + 1}
                                    </span>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        lesson.is_published
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-amber-50 text-amber-700"
                                      }`}
                                    >
                                      {lesson.is_published
                                        ? "Published"
                                        : "Draft"}
                                    </span>
                                    {linkedTopic?.title && (
                                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                        {linkedTopic.title}
                                      </span>
                                    )}
                                    {linkedSubStrand?.name && (
                                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                        {linkedSubStrand.name}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {isSaved
                                      ? "Saved lesson"
                                      : "New lesson draft"}{" "}
                                    · editable inline
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => toggleLessonPublish(index)}
                                    disabled={!lesson.id || saving}
                                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                                      lesson.is_published
                                        ? "bg-white text-slate-700"
                                        : "bg-emerald-600 text-white"
                                    }`}
                                  >
                                    {lesson.is_published
                                      ? "Unpublish"
                                      : "Publish"}
                                  </button>
                                  <button
                                    onClick={() => saveLessonAtIndex(index)}
                                    disabled={saving}
                                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                  >
                                    Save lesson
                                  </button>
                                  <button
                                    onClick={() => removeLessonAtIndex(index)}
                                    disabled={saving}
                                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field
                                  label="Lesson title"
                                  value={lesson.title || ""}
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, { title: value })
                                  }
                                  placeholder="Introduction to composting"
                                />
                                <Field
                                  label="Lesson number"
                                  type="number"
                                  value={String(lesson.lesson_number || "")}
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, {
                                      lesson_number: value,
                                    })
                                  }
                                />
                                <Field
                                  label="Order"
                                  type="number"
                                  value={String(lesson.order || "")}
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, { order: value })
                                  }
                                />
                                <Field
                                  label="Publish at"
                                  type="datetime-local"
                                  value={
                                    lesson.publish_at
                                      ? String(lesson.publish_at).slice(0, 16)
                                      : ""
                                  }
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, {
                                      publish_at: value,
                                    })
                                  }
                                />
                                <SelectField
                                  label="Topic"
                                  value={lessonTopicId}
                                  onChange={(value) => {
                                    const selectedTopic = topics.find(
                                      (topic) =>
                                        String(topic.id) === String(value),
                                    );
                                    updateLessonAtIndex(index, {
                                      topic: value,
                                      sub_strand:
                                        normalizeId(
                                          selectedTopic?.sub_strand,
                                        ) || normalizeId(lesson.sub_strand),
                                      title:
                                        lesson.title ||
                                        selectedTopic?.title ||
                                        "",
                                      strand: lesson.strand || "",
                                    });
                                  }}
                                  options={topics.map((topic) => ({
                                    value: topic.id,
                                    label: `${topic.week || "W"} · ${topic.title}`,
                                  }))}
                                  placeholder="Optional"
                                />
                                <SelectField
                                  label="Sub-strand"
                                  value={subStrandId}
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, {
                                      sub_strand: value,
                                    })
                                  }
                                  options={subStrands.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                  }))}
                                  placeholder="Required"
                                />
                                <Field
                                  label="Strand"
                                  value={lesson.strand || ""}
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, {
                                      strand: value,
                                    })
                                  }
                                  placeholder="Main strand name"
                                />
                                <Field
                                  label="Video URL"
                                  value={lesson.video_url || ""}
                                  onChange={(value) =>
                                    updateLessonAtIndex(index, {
                                      video_url: value,
                                    })
                                  }
                                  placeholder="https://..."
                                />
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Objectives
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={lesson.objectives || ""}
                                    onChange={(e) =>
                                      updateLessonAtIndex(index, {
                                        objectives: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                                    placeholder="By the end of the lesson, learners should..."
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Learning activities
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={lesson.learning_activities || ""}
                                    onChange={(e) =>
                                      updateLessonAtIndex(index, {
                                        learning_activities: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                                    placeholder="Warm-up, guided practice, group work..."
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Resources
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={lesson.resources || ""}
                                    onChange={(e) =>
                                      updateLessonAtIndex(index, {
                                        resources: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                                    placeholder="Books, charts, equipment, worksheets..."
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Assessment
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={lesson.assessment || ""}
                                    onChange={(e) =>
                                      updateLessonAtIndex(index, {
                                        assessment: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                                    placeholder="Observation, oral questions, worksheet..."
                                  />
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Remarks
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={lesson.remarks || ""}
                                    onChange={(e) =>
                                      updateLessonAtIndex(index, {
                                        remarks: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                                    placeholder="Teacher reflections or follow-up notes."
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Lesson content
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={lesson.content || ""}
                                    onChange={(e) =>
                                      updateLessonAtIndex(index, {
                                        content: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                                    placeholder="Notes, instructions, or a short lesson script."
                                  />
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === "stream" && (
                <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Class stream
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Posts, announcements, materials, and questions.
                        </p>
                      </div>
                      <button
                        onClick={savePost}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        Post
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="Post type"
                        value={postDraft.post_type}
                        onChange={(value) =>
                          setPostDraft((prev) => ({
                            ...prev,
                            post_type: value,
                          }))
                        }
                        options={POST_TYPES}
                      />
                      <SelectField
                        label="Topic"
                        value={normalizeId(postDraft.topic)}
                        onChange={(value) =>
                          setPostDraft((prev) => ({ ...prev, topic: value }))
                        }
                        options={topics.map((topic) => ({
                          value: topic.id,
                          label: topic.title,
                        }))}
                        placeholder="Optional"
                      />
                      <Field
                        label="Title"
                        value={postDraft.title}
                        onChange={(value) =>
                          setPostDraft((prev) => ({ ...prev, title: value }))
                        }
                        placeholder="Announcement title"
                      />
                      <Field
                        label="Due date"
                        type="datetime-local"
                        value={postDraft.due_date}
                        onChange={(value) =>
                          setPostDraft((prev) => ({ ...prev, due_date: value }))
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Content
                      </label>
                      <textarea
                        rows={5}
                        value={postDraft.content}
                        onChange={(e) =>
                          setPostDraft((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                        placeholder="Write notes, announcement details, or a class question."
                      />
                    </div>
                  </section>

                  <section className="space-y-3">
                    {posts.length === 0 ? (
                      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                        <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No stream posts yet
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Create a post, question, or learning material for the
                          class feed.
                        </p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <article
                          key={post.id}
                          className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {post.post_type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {post.teacher_name || "Teacher"} ·{" "}
                              {formatDateTime(post.created_at)}
                            </span>
                          </div>
                          <h4 className="mt-3 text-sm font-semibold text-slate-900">
                            {post.title || "Untitled post"}
                          </h4>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                            {post.content}
                          </p>
                          {post.due_date && (
                            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Due {formatDateTime(post.due_date)}
                            </p>
                          )}
                        </article>
                      ))
                    )}
                  </section>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Assignments
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Create tasks linked to a topic and track submissions.
                        </p>
                      </div>
                      <button
                        onClick={saveAssignment}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        Add assignment
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <SelectField
                        label="Topic"
                        value={normalizeId(assignmentDraft.topic)}
                        onChange={(value) =>
                          setAssignmentDraft((prev) => ({
                            ...prev,
                            topic: value,
                          }))
                        }
                        options={topics.map((topic) => ({
                          value: topic.id,
                          label: topic.title,
                        }))}
                        placeholder="Link to a topic"
                      />
                      <Field
                        label="Due date"
                        type="datetime-local"
                        value={assignmentDraft.due_date}
                        onChange={(value) =>
                          setAssignmentDraft((prev) => ({
                            ...prev,
                            due_date: value,
                          }))
                        }
                      />
                      <Field
                        label="Assignment title"
                        value={assignmentDraft.title}
                        onChange={(value) =>
                          setAssignmentDraft((prev) => ({
                            ...prev,
                            title: value,
                          }))
                        }
                        placeholder="Worksheet, project, quiz..."
                      />
                      <div />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Instructions
                      </label>
                      <textarea
                        rows={5}
                        value={assignmentDraft.instructions}
                        onChange={(e) =>
                          setAssignmentDraft((prev) => ({
                            ...prev,
                            instructions: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                        placeholder="Tell learners what to do, what to submit, and how to be assessed."
                      />
                    </div>
                  </section>

                  <section className="space-y-3">
                    {assignments.length === 0 ? (
                      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                        <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No assignments yet
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Assignments will appear here once created.
                        </p>
                      </div>
                    ) : (
                      assignments.map((assignment) => (
                        <article
                          key={assignment.id}
                          className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                {assignment.title}
                              </h4>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {assignment.instructions}
                              </p>
                            </div>
                            {assignment.due_date && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                {formatDateTime(assignment.due_date)}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            {assignment.topic?.title && (
                              <span className="rounded-full bg-slate-100 px-3 py-1">
                                {assignment.topic.title}
                              </span>
                            )}
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                              {assignment.submission_count || 0} submissions
                            </span>
                          </div>
                        </article>
                      ))
                    )}
                  </section>
                </div>
              )}

              {activeTab === "students" && (
                <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Enrolled learners
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Manage the class roster at the learner or grade level.
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {activeEnrollments.length} learners
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <select
                        value={enrollGradeId}
                        onChange={(e) => setEnrollGradeId(e.target.value)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                      >
                        <option value="">Enroll by grade</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={enrollByGrade}
                        disabled={saving || !enrollGradeId}
                        className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Import
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {activeEnrollments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          No learners enrolled yet.
                        </div>
                      ) : (
                        activeEnrollments.map((enrollment) => (
                          <div
                            key={enrollment.id || enrollment.learner}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {enrollment.learner_name || enrollment.learner}
                              </p>
                              {enrollment.enrolled_at && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Enrolled{" "}
                                  {formatDateTime(enrollment.enrolled_at)}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                unenrollStudent(enrollment.learner)
                              }
                              className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                          Add student
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Find a student and add them to the course.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
                      />
                    </div>

                    <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                      {filteredStudents.map((student) => {
                        const enrolled = activeEnrollments.some(
                          (item) => String(item.learner) === String(student.id),
                        );
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {student.email}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                enrolled
                                  ? unenrollStudent(student.id)
                                  : enrollStudent(student.id)
                              }
                              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                                enrolled
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              {enrolled ? "Remove" : "Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-lg font-black text-slate-900">
                Select a course
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
                Open a course on the left or create a new one to start building
                a CBC-aligned classroom space.
              </p>
              <button
                onClick={createNewCourse}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Create course
              </button>
            </div>
          )}
        </main>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
              CBC notes
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-800">Learning flow</p>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                  The backend already supports course, topic, lesson, post,
                  assignment, and scheme generation.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Best practice</p>
                <p className="mt-1 leading-6 text-slate-600">
                  Save the course first, import from scheme, then publish topics
                  and stream posts as the term progresses.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
                  Scheme of Work
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Import weekly CBC topics from a saved scheme.
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowSchemeModal(true)}
                disabled={!active?.id}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Open scheme picker
              </button>
            </div>
            {selectedScheme && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  Selected scheme #{selectedScheme.id}
                </p>
                <p className="mt-1">
                  Tap import to auto-create topics from the weekly structure.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {showSchemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Import from Scheme of Work
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a scheme and generate weekly topics for the active
                  course.
                </p>
              </div>
              <button
                onClick={() => setShowSchemeModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <SelectField
                label="Scheme of work"
                value={selectedSchemeId}
                onChange={setSelectedSchemeId}
                options={schemes.map((scheme) => ({
                  value: scheme.id,
                  label: `Scheme #${scheme.id}`,
                }))}
                placeholder="Select scheme"
              />
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  What gets created
                </p>
                <p className="mt-1 leading-6">
                  Topics are generated from the scheme weeks, keeping the week
                  number, sub-strand, and learning outcomes in sync.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowSchemeModal(false)}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={generateTopicsFromScheme}
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Generate topics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const InfoPanel = ({ title, icon, body }) => (
  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
        {title}
      </h3>
    </div>
    <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
  </div>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
  >
    <span className="flex items-center gap-2">
      {icon}
      {label}
    </span>
    <ChevronRight className="h-4 w-4 text-slate-400" />
  </button>
);

const CbcPanel = ({ title, items, selected = [], onToggle }) => (
  <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
        {title}
      </h3>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
        {selected.length}
      </span>
    </div>
    <div className="mt-4 space-y-2">
      {items.map((item) => {
        const active = selected.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
              active
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {active && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="font-medium text-slate-800">{item.name}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default CoursesPage;
