import { useState, useEffect, useMemo } from 'react';
import api, {
  fetchGrades,
  fetchLearningAreas,
  fetchStreams,
  patchLearnerAssessment,
  formErrorMessage,
} from '../services/api';
import AITeacherAssist from '../components/AITeacherAssist';

const LEVEL_LABEL = { EE: 'EE (4)', ME: 'ME (3)', AE: 'AE (2)', BE: 'BE (1)' };

const levelFromPct = (pct) => {
  if (pct >= 80) return 'EE';
  if (pct >= 65) return 'ME';
  if (pct >= 50) return 'AE';
  return 'BE';
};

const computePct = (strands, csl) => {
  const s = (strands || []).slice(0, 3);
  const strandAvg = s.reduce((a, b) => a + (Number(b) || 0), 0) / (s.length || 1);
  return Math.round((strandAvg / 4) * 80 + (Number(csl) || 0) / 20 * 20);
};

const Assessments = () => {
  const [grades, setGrades] = useState([]);
  const [learningAreas, setLearningAreas] = useState([]);
  const [streams, setStreams] = useState([]);
  const [roster, setRoster] = useState({ term: '', learners: [] });

  const [grade, setGrade] = useState('Grade 6');
  const [learningArea, setLearningArea] = useState('');
  const [stream, setStream] = useState('East');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStrandTitle, setNewStrandTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editCache, setEditCache] = useState({});

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [g, la, st, ro] = await Promise.all([
          fetchGrades(),
          fetchLearningAreas(),
          fetchStreams(),
          api.get('/api/gradebook/learners/').then((r) => r.data),
        ]);
        setGrades(g);
        setLearningAreas(la);
        setStreams(st);
        setRoster(ro);
        if (la.length) setLearningArea(la[0].name);
      } catch (err) {
        console.error(err);
      }
    };
    loadRefs();
  }, []);

  const displayed = useMemo(() => {
    return (roster.learners || []).filter((l) => {
      const inGrade =
        !grade || (l.current_grade || '').startsWith(grade);
      const inStream =
        !stream || (l.current_grade || '').toLowerCase().includes(stream.toLowerCase());
      const matches =
        !search ||
        (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.nemis_number || '').includes(search);
      return inGrade && inStream && matches;
    });
  }, [roster, grade, stream, search]);

  const rows = useMemo(() => {
    const laId = learningAreas.find((la) => la.name === learningArea)?.id;
    return displayed.map((l) => {
      const scores = l.la_scores || [];
      const entry = scores.find(
        (s) => s.learning_area === learningArea
      ) || { strands: [3, 3, 3], csl_score: 15, remarks: '', teacher_comment: '' };
      const cached = editCache[l.id] || {};
      const strands = cached.strands
        ? cached.strands.map((v, i) => cached.strands[i] ?? entry.strands[i])
        : entry.strands;
      const csl = cached.csl_score ?? entry.csl_score;
      const remarks = cached.remarks ?? entry.remarks;
      const pct = computePct(strands, csl);
      return { ...l, laId, strands, csl, remarks, pct, level: levelFromPct(pct) };
    });
  }, [displayed, learningArea, learningAreas, editCache]);

  const metrics = useMemo(() => {
    if (!rows.length) {
      return { avg: null, ee: 0, be: 0, csl: 0 };
    }
    const pcts = rows.map((r) => r.pct);
    const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    const ee = Math.round((pcts.filter((p) => p >= 80).length / pcts.length) * 100);
    const be = Math.round((pcts.filter((p) => p < 50).length / pcts.length) * 100);
    const cslAvg = Math.round(rows.reduce((a, r) => a + (Number(r.csl) || 0), 0) / rows.length);
    return { avg: avgPct, ee, be, csl: Math.round((cslAvg / 20) * 100) };
  }, [rows]);

  const setCell = (learnerId, field, value) => {
    setEditCache((prev) => {
      const cur = prev[learnerId] || {};
      let next;
      if (field.startsWith('strand')) {
        const strands = [...(cur.strands || rows.find((r) => r.id === learnerId)?.strands || [3, 3, 3])];
        strands[Number(field.slice(-1)) - 1] = Number(value);
        next = { ...cur, strands };
      } else {
        next = { ...cur, [field]: value };
      }
      return { ...prev, [learnerId]: next };
    });
  };

  const handleSave = async (learnerId) => {
    const row = rows.find((r) => r.id === learnerId);
    const cache = editCache[learnerId] || {};
    if (!row || !row.laId) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        learning_area: row.laId,
        strand1: cache.strands ? cache.strands[0] : row.strands[0],
        strand2: cache.strands ? cache.strands[1] : row.strands[1],
        strand3: cache.strands ? cache.strands[2] : row.strands[2],
        csl_score: cache.csl_score ?? row.csl,
        remarks: cache.remarks ?? row.remarks,
      };
      const saved = await patchLearnerAssessment(learnerId, payload);
      setRoster((prev) => {
        const learners = (prev.learners || []).map((l) => {
          if (l.id !== learnerId) return l;
          const la_scores = (l.la_scores || []).map((s) =>
            s.learning_area === saved.learning_area
              ? { ...s, strands: saved.strands, csl_score: saved.csl_score, remarks: saved.remarks }
              : s
          );
          return { ...l, la_scores };
        });
        return { ...prev, learners };
      });
      setEditCache((prev) => {
        const next = { ...prev };
        delete next[learnerId];
        return next;
      });
    } catch (err) {
      setError(formErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAutoFill = () => {
    setEditCache({});
  };

  const overallBadge = (pct) => {
    const lvl = levelFromPct(pct);
    const cls = {
      EE: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      ME: 'bg-blue-100 text-blue-800 border border-blue-200',
      AE: 'bg-amber-100 text-amber-800 border border-amber-200',
      BE: 'bg-red-100 text-red-800 border border-red-200',
    }[lvl];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${cls}`}
      >
        {LEVEL_LABEL[lvl]} ({pct}%)
      </span>
    );
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-brand-navy mb-1">CBC Gradebook & Portfolio</h1>
        <p className="text-brand-navy/70">
          {roster.term || 'Active Term'} · Grade: {grade} · Learning Area: {learningArea} · Stream: {stream}
        </p>
      </header>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Learning Area (Subject)</label>
            <select
              value={learningArea}
              onChange={(e) => setLearningArea(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {learningAreas.map((la) => (
                <option key={la.id} value={la.name}>
                  {la.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Stream</label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {streams.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus text-teal-600"></i> Add Strand Assessment
          </button>
          <button
            onClick={handleAutoFill}
            className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-teal-200 transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Auto-Fill Sample
          </button>
          <button
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          >
            <i className="fa-solid fa-print"></i> Print Broad Sheet
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Class Performance Index</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {LEVEL_LABEL[Object.keys(LEVEL_LABEL).find((k) => levelFromPct(metrics.avg || 0) === k)]} (
              {(metrics.avg / 4).toFixed(2)})
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Target: Meeting Expectation</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Exceeding Expectations (EE)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{metrics.ee}%</h3>
            <span className="text-[11px] text-slate-400">Above 80% mark</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <i className="fa-solid fa-award"></i>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Needs Intervention (BE)</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{metrics.be}%</h3>
            <span className="text-[11px] text-red-500 font-medium">Requires Targeted Support</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">CSL / Project Completion</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{metrics.csl}%</h3>
            <span className="text-[11px] text-slate-400">Community Service Learning</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            <i className="fa-solid fa-hands-holding-child"></i>
          </div>
        </div>
      </section>

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-800">
              {grade} - {learningArea} Formative Gradebook
            </h2>
            <p className="text-xs text-slate-500">
              Rubric Levels: EE=4, ME=3, AE=2, BE=1. Scores update real-time into student portfolios.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name or NEMIS..."
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs w-64 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="gradebookTable">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 min-w-[140px]">UPI / NEMIS</th>
                <th className="p-3 min-w-[180px]">Learner Name</th>
                <th className="p-3 text-center min-w-[120px]">Strand 1 (Score 1-4)</th>
                <th className="p-3 text-center min-w-[120px]">Strand 2 (Score 1-4)</th>
                <th className="p-3 text-center min-w-[120px]">Strand 3 (Score 1-4)</th>
                <th className="p-3 text-center min-w-[110px]">CSL / Project (0-20)</th>
                <th className="p-3 text-center min-w-[110px]">Aggregate %</th>
                <th className="p-3 text-center min-w-[130px]">Rating Badge</th>
                <th className="p-3 min-w-[220px]">Teacher Observational Remarks</th>
                <th className="p-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="p-3 text-center text-slate-500">{i + 1}</td>
                  <td className="p-3 font-mono text-slate-600">
                    {r.nemis_number || r.assessment_number || '-'}
                  </td>
                  <td className="p-3 font-medium text-slate-800">{r.name}</td>
                  <td className="p-3 text-center">
                    <select
                      value={r.strands[0] || 3}
                      onChange={(e) => setCell(r.id, 'strand1', e.target.value)}
                      className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-center text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={r.strands[1] || 3}
                      onChange={(e) => setCell(r.id, 'strand2', e.target.value)}
                      className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-center text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={r.strands[2] || 3}
                      onChange={(e) => setCell(r.id, 'strand3', e.target.value)}
                      className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-center text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={r.csl}
                      onChange={(e) => setCell(r.id, 'csl_score', e.target.value)}
                      className="w-16 border border-slate-300 rounded px-1.5 py-0.5 text-center text-sm focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800">{r.pct}%</td>
                  <td className="p-3 text-center">{overallBadge(r.pct)}</td>
                  <td className="p-3">
                    <textarea
                      value={r.remarks}
                      onChange={(e) => setCell(r.id, 'remarks', e.target.value)}
                      rows={1}
                      className="w-full border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      placeholder="Observational remarks..."
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleSave(r.id)}
                      disabled={saving}
                      className={`px-2 py-1 rounded text-xs font-semibold text-white transition ${
                        saving
                          ? 'bg-slate-300 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      {saving ? '…' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-500">
                    No learners match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Add New Strand Assessment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Strand Title / Task Name</label>
                <input
                  type="text"
                  value={newStrandTitle}
                  onChange={(e) => setNewStrandTitle(e.target.value)}
                  placeholder="e.g. Strand 4: Living Things Project"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Max Score Scale</label>
                <select className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                  <option value="4">4 Level Rubric (EE, ME, AE, BE)</option>
                  <option value="20">CSL Score (Out of 20)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
              >
                Add Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      <AITeacherAssist />
    </div>
  );
};

export default Assessments;
