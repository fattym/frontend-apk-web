import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COMPETENCY_LABELS = [
  'Communication',
  'Critical Thinking',
  'Creativity & Imagination',
  'Citizenship',
  'Digital Literacy',
  'Learning to Learn',
  'Self-Efficacy',
];

const LEVEL_CLASSES = {
  EE: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  ME: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  AE: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  BE: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

const badgeFor = (pct) => {
  if (pct >= 80) return { key: 'EE', label: 'Exceeding', colour: 'text-emerald-600' };
  if (pct >= 50) return { key: 'ME', label: 'Meeting', colour: 'text-blue-600' };
  return { key: 'BE', label: 'Below', colour: 'text-red-600' };
};

export default function Gradebook() {
  const [roster, setRoster] = useState({ term: '', learners: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('gradebook');
  const [selectedId, setSelectedId] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedLA, setSelectedLA] = useState('Integrated Science');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/gradebook/learners/')
      .then((r) => {
        const data = r.data;
        setRoster(data);
        if (data.learners?.length) setSelectedId(data.learners[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setReportLoading(true);
    api.get(`/api/gradebook/learners/${selectedId}/report/`)
      .then((r) => setReport(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setReportLoading(false));
  }, [selectedId]);

  const learners = (roster.learners || []).filter((l) => (l.la_scores || []).length > 0);

  const visibleLearners = useMemo(() => {
    if (!search) return learners;
    const q = search.toLowerCase();
    return learners.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.current_grade || '').toLowerCase().includes(q)
    );
  }, [learners, search]);

  const classMetrics = useMemo(() => {
    const rows = visibleLearners.map((l) => l.la_scores || []).flat();
    const byLA = {};
    rows.forEach((r) => {
      (byLA[r.learning_area] = byLA[r.learning_area] || []).push(r);
    });
    const allPercents = rows.map((r) => r.percentage);
    const avg = allPercents.length
      ? Math.round(allPercents.reduce((a, b) => a + b, 0) / allPercents.length)
      : 0;
    const ee = Math.round(
      (allPercents.filter((p) => p >= 80).length / (allPercents.length || 1)) * 100
    );
    const be = Math.round(
      (allPercents.filter((p) => p < 50).length / (allPercents.length || 1)) * 100
    );
    const csl = rows.length
      ? Math.round((rows.reduce((a, r) => a + (r.csl_score || 0), 0) / (rows.length * 20)) * 100)
      : 0;
    return { avg, ee, be, csl };
  }, [visibleLearners]);

  const gridRows = visibleLearners;
  const gridLA = (l) =>
    (l.la_scores || []).find((r) => r.learning_area === selectedLA) ||
    (l.la_scores || [])[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Inner page sub-header / tab navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 no-print">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">CBC Gradebook & Portfolio</h1>
          <p className="text-xs text-slate-500">
            {roster.term || 'Assessment Cycle'} · Ministry of Education CBC / KNEC Formative Assessment System
          </p>
        </div>
        <nav className="mt-3 flex gap-2" role="tablist">
          {[
            ['gradebook', 'CBC Gradebook', 'book-open'],
            ['roster', 'Learner Roster', 'users'],
            ['profile', '360° Learner Profile', 'id-card'],
            ['reports', 'KNEC Progress Reports', 'file-invoice'],
          ].map(([val, label, icon]) => (
            <button
              key={val}
              role="tab"
              onClick={() => setActiveTab(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition
                ${activeTab === val
                  ? 'bg-teal-600 text-white shadow shadow-teal-900/40'
                  : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className={`fa-solid fa-${icon}`}></i> {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">Could not load gradebook: {error}</div>
        )}
        {loading ? (
          <div className="text-slate-400">Loading gradebook…</div>
        ) : (
          <>
          {/* TAB 1: GRADEBOOK */}
          {activeTab === 'gradebook' && (
          <>
            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Grade Level
                  </label>
                  <select
                    value={selectedId ? '' : 'g6'}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="g6">Grade 6</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Learning Area
                  </label>
                  <select
                    value={selectedLA}
                    onChange={(e) => setSelectedLA(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {Array.from(new Set(learners.flatMap((l) => (l.la_scores || []).map((r) => r.learning_area)))).map(
                      (la) => <option key={la} value={la}>{la}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Stream
                  </label>
                  <select className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none">
                    <option>6 East</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-print"></i> Print Broad Sheet
                </button>
              </div>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Class Performance Index</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">
                    {badgeFor(classMetrics.avg).label} ({classMetrics.avg}%)
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
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{classMetrics.ee}%</h3>
                  <span className="text-[11px] text-slate-400">Above 80% mark</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-award"></i>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Needs Intervention (BE)</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">{classMetrics.be}%</h3>
                  <span className="text-[11px] text-red-500 font-medium">Requires Targeted Support</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">CSL / Project Completion</p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1">{classMetrics.csl}%</h3>
                  <span className="text-[11px] text-slate-400">Community Service Learning</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-hands-holding-child"></i>
                </div>
              </div>
            </div>

            {/* Gradebook grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800">
                    {selectedLA} Formative Gradebook — {roster.term || '2026 Term 1'}
                  </h2>
                  <p className="text-xs text-slate-500">Rubric Levels: EE=4, ME=3, AE=2, BE=1. Scores update real-time into student portfolios.</p>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search learner name..."
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs w-64 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 min-w-[130px]">NEMIS UPI</th>
                      <th className="p-3 min-w-[170px]">Learner Name</th>
                      <th className="p-3 text-center">Strand 1</th>
                      <th className="p-3 text-center">Strand 2</th>
                      <th className="p-3 text-center">Strand 3</th>
                      <th className="p-3 text-center">CSL</th>
                      <th className="p-3 text-center">Aggregate</th>
                      <th className="p-3 text-center">Rating</th>
                      <th className="p-3 min-w-[180px]">Teacher Observations</th>
                      <th className="p-3 text-center w-16">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {gridRows.map((l, i) => {
                      const r = gridLA(l);
                      const pct = r?.percentage || 0;
                      const b = badgeFor(pct);
                      const lc = LEVEL_CLASSES[b.key];
                      return (
                        <tr key={l.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 text-center text-slate-400 font-medium">{i + 1}</td>
                          <td className="p-3 font-mono font-semibold text-slate-700">{l.name}</td>
                          <td className="p-3 font-bold text-slate-800">{l.name}</td>
                          {r && ([r.strands[0], r.strands[1], r.strands[2]]).map((v, j) => (
                            <td key={j} className="p-3 text-center">
                              <select className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-700">
                                {[4, 3, 2, 1].map((lvl) => (
                                  <option key={lvl} value={lvl} selected={v === lvl}>{lvl} - {['', 'BE', 'AE', 'ME', 'EE'][lvl]}</option>
                                ))}
                              </select>
                            </td>
                          ))}
                          {!r && Array.from({ length: 3 }).map((_, j) => (
                            <td key={j} className="p-3 text-center"><span className="text-slate-400">—</span></td>
                          ))}
                          <td className="p-3 text-center">{r ? `${r.csl_score} / 20` : '—'}</td>
                          <td className="p-3 text-center font-bold text-slate-800">{pct}%</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${lc.bg} ${lc.text} ${lc.border}`}>
                              {b.key} ({b.label})
                            </span>
                          </td>
                          <td className="p-3 italic text-slate-600">{r?.remarks || '—'}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedId(l.id)}
                              className="text-teal-600 hover:text-teal-800 p-1"
                              title="View 360° Profile"
                            >
                              <i className="fa-solid fa-address-card text-base"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!gridRows.length && (
                      <tr><td colSpan={11} className="p-6 text-center text-slate-400">No learners found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: LEARNER ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Class Learner Directory</h2>
                <p className="text-xs text-slate-500">Bio-data, NEMIS UPI codes, SEN status & parent contacts.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                      <th className="p-3">Learner ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">NEMIS UPI</th>
                      <th className="p-3">KNEC ID</th>
                      <th className="p-3">Grade Level</th>
                      <th className="p-3">SEN Status</th>
                      <th className="p-3">Guardian Contact</th>
                      <th className="p-3 text-center">360° Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {visibleLearners.map((l, i) => {
                      const pct = l.overall_percentage || 0;
                      const b = badgeFor(pct);
                      const lc = LEVEL_CLASSES[b.key];
                      return (
                        <tr key={l.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-semibold text-slate-500">#{i + 1}</td>
                          <td className="p-3 font-bold text-slate-800">{l.name}</td>
                          <td className="p-3 font-mono text-slate-600">{l.nemis_number || '—'}</td>
                          <td className="p-3 font-mono text-slate-600">{l.assessment_number || '—'}</td>
                          <td className="p-3 font-medium text-slate-700">{l.current_grade || '—'}</td>
                          <td className="p-3"><span className={`bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border ${lc.border}`}>{l.sen_status || 'Regular Learner'}</span></td>
                          <td className="p-3 text-slate-600">{l.parent_phone || '—'}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => { setSelectedId(l.id); setActiveTab('profile'); }}
                              className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1 rounded text-xs font-semibold border border-teal-200"
                            >
                              Open Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 360° PROFILE */}
        {activeTab === 'profile' && (
          <ProfileTab
            report={report}
            reportLoading={reportLoading}
            onSelect={(id) => setSelectedId(id)}
            learners={learners}
          />
        )}

        {/* TAB 4: REPORT CARD */}
        {activeTab === 'reports' && (
          <ReportsTab report={report} reportLoading={reportLoading} />
        )}
        </>
        )}
      </div>
    </div>
  );
}

function ProfileTab({ report, reportLoading, onSelect, learners }) {
  if (reportLoading || !report) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading learner profile...
      </div>
    );
  }
  const { student, core_values, portfolio_artifacts, overall } = report;
  const initials = student.name.split(' ').map((p) => p[0]).join('').slice(0, 2);

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Student:</label>
          <select
            value={student.id}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-teal-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {learners.map((l) => (
              <option key={l.id} value={l.id}>{l.name} ({l.current_grade})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-2xl bg-teal-600 border-2 border-amber-400 flex items-center justify-center text-3xl font-bold shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-400/30">
                {student.sen_status}
              </span>
            </div>
            <p className="text-xs text-teal-200 mt-1">
              {student.current_grade} | NEMIS UPI: {student.nemis_number} | KNEC ID: {student.assessment_number}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
              <span><i className="fa-solid fa-calendar-days text-amber-400 mr-1"></i> DOB: {student.date_of_birth}</span>
              <span><i className="fa-solid fa-phone text-amber-400 mr-1"></i> Parent: {student.parent_phone}</span>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center min-w-[180px]">
          <span className="text-xs text-teal-200 block uppercase font-medium">Overall Assessment Rating</span>
          <span className="text-3xl font-black text-amber-300 block my-1">{overall.level} ({overall.percentage}%)</span>
          <span className="text-[11px] text-teal-100">{overall.label}</span>
        </div>
      </div>

      {/* Core competencies + values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-teal-600"></i> CBC 7 Core Competencies Evaluation
            </h3>
            <p className="text-xs text-slate-500 mb-4">Assessment based on teacher observations during practical tasks.</p>
            <div className="h-64 relative">
              {report.core_competencies?.length ? (
                <Radar
                  data={{
                    labels: report.core_competencies.map((c) => c.competency),
                    datasets: [
                      {
                        label: 'Competency Score (100%)',
                        data: report.core_competencies.map((c) => c.score),
                        backgroundColor: 'rgba(13, 148, 136, 0.25)',
                        borderColor: '#0d9488',
                        pointBackgroundColor: '#0f766e',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#0f766e',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#cbd5e1' },
                        suggestedMin: 30,
                        suggestedMax: 100,
                        ticks: { display: false },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <p className="text-xs text-slate-400 pt-6 text-center">No competency scores yet.</p>
              )}
            </div>
          </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i className="fa-solid fa-heart text-red-500"></i> Core Values & Citizenship Attributes
          </h3>
          <div className="space-y-3 text-xs">
            {core_values.map((v) => {
              const lc = LEVEL_CLASSES[v.level] || LEVEL_CLASSES.ME;
              return (
                <div key={v.value} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-medium">{v.value}</span>
                  <span className={`font-bold ${lc.text}`}>{v.level} — {v.level_label}</span>
                </div>
              );
            })}
          </div>
          <hr className="border-slate-100" />
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i className="fa-solid fa-trophy text-amber-500"></i> Talent & Community Engagement
          </h3>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Clubs & Societies:</span>
              <span className="text-teal-700">Science & Innovation Club (Chair)</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Community Service (CSL):</span>
              <span className="text-teal-700">School Tree Planting Drive (Completed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Evidence Vault */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i className="fa-solid fa-folder-open text-amber-600"></i> Portfolio Evidence Vault (Authentic Assessment)
          </h3>
          <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded border border-slate-300">
            + Upload Artifact
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolio_artifacts.map((a) => (
            <div key={a.title} className="border border-slate-200 p-3 rounded-lg bg-slate-50 flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${a.artifact_type === 'document' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                <i className={`fa-solid fa-${a.artifact_type === 'document' ? 'file-pdf' : 'image'} text-lg`}></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{a.title}</h4>
                <p className="text-[10px] text-slate-500">Uploaded {a.uploaded_at} • Rating: {a.rating}</p>
              </div>
            </div>
          ))}
          {!portfolio_artifacts.length && (
            <p className="text-xs text-slate-400 col-span-3">No portfolio artifacts uploaded yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

function ReportsTab({ report, reportLoading }) {
  if (reportLoading || !report) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading report card...
      </div>
    );
  }
  const { student, term, learning_area_scores, school_info, homeroom_teacher, attendance } = report;
  const printDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center no-print">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">KNEC Learner Progress Report Card</h2>
          <p className="text-xs text-slate-500">Official Competency-Based Assessment Summary Sheet formatted for printing.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert('Generating official KNEC card for ' + student.name)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <i className="fa-solid fa-file-pdf"></i> Generate Official KNEC Card
          </button>
          <button
            onClick={() => window.print()}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i> Print Official Report Card
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-lg max-w-4xl mx-auto space-y-6 text-slate-800 print:shadow-none print:border-none print:p-0">
        <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
          <div className="flex justify-center items-center gap-3">
            <i className="fa-solid fa-shield-halved text-4xl text-teal-800"></i>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">{school_info?.name || 'School'}</h1>
              <p className="text-xs font-semibold text-slate-600">MINISTRY OF EDUCATION - KENYA NATIONAL EXAMINATIONS COUNCIL</p>
              <p className="text-xs italic text-slate-500">{school_info?.address || ''} | Email: {school_info?.email || ''} | UPI Code: {school_info?.code || ''}</p>
            </div>
          </div>
          <div className="mt-2 inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
            CBC LEARNER FORMATIVE PROGRESS REPORT - {term.name.toUpperCase()}
          </div>
        </div>

        {/* Learner Bio Section */}
        <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 bg-slate-50/50 rounded-lg">
          <div>
            <p><span className="font-bold">Learner Name:</span> <span className="font-semibold text-teal-900">{student.name}</span></p>
            <p><span className="font-bold">NEMIS UPI:</span> {student.nemis_number}</p>
            <p><span className="font-bold">KNEC Assessment No:</span> {student.assessment_number}</p>
          </div>
          <div>
            <p><span className="font-bold">Grade &amp; Stream:</span> {student.current_grade}</p>
            <p><span className="font-bold">Attendance:</span> {attendance.days_present} / {attendance.days_total} Days Present ({attendance.percentage}%)</p>
            <p><span className="font-bold">Class Teacher:</span> {homeroom_teacher}</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2"
        >
          <i className="fa-solid fa-print"></i> Print Official Report Card
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-lg max-w-4xl mx-auto space-y-6 text-slate-800 print:shadow-none print:border-none print:p-0">
        <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
          <div className="flex justify-center items-center gap-3">
            <i className="fa-solid fa-shield-halved text-4xl text-teal-800"></i>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">Nairobi STEM Academy</h1>
              <p className="text-xs font-semibold text-slate-600">MINISTRY OF EDUCATION - KENYA NATIONAL EXAMINATIONS COUNCIL</p>
              <p className="text-xs italic text-slate-500">P.O. Box 40100-00100, Nairobi | Email: info@nairobiasacademy.ac.ke</p>
            </div>
          </div>
          <div className="mt-2 inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
            CBC LEARNER FORMATIVE PROGRESS REPORT - {term.name.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 bg-slate-50/50 rounded-lg">
          <div>
            <p><span className="font-bold">Learner Name:</span> <span className="font-semibold text-teal-900">{student.name}</span></p>
            <p><span className="font-bold">NEMIS UPI:</span> {student.nemis_number}</p>
            <p><span className="font-bold">KNEC Assessment No:</span> {student.assessment_number}</p>
          </div>
          <div>
            <p><span className="font-bold">Grade & Stream:</span> {student.current_grade}</p>
            <p><span className="font-bold">Attendance:</span> 64 / 65 Days Present</p>
            <p><span className="font-bold">Class Teacher:</span> Mr. J. Mwangi</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Formative Assessment Summary by Learning Area</h3>
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-300">
                <th className="border border-slate-300 p-2 text-left">Learning Area</th>
                <th className="border border-slate-300 p-2 text-center">Strand Average Rating</th>
                <th className="border border-slate-300 p-2 text-center">CSL Score</th>
                <th className="border border-slate-300 p-2 text-center">Overall Level</th>
                <th className="border border-slate-300 p-2 text-left">Specific Remarks</th>
              </tr>
            </thead>
            <tbody>
              {learning_area_scores.map((la) => (
                <tr key={la.learning_area}>
                  <td className="border border-slate-300 p-2 font-bold text-slate-800">{la.learning_area}</td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{la.strand_average} / 4.0</td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">{la.csl_score} / 20</td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-teal-800">{la.overall_label} ({la.percentage}%)</td>
                  <td className="border border-slate-300 p-2 text-slate-600">{la.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-300 p-3 rounded-lg">
            <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Core Competencies Observed</h4>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              {COMPETENCY_LABELS.map((label, i) => {
                const c = report.core_competencies[i] || {};
                const b = badgeFor(c.score || 0);
                const color = b.key === 'EE' ? 'text-emerald-700' : b.key === 'ME' ? 'text-blue-700' : b.key === 'AE' ? 'text-amber-700' : 'text-red-700';
                return <li key={label}>• {label}: <strong className={color}>{b.label}</strong></li>;
              })}
            </ul>
          </div>
          <div className="border border-slate-300 p-3 rounded-lg">
            <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Values & Character Development</h4>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              {report.core_values.map((v) => (
                <li key={v.value}>• {v.value}: <strong className="text-slate-800">{v.level_label}</strong></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-slate-800 pt-4 space-y-4 text-xs">
          <div>
            <p className="font-bold text-slate-800">Class Teacher's Remarks:</p>
            <p className="italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
              "{report.learning_area_scores.find((l) => l.learning_area === 'Integrated Science')?.remarks || 'A committed learner making steady progress.'}"
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <p className="font-bold">Head Teacher Signature: __________________</p>
              <p className="text-[10px] text-slate-500 mt-1">Date: {printDate}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Official School Stamp</p>
              <div className="inline-block border-2 border-dashed border-slate-400 w-24 h-12 mt-1 rounded text-[9px] flex items-center justify-center text-slate-400">
                [STAMP HERE]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
