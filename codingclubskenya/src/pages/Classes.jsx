import useApiList from '../hooks/useApiList';

const Classes = () => {
  const { data: streams, loading, refresh } = useApiList('/api/academics/streams/');

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Streams</h1>
        <button onClick={refresh} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Refresh</button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pathway</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {streams.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.grade?.name || '-'}</td>
                <td className="px-6 py-4">{s.pathway?.name || '-'}</td>
                <td className="px-6 py-4">{s.school}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Classes;
