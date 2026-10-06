import { useState, useEffect } from 'react';
import api from '../services/api';

const ParentReportCards = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [reportCard, setReportCard] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/api/auth/parent-learner-links/');
        setChildren(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await api.get('/api/academics/terms/');
        setTerms(res.data.results || res.data || []);
        const current = (res.data.results || res.data || []).find(t => t.is_current);
        if (current) setSelectedTermId(current.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    const fetchReportCard = async () => {
      if (!selectedChildId) {
        setReportCard(null);
        return;
      }
      setLoading(true);
      try {
        let url = `/api/exams/report-cards/cbc/${selectedChildId}/`;
        if (selectedTermId) url += `?term_id=${selectedTermId}`;
        const res = await api.get(url);
        setReportCard(res.data);
      } catch (err) {
        console.error(err);
        setReportCard(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReportCard();
  }, [selectedChildId, selectedTermId]);

  const getLevelLabel = (level) => {
    return level || '-';
  };

  if (loading) return <div className="p-6">Loading report card...</div>;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">Report Card</h1>
        <p className="mt-3 text-sm leading-6 text-brand-navy/70">
          View your child's CBC report card combining exam grades, competency assessments, and homework.
        </p>
      </section>

      <div className="glass-card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy/60 mb-1">Select Child</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange"
            >
              <option value="">Choose a child</option>
              {children.map((link) => (
                <option key={link.id} value={link.learner?.id}>
                  {link.learner?.first_name} {link.learner?.last_name}
                </option>
              ))}
            </select>
          </div>
          {selectedChildId && (
            <div>
              <label className="block text-sm font-medium text-brand-navy/60 mb-1">Select Term</label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange"
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.academic_year})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {!selectedChildId && (
        <p className="text-center text-brand-navy/60 py-8">Select a child to view their report card.</p>
      )}

      {selectedChildId && !reportCard && (
        <p className="text-center text-brand-navy/60 py-8">No report card data available for the selected term.</p>
      )}

      {reportCard && (
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-brand-navy/10">
            <h2 className="text-2xl font-bold text-brand-navy">
              {reportCard.student?.first_name} {reportCard.student?.last_name}
            </h2>
            <p className="text-sm text-brand-navy/60">
              {reportCard.stream} • {reportCard.grade} • {reportCard.term} ({reportCard.academic_year})
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60 mb-3">Overall Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-brand-navy/60">Total Marks</p>
                <p className="text-2xl font-bold text-brand-navy">{reportCard.overall?.total_marks || 0}</p>
              </div>
              <div>
                <p className="text-xs text-brand-navy/60">Obtained Marks</p>
                <p className="text-2xl font-bold text-brand-navy">{reportCard.overall?.obtained_marks || 0}</p>
              </div>
              <div>
                <p className="text-xs text-brand-navy/60">Percentage</p>
                <p className="text-2xl font-bold text-brand-orange">{reportCard.overall?.percentage || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-brand-navy/60">Grade</p>
                <p className="text-2xl font-bold text-brand-navy">{reportCard.overall?.grade}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60 mb-3">Learning Areas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-brand-grayLight/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Learning Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Competency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-navy/60 uppercase">Exams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-navy/10">
                  {reportCard.learning_areas?.map((la) => (
                    <tr key={la.id}>
                      <td className="px-6 py-4 text-sm text-brand-navy/80">{la.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-brand-navy/40">{la.code || '-'}</td>
                      <td className="px-6 py-4 text-sm text-brand-navy/80">{getLevelLabel(la.competency_level)}</td>
                      <td className="px-6 py-4 text-sm text-brand-navy/80">
                        {la.exams && la.exams.length > 0
                          ? `${la.exams.reduce((sum, e) => sum + (e.marks_obtained || 0), 0)}/${la.exams.reduce((sum, e) => sum + (e.total_marks || 0), 0)}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {reportCard.portfolio?.strengths && (
            <div className="mt-6 pt-4 border-t border-brand-navy/10">
              <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60 mb-2">Strengths</h3>
              <p className="text-sm text-brand-navy/80">{reportCard.portfolio.strengths}</p>
            </div>
          )}

          {reportCard.portfolio?.areas_for_growth && (
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-[0.22em] text-brand-navy/60 mb-2">Areas for Growth</h3>
              <p className="text-sm text-brand-navy/80">{reportCard.portfolio.areas_for_growth}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentReportCards;
