import useApiList from '../hooks/useApiList';

const LearningAreas = () => {
  const { data: areas, loading } = useApiList('/api/academics/learning-areas/');

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Learning Areas</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pathway</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {areas.map((area) => (
              <tr key={area.id}>
                <td className="px-6 py-4 font-medium">{area.name}</td>
                <td className="px-6 py-4">{area.code}</td>
                <td className="px-6 py-4">{area.grade?.name || '-'}</td>
                <td className="px-6 py-4">{area.pathway?.name || '-'}</td>
                <td className="px-6 py-4">{area.school}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LearningAreas;
