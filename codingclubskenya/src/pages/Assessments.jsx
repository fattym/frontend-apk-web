import useApiList from '../hooks/useApiList';

const LEVEL_COLORS = {
  BE: 'bg-red-100 text-red-800',
  AE: 'bg-yellow-100 text-yellow-800',
  ME: 'bg-green-100 text-green-800',
  EE: 'bg-blue-100 text-blue-800',
};

const Assessments = () => {
  const { data: assessments, loading } = useApiList('/api/assessment/assessments/');

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Competency Assessments (CBC/CBE)</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assessments.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-4">{a.learner?.email || a.learner}</td>
                <td className="px-6 py-4 max-w-xs truncate">{a.outcome?.description || a.outcome}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${LEVEL_COLORS[a.level_achieved] || 'bg-gray-100'}`}>
                    {a.level_achieved}
                  </span>
                </td>
                <td className="px-6 py-4">{a.term}</td>
                <td className="px-6 py-4 max-w-xs truncate">{a.teacher_comment}</td>
                <td className="px-6 py-4">{new Date(a.assessed_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assessments;
