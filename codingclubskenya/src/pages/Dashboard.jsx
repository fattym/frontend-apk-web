import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Welcome</h3>
          <p className="text-2xl font-bold">{user?.first_name || 'User'}</p>
          <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">School</h3>
          <p className="text-lg font-semibold">{user?.school?.name || 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Status</h3>
          <p className="text-lg font-semibold text-green-600">Active</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">API Docs</h3>
          <a href="/api/docs" className="text-blue-600 hover:underline">View Swagger</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
