import { useState, useEffect, useMemo } from 'react';
import api, {
  fetchGrades,
  fetchLearningAreas,
  fetchAssessmentTasks,
  createAssessmentTask,
  formErrorMessage,
} from '../services/api';
import AITeacherAssist from '../components/AITeacherAssist';

const RUBRIC = [
  { key: 'EE', label: 'EE (4)', color: 'bg-emerald-600 text-white shadow-sm' },
  { key: 'ME', label: 'ME (3)', color: 'bg-blue-600 text-white shadow-sm' },
  { key: 'AE', label: 'AE (2)', color: 'bg-amber-600 text-white shadow-sm' },
  { key: 'BE', label: 'BE (1)', color: 'bg-rose-600 text-white shadow-sm' },
];

const LEVEL_LABEL = { EE: 'EE (4)', ME: 'ME (3)', AE: 'AE (2)', BE: 'BE (1)' };

const levelFromPct = (pct) => {
  if (pct >= 80) return 'EE';
  if (pct >= 65) return 'ME';
  if (pct >= 50) return 'AE';
  return 'BE';
};

const DEFAULT_REMARKS = {
  EE: 'Exceeds target criteria comfortably.',
  ME: 'Meets required strand expectations.',
  AE: 'Requires minor guided practice.',
  BE: 'Needs step-by-step remedial support.',
};

const TeacherDashboard = () => {
  const [grades, setGrades] = useState([]);
  const [learningAreas, setLearningAreas] = useState([]);
  const [roster, setRoster] = useState({ term: '', term_id: null, learners: [] });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [modalSubject, setModalSubject] = useState('');
  const [modalGrade, setModalGrade] = useState('');
  const [modalTaskType, setModalTaskType] = useState('Practical Performance Task');
  const [modalStrand, setModalStrand] = useState('Living Things & Environment');
  const [modalSubstrand, setModalSubstrand] = useState('Water Filtration & Natural Purification');
  const [modalScores, setModalScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [g, la, rosterRes, tasksRes] = await Promise.all([
          fetchGrades(),
          fetchLearningAreas(),
          api.get('/api/gradebook/learners/').then((r) => r.data),
          fetchAssessmentTasks(),
        ]);
        setGrades(g);
        setLearningAreas(la);
        setRoster({
          term: rosterRes.term || '',
          term_id: rosterRes.term_id || null,
          learners: rosterRes.learners || [],
        });
        setTasks(tasksRes);
        if (la.length) setModalSubject(la[0].name);
        if (g.length) setModalGrade(g.find((x) => x.name.startsWith('Grade 6'))?.name || g[0].name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectOptions = useMemo(
    () => learningAreas.map((la) => la.name),
    [learningAreas]
  );

  const metrics = useMemo(() => {
    const learners = roster.learners || [];
    const pcts = learners.map((l) => l.overall_percentage || 0);
    if (!learners.length) return { enrolled: 0, tasks: tasks.length, avg: null, remedial: 0 };
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    const remedial = learners.filter((l) => (l.overall_percentage || 0) < 50).length;
    return {
      enrolled: learners.length,
      tasks: tasks.filter((t) => t.status !== 'DRAFT').length,
      avg,
      remedial,
    };
  }, [roster, tasks]);

  const masteryLabel = metrics.avg != null ? levelFromPct(metrics.avg) : null;

  const taskCards = useMemo(
    () =>
      (tasks || []).map((t) => ({
        subject: t.learning_area_name || 'General',
        substrand: t.sub_strand || '-',
        date: t.created_at ? new Date(t.created_at).toLocaleDateString() : '-',
        status: (t.status || 'Active').toUpperCase(),
      })),
    [tasks]
  );

  const openModal = () => {
    setShowModal(true);
    setStep(1);
    setModalScores({});
    (roster.learners || []).forEach((l) => {
      setModalScores((prev) => ({ ...prev, [l.id]: { score: 'ME', remark: DEFAULT_REMARKS.ME } }));
    });
  };

  const closeModal = () => setShowModal(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const setScore = (learnerId, score) => {
    setModalScores((prev) => ({
      ...prev,
      [learnerId]: { ...prev[learnerId], score, remark: DEFAULT_REMARKS[score] },
    }));
  };

  const setRemark = (learnerId, remark) => {
    setModalScores((prev) => ({
      ...prev,
      [learnerId]: { ...prev[learnerId], remark },
    }));
  };

  const batchSet = (score) => {
    const next = {};
    (roster.learners || []).forEach((l) => {
      next[l.id] = { score, remark: DEFAULT_REMARKS[score] };
    });
    setModalScores(next);
  };

  const handleSaveAssessment = async () => {
    const la = learningAreas.find((l) => l.name === modalSubject);
    if (!la) return;
    setSaving(true);
    setError('');
    try {
      const results = (roster.learners || []).map((l) => {
        const ms = modalScores[l.id] || { score: 'ME', remark: DEFAULT_REMARKS.ME };
        return { learner: l.id, level_achieved: ms.score, remark: ms.remark };
      });
      await createAssessmentTask({
        learning_area: la.id,
        term: roster.term_id,
        title: modalStrand || modalSubstrand,
        task_type: 'PPT',
        strand: modalStrand,
        sub_strand: modalSubstrand,
        status: 'COMPLETED',
        results,
      });
      const [rosterRes, tasksRes] = await Promise.all([
        api.get('/api/gradebook/learners/').then((r) => r.data),
        fetchAssessmentTasks(),
      ]);
      setRoster({
        term: rosterRes.term || '',
        term_id: rosterRes.term_id || null,
        learners: rosterRes.learners || [],
      });
      setTasks(tasksRes);
      closeModal();
      window.alert('Assessment task saved and results synchronized to parent portal!');
    } catch (err) {
      setError(formErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const rubricClass = (lvl) => RUBRIC.find((r) => r.key === lvl)?.color || 'text-slate-500';

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <section className="space-y-6">
        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {metrics.enrolled === 1 ? 'Grade 6 Learner' : 'Grade 6 Learners'} Enrolled
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.enrolled}</h3>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              <i className="fa-solid fa-square-check"></i>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active CBC Tasks</p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">
                {metrics.tasks} {metrics.tasks === 1 ? 'Task' : 'Tasks'}
              </h3>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Class Mastery Index</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {metrics.avg != null ? `${metrics.avg}%` : '--'}{' '}
                <span className="text-xs text-slate-400">
                  ({masteryLabel ? LEVEL_LABEL[masteryLabel] : '–'} Avg)
                </span>
              </h3>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Remedial Flagged</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{metrics.remedial} Learners</h3>
              <span className="text-[11px] text-rose-500 font-medium">Requires Targeted Support</span>
            </div>
          </div>
        </div>

        {/* Recent Tasks & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <i className="fa-solid fa-list-check text-teal-600"></i>
                Formative Assessment Tasks
              </h3>
              <button
                onClick={openModal}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800"
              >
                + Add Task
              </button>
            </div>
            <div className="space-y-3">
              {taskCards.map((t, i) => (
                <div
                  key={`${t.subject}-${i}`}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{t.substrand}</p>
                    <p className="text-[10px] text-slate-400">{t.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{t.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        t.status === 'EE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : t.status === 'ME'
                          ? 'bg-blue-100 text-blue-700'
                          : t.status === 'AE'
                          ? 'bg-amber-100 text-amber-700'
                          : t.status === 'BE'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
              {taskCards.length === 0 && (
                <p className="text-xs text-slate-400">No formative tasks recorded yet.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500"></i>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={openModal}
                className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
                    <i className="fa-solid fa-clipboard-question"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Create Assessment Modal</p>
                    <p className="text-[10px] text-slate-400">Task setup & student matrix</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-teal-600"></i>
              </button>

              <button
                onClick={() => (window.location.href = '/assessments')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <i className="fa-solid fa-award"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Formative Gradebook</p>
                    <p className="text-[10px] text-slate-400">Batch mark EE, ME, AE, BE</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs text-slate-400 group-hover:text-blue-600"></i>
              </button>

              <button
                onClick={() =>
                  window.alert('Switch to parent preview mode — view the portal as a parent/guardian.')
                }
                className="w-full text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <i className="fa-solid fa-eye"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Switch to Parent Preview</p>
                    <p className="text-[10px] text-emerald-700">Test parent portal experience</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs text-emerald-600"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* New CBC Assessment Task Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">CBC Assessment Task Builder & Evaluator</h3>
                  <p className="text-[11px] text-teal-400">KICD Formative Task & Direct Scoring Grid</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white text-lg transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex justify-between items-center shrink-0 text-xs">
              {[1, 2, 3, 4].map((s) => [
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                    step === s
                      ? 'font-bold text-teal-700 bg-teal-100'
                      : 'font-semibold text-slate-500'
                  }`}
                >
                  <span>
                    {s}.{' '}
                    {s === 1
                      ? 'Task Metadata'
                      : s === 2
                      ? 'Competencies & Values'
                      : s === 3
                      ? 'Rubric Descriptors'
                      : 'Live Student Scoring'}
                  </span>
                </button>,
                s < 4 && <i key={`c${s}`} className="fa-solid fa-chevron-right text-slate-300 text-[10px]"></i>,
              ])}
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Learning Area *</label>
                      <select
                        value={modalSubject}
                        onChange={(e) => setModalSubject(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      >
                        {subjectOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Grade Level *</label>
                      <select
                        value={modalGrade}
                        onChange={(e) => setModalGrade(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      >
                        {grades.map((g) => (
                          <option key={g.id} value={g.name}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Task Type *</label>
                      <select
                        value={modalTaskType}
                        onChange={(e) => setModalTaskType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      >
                        <option value="Practical Performance Task">Practical Performance Task</option>
                        <option value="Project-Based Learning">Project-Based Learning (P5)</option>
                        <option value="Observation Rubric">Teacher Observation Rubric</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Strand Name *</label>
                      <input
                        type="text"
                        value={modalStrand}
                        onChange={(e) => setModalStrand(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sub-strand Task *</label>
                      <input
                        type="text"
                        value={modalSubstrand}
                        onChange={(e) => setModalSubstrand(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <label className="block font-bold text-slate-800 text-sm mb-2">
                    Tag Target Core Competencies
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="p-2 bg-slate-50 border rounded-lg flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="font-semibold">Critical Thinking & Problem Solving</span>
                    </label>
                    <label className="p-2 bg-slate-50 border rounded-lg flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="font-semibold">Creativity & Innovation</span>
                    </label>
                    <label className="p-2 bg-slate-50 border rounded-lg flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="font-semibold">Digital Literacy</span>
                    </label>
                    <label className="p-2 bg-slate-50 border rounded-lg flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="font-semibold">Communication & Collaboration</span>
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <p className="font-bold text-slate-800 text-sm">4-Level Performance Assessment Rubrics</p>
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="font-bold text-emerald-800">EE:</span> Constructs apparatus independently and purifies water flawlessly.
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-bold text-blue-800">ME:</span> Constructs filter apparatus with minimal support.
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="font-bold text-amber-800">AE:</span> Assembles filter but water remains turbid; needs guidance.
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="font-bold text-rose-800">BE:</span> Struggles with assembly; needs teacher demonstration.
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-teal-50 p-3 rounded-xl border border-teal-200">
                    <p className="font-bold text-teal-900">Score Learners Live for {modalGrade}</p>
                    <div className="space-x-1">
                      <button
                        onClick={() => batchSet('EE')}
                        className="px-2 py-1 bg-emerald-600 text-white font-bold rounded"
                      >
                        All EE
                      </button>
                      <button
                        onClick={() => batchSet('ME')}
                        className="px-2 py-1 bg-blue-600 text-white font-bold rounded"
                      >
                        All ME
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">Learner</th>
                          <th className="p-2.5 text-center">Score</th>
                          <th className="p-2.5">Teacher Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(roster.learners || []).map((l) => {
                          const ms = modalScores[l.id] || { score: 'ME', remark: DEFAULT_REMARKS.ME };
                          return (
                            <tr key={l.id}>
                              <td className="p-2.5 font-semibold text-slate-800">{l.name}</td>
                              <td className="p-2.5 text-center">
                                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 space-x-1">
                                  {['EE', 'ME', 'AE', 'BE'].map((lvl) => (
                                    <button
                                      key={lvl}
                                      onClick={() => setScore(l.id, lvl)}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                                        ms.score === lvl ? rubricClass(lvl) : 'text-slate-500 hover:bg-slate-200'
                                      }`}
                                    >
                                      {lvl}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="p-2.5">
                                <textarea
                                  value={ms.remark}
                                  onChange={(e) => setRemark(l.id, e.target.value)}
                                  rows={1}
                                  className="w-full text-xs p-1 bg-slate-50 border rounded"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center shrink-0">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center space-x-2">
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSaveAssessment}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save & Publish'}
                  </button>
                )}
              </div>
            </div>

            {error && <p className="px-6 text-xs text-rose-600">{error}</p>}
          </div>
        </div>
      )}

      <AITeacherAssist />
    </div>
  );
};

export default TeacherDashboard;
