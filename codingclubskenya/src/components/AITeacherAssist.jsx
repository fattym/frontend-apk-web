import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const QUICK_PROMPTS = [
  { label: 'Draft this scheme week', task: 'scheme_drafting', icon: '📝' },
  { label: 'Generate lesson ideas', task: 'lesson_ideas', icon: '💡' },
  { label: 'Write a report narrative', task: 'report_narrative', icon: '📊' },
  { label: 'Suggest a timetable', task: 'weekly_timetable', icon: '📅' },
  { label: 'General teaching Q&A', task: 'general_help', icon: '🎓' },
];

const AITeacherAssist = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState('scheme_drafting');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState({
    sub_strand_name: '',
    learning_area_name: '',
    grade_name: '',
    learning_outcomes: '',
    week_number: '',
    learner_name: '',
    competency_summary: '',
    assignments: [],
    constraints: '',
  });
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (loading) return;
    const payload = {
      task,
      context: {
        ...context,
        question: task === 'general_help' ? question : context.question,
      },
    };
    const userMessage = task === 'general_help' ? question || `Run: ${task}` : `Run: ${task}`;
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    try {
      const res = await api.post('/api/academics/ai-assist/', payload);
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.suggestion }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I could not reach the assistant right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role === 'STUDENT' || user.role === 'PARENT') {
    return null;
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-white shadow-xl hover:bg-slate-800"
        >
          <span>✨</span>
          <span className="text-sm font-medium">AI Teacher Assist</span>
        </button>
      )}

      {open && (
        <div className="fixed right-4 bottom-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Teacher Assist</p>
              <p className="text-xs text-gray-500">Suggestions only — you apply them.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
              >
                <option value="scheme_drafting">Scheme Drafting</option>
                <option value="lesson_ideas">Lesson Ideas</option>
                <option value="report_narrative">Report Narrative</option>
                <option value="weekly_timetable">Timetable</option>
                <option value="general_help">General Help</option>
              </select>
              <button
                onClick={() => { setOpen(false); setMessages([]); }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" style={{ maxHeight: '52vh' }}>
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q.task}
                      onClick={() => setTask(q.task)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${task === q.task ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {q.icon} {q.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Fill the context below or type a specific teaching question.</p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div key={idx} className={`rounded-xl px-3 py-2 text-xs whitespace-pre-wrap ${m.role === 'user' ? 'ml-8 bg-gray-900 text-white' : 'mr-8 bg-gray-50 text-gray-800'}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="mr-8 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">Thinking...</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 px-3 py-3">
            {task === 'scheme_drafting' && (
              <div className="mb-2 grid grid-cols-2 gap-2">
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Sub-strand"
                  value={context.sub_strand_name}
                  onChange={(e) => setContext({ ...context, sub_strand_name: e.target.value })}
                />
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Learning area"
                  value={context.learning_area_name}
                  onChange={(e) => setContext({ ...context, learning_area_name: e.target.value })}
                />
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Grade"
                  value={context.grade_name}
                  onChange={(e) => setContext({ ...context, grade_name: e.target.value })}
                />
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Outcomes"
                  value={context.learning_outcomes}
                  onChange={(e) => setContext({ ...context, learning_outcomes: e.target.value })}
                />
              </div>
            )}
            {task === 'report_narrative' && (
              <div className="mb-2 grid grid-cols-1 gap-2">
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Learner name"
                  value={context.learner_name}
                  onChange={(e) => setContext({ ...context, learner_name: e.target.value })}
                />
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Learning area name"
                  value={context.learning_area_name}
                  onChange={(e) => setContext({ ...context, learning_area_name: e.target.value })}
                />
                <input
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
                  placeholder="Competency summary (e.g. strong in practical tasks)"
                  value={context.competency_summary}
                  onChange={(e) => setContext({ ...context, competency_summary: e.target.value })}
                />
              </div>
            )}
            {task === 'general_help' && (
              <textarea
                className="mb-2 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                rows={3}
                placeholder="Ask a teaching/planning question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            )}
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate suggestion'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AITeacherAssist;
