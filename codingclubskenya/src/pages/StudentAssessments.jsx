import { useState, useEffect, useMemo } from 'react';
import api, { fetchGrades, fetchLearningAreas, formErrorMessage } from '../services/api';
import AITeacherAssist from '../components/AITeacherAssist';

const RUBRIC = [
  { key: 'EE', label: 'Exceeding Expectation', color: 'bg-emerald-600 text-white' },
  { key: 'ME', label: 'Meeting Expectation', color: 'bg-blue-600 text-white' },
  { key: 'AE', label: 'Approaching Expectation', color: 'bg-amber-600 text-white' },
  { key: 'BE', label: 'Below Expectation', color: 'bg-rose-600 text-white' },
];

const DESCRIPTORS = {
  EE: 'Constructs apparatus independently and purifies water flawlessly.',
  ME: 'Constructs filter apparatus with minimal support.',
  AE: 'Assembles filter but water remains turbid; needs guidance.',
  BE: 'Struggles with assembly; needs teacher demonstration.',
};

const parseGradeName = (current_grade) => {
  if (!current_grade) return '';
  const m = (current_grade || '').match(/(Grade\s*\d+[A-Z]?)/i);
  return m ? m[1].replace(/\s+/g, ' ') : current_grade.split(' ')[0];
};

const StudentAssessments = () => {
  const [grades, setGrades] = useState([]);
  const [learningAreas, setLearningAreas] = useState([]);
  const [self, setSelf] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [myResult, setMyResult] = useState(null);
  const [chosenLevel, setChosenLevel] = useState('ME');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [g, la, roster, ts] = await Promise.all([
          fetchGrades(),
          fetchLearningAreas(),
          api.get('/api/gradebook/learners/').then((r) => r.data),
          api.get('/api/assessment/tasks/').then((r) => (Array.isArray(r.data) ? r.data : r.data.results || r.data)),
        ]);
        setGrades(g);
        setLearningAreas(la);
        setSelf((roster.learners || [])[0] || null);
        setTasks(ts);
        if (ts.length === 0 && g.length && la.length) {
          setTasks([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const gradeId = useMemo(() => {
    const name = parseGradeName(self?.current_grade);
    const match = grades.find((g) => g.name.toLowerCase().replace(/\s+/g, ' ') === name.toLowerCase().replace(/\s+/g, ' '));
    return match?.id;
  }, [self, grades]);

  const studentLAs = useMemo(
    () => learningAreas.filter((la) => la.grade?.id === gradeId).map((la) => la.name),
    [learningAreas, gradeId]
  );

  const visibleTasks = useMemo(
    () => (tasks || []).filter((t) => studentLAs.includes(t.learning_area_name)),
    [tasks, studentLAs]
  );

  const openDo = async (task) => {
    setSelectedTask(task);
    setChosenLevel('ME');
    setRemark('');
    setSaved('');
    setError('');
    try {
      const data = await api
        .get(`/api/assessment/tasks/${task.id}/student-result/`)
        .then((r) => r.data);
      setMyResult(data);
      if (data?.level_achieved) setChosenLevel(data.level_achieved);
      if (data?.remark) setRemark(data.remark);
    } catch (err) {
      console.error(err);
      setMyResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const data = await api
        .post(`/api/assessment/tasks/${selectedTask.id}/student-result/`, {
          level_achieved: chosenLevel,
          remark,
        })
        .then((r) => r.data);
      setMyResult(data);
      setSaved('Your submission was saved.');
    } catch (err) {
      setError(formErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const statusFor = (task) => {
    const hasResult = task.results && task.results.some((r) => r.level_achieved);
    return hasResult ? 'Submitted' : 'Not Started';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-brand-navy mb-1">My CBC Assessments</h1>
        <p className="text-brand-navy/70">
          {self?.current_grade || 'Grade 6'} · {self?.name || 'Learner'} · Submit your responses against each published task.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {visibleTasks.map((t) => {
          const submitted = statusFor(t) === 'Submitted';
          return (
            <div
              key={t.id}
              className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">
                    {t.learning_area_name}
                  </span>
                  <h3 className="font-bold text-slate-800 mt-1">{t.sub_strand || t.strand || t.title}</h3>
                  <p className="text-xs text-slate-500">{t.task_type || 'Formative Assessment'}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    submitted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {statusFor(t)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Strand: <span className="font-medium text-slate-700">{t.strand || '-'}</span>
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => openDo(t)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-pen"></i> Do Assessment
                </button>
              </div>
            </div>
          );
        })}
        {visibleTasks.length === 0 && (
          <p className="text-slate-500 col-span-full">
            No published assessments for {parseGradeName(self?.current_grade) || 'your class'} yet. Check back later!
          </p>
        )}
      </section>

      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedTask.sub_strand || selectedTask.title}</h3>
                  <p className="text-[11px] text-teal-400">
                    {selectedTask.learning_area_name} · {selectedTask.strand}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white text-lg transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs max-h-[70vh]">
              <div>
                <p className="font-bold text-slate-800 mb-2">4-Level Performance Assessment Rubric</p>
                <div className="space-y-2">
                  {RUBRIC.map((r) => (
                    <div
                      key={r.key}
                      className={`p-2 rounded-lg border ${
                        chosenLevel === r.key
                          ? 'border-teal-500 bg-teal-50/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <label className="flex items-center space-x-3 font-medium">
                        <input
                          type="radio"
                          name="level"
                          value={r.key}
                          checked={chosenLevel === r.key}
                          onChange={() => setChosenLevel(r.key)}
                          className="accent-teal-600"
                        />
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.color}`}>
                          {r.key} — {r.label}
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1 ml-6">{DESCRIPTORS[r.key]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Remark</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="Describe what you did and how you met the criteria..."
                />
              </div>

              {error && <p className="text-rose-600 text-xs break-words">{error}</p>}
              {saved && <p className="text-emerald-700 text-xs font-medium">{saved}</p>}
              {myResult?.level_achieved && (
                <p className="text-[10px] text-slate-500">
                  Currently saved:{' '}
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      RUBRIC.find((r) => r.key === myResult.level_achieved)?.color ||
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {myResult.level_achieved}
                  </span>
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Submit & Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AITeacherAssist />
    </div>
  );
};

export default StudentAssessments;
