import useApiList from '../hooks/useApiList';

const STAGES = [
  { value: 'pre_primary', label: 'Pre-Primary' },
  { value: 'primary', label: 'Primary' },
  { value: 'junior_secondary', label: 'Junior Secondary' },
  { value: 'senior_secondary', label: 'Senior Secondary' },
];

const gradeLabel = (g) =>
  STAGES.find((s) => s.value === g?.stage)?.label || g?.stage || '-';

const Classes = () => {
  const { data: streams, loading: streamsLoading, refresh, error } =
    useApiList('/api/academics/streams/');
  const { data: grades, loading: gradesLoading } =
    useApiList('/api/academics/grades/');
  const { data: pathways, loading: pathwaysLoading } =
    useApiList('/api/academics/pathways/');

  const resolveGrade = (gradeId) =>
    grades.find((g) => g.id === gradeId) || {};
  const resolveName = (list, id, fallback = '-') =>
    list.find((x) => x.id === id)?.name || fallback;

  const loading = streamsLoading || gradesLoading || pathwaysLoading;

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Streams</h1>
          <p className="text-sm text-gray-500">
            Streams are managed on the School Admin dashboard and reflected here
            consistently in real time.
          </p>
        </div>
        <button
          onClick={refresh}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4 text-sm">Failed to load streams.</p>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pathway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {streams.map((s) => {
              const g = resolveGrade(s.grade);
              return (
                <tr key={s.id}>
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">{g.name || `Grade ${s.grade}`}</td>
                  <td className="px-4 py-2">{g.id ? gradeLabel(g) : '-'}</td>
                  <td className="px-4 py-2">
                    {resolveName(pathways, s.pathway)}
                  </td>
                </tr>
              );
            })}
            {streams.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  No streams yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Classes;
