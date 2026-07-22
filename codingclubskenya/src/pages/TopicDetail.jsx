import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Layers,
  Megaphone,
  MessageCircle,
  Send,
  Sparkles,
  Video,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [course, setCourse] = useState(null);
  const [subStrand, setSubStrand] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draftComment, setDraftComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicRes, lessonsRes, assignmentsRes, postsRes] = await Promise.all([
          api.get(`/api/courses/topics/${id}/`),
          api.get(`/api/courses/lessons/?topic=${id}`),
          api.get(`/api/courses/assignments/?topic=${id}`),
          api.get(`/api/courses/posts/?topic=${id}`),
        ]);

        const loadedPosts = postsRes.data.results || postsRes.data || [];

        setTopic(topicRes.data);
        setLessons(lessonsRes.data.results || lessonsRes.data || []);
        setAssignments(assignmentsRes.data.results || assignmentsRes.data || []);
        setPosts(loadedPosts);

        if (topicRes.data?.course) {
          api.get(`/api/courses/courses/${topicRes.data.course}/`)
            .then((response) => setCourse(response.data))
            .catch(() => setCourse(null));
        }

        if (topicRes.data?.sub_strand) {
          api.get(`/api/academics/sub-strands/${topicRes.data.sub_strand}/`)
            .then((response) => setSubStrand(response.data))
            .catch(() => setSubStrand(null));
        }

        if (loadedPosts.length > 0) {
          const commentsPromises = loadedPosts.map((post) =>
            api.get(`/api/courses/post-comments/?post=${post.id}`)
              .then((response) => response.data.results || response.data || [])
              .catch(() => [])
          );
          const commentArrays = await Promise.all(commentsPromises);
          setComments(commentArrays.flat());
        }
      } catch (err) {
        setError(JSON.stringify(err.response?.data || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const courseId = topic?.course;

  const groupedComments = useMemo(() => {
    return comments.reduce((acc, comment) => {
      const postId = comment.post;
      if (!acc[postId]) acc[postId] = [];
      acc[postId].push(comment);
      return acc;
    }, {});
  }, [comments]);

  const stats = [
    { label: 'Lessons', value: lessons.length, icon: BookOpen },
    { label: 'Assignments', value: assignments.length, icon: ClipboardList },
    { label: 'Posts', value: posts.length, icon: Megaphone },
    { label: 'Comments', value: comments.length, icon: MessageCircle },
  ];

  const handleComment = async (postId) => {
    if (!draftComment.trim()) return;
    setPostingComment(true);
    setCommentPostId(postId);
    try {
      await api.post('/api/courses/post-comments/', { post: postId, message: draftComment });
      setDraftComment('');
      const res = await api.get(`/api/courses/post-comments/?post=${postId}`);
      const updated = res.data.results || res.data || [];
      setComments((prev) => {
        const filtered = prev.filter((comment) => comment.post !== postId);
        return [...filtered, ...updated];
      });
    } catch (err) {
      setError(JSON.stringify(err.response?.data || err.message));
    } finally {
      setPostingComment(false);
      setCommentPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm font-medium text-slate-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 shadow-sm">
        <button
          onClick={() => navigate('/my-courses')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
        <p className="mt-4 text-sm text-rose-600">{error || 'Topic not found.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(`/my-courses/${courseId}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {course?.title || `course #${courseId}`}
      </button>

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-7">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                Weekly topic
              </span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                topic.is_published ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-slate-200'
              }`}>
                {topic.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{topic.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                {topic.learning_outcomes || 'Weekly CBC outcomes and lesson notes for this topic.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1">Week {topic.week || 0}</span>
              {course?.title && <span className="rounded-full bg-white/10 px-3 py-1">{course.title}</span>}
              {subStrand?.name && <span className="rounded-full bg-white/10 px-3 py-1">{subStrand.name}</span>}
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

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <main className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Lesson notes</h2>
                <p className="mt-1 text-sm text-slate-500">CBC lesson content, resources, and delivery notes.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {lessons.length} lesson(s)
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {lessons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No lessons have been linked to this topic yet.
                </div>
              ) : (
                lessons.map((lesson) => (
                  <article key={lesson.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        Lesson {lesson.lesson_number}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        lesson.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {lesson.is_published ? 'Published' : 'Draft'}
                      </span>
                      {lesson.publish_at && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                          <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                          {new Date(lesson.publish_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      {lesson.title || lesson.strand || 'Lesson'}
                    </h3>

                    {lesson.objectives && <p className="mt-2 text-sm leading-7 text-slate-600">{lesson.objectives}</p>}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {lesson.learning_activities && (
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Activities</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lesson.learning_activities}</p>
                        </div>
                      )}
                      {lesson.resources && (
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Resources</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lesson.resources}</p>
                        </div>
                      )}
                      {lesson.assessment && (
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Assessment</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lesson.assessment}</p>
                        </div>
                      )}
                      {lesson.content && (
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lesson content</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lesson.content}</p>
                        </div>
                      )}
                    </div>

                    {lesson.video_url && (
                      <a
                        href={lesson.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700"
                      >
                        <Video className="h-4 w-4" />
                        Watch video
                      </a>
                    )}

                    {lesson.attachment && (
                      <a
                        href={lesson.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700"
                      >
                        <Sparkles className="h-4 w-4" />
                        Download attachment
                      </a>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Assignments</h2>
                <p className="mt-1 text-sm text-slate-500">Topic-linked tasks and submissions.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {assignments.length} assignment(s)
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No assignments yet.
                </div>
              ) : (
                assignments.map((assignment) => (
                  <article key={assignment.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-950">{assignment.title}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                          {assignment.instructions}
                        </p>
                      </div>
                      {assignment.due_date && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Due {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Topic details</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course</p>
                <p className="mt-1 font-semibold text-slate-900">{course?.title || 'Course'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Week</p>
                <p className="mt-1 font-semibold text-slate-900">Week {topic.week || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">CBC alignment</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {subStrand?.name || `Sub-strand #${topic.sub_strand || 'not set'}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Class discussion</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Students can comment on class stream posts linked to this topic.
            </p>

            <div className="mt-4 space-y-3">
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No stream posts yet.
                </div>
              ) : (
                posts.map((post) => {
                  const postComments = groupedComments[post.id] || [];
                  return (
                    <article key={post.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          post.post_type === 'announcement' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {post.post_type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {post.teacher_name} · {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-950">{post.title || 'Untitled post'}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{post.content}</p>

                      <div className="mt-4 space-y-2 rounded-2xl bg-white p-3">
                        {postComments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-semibold text-slate-900">{comment.user_name}</span>
                            <span className="text-slate-600">: {comment.message}</span>
                          </div>
                        ))}

                        {user?.role === 'STUDENT' && (
                          <div className="mt-3 flex gap-2">
                            <input
                              value={draftComment}
                              onChange={(e) => setDraftComment(e.target.value)}
                              placeholder="Write a comment..."
                              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                            />
                            <button
                              onClick={() => handleComment(post.id)}
                              disabled={postingComment && commentPostId === post.id}
                              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              <Send className="h-4 w-4" />
                              {postingComment && commentPostId === post.id ? 'Posting...' : 'Post'}
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default TopicDetail;
