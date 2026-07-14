import { useState } from 'react';
import useApiList from '../hooks/useApiList';
import UserForm from '../components/UserForm';

const Parents = () => {
  const { data: users, loading, refresh } = useApiList('/api/auth/users/?role=PARENT');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleSaved = () => {
    refresh();
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parents</h1>
        <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Parent</button>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 font-medium">{u.first_name} {u.last_name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.phone || '-'}</td>
                <td className="px-6 py-4">{u.school?.name || '-'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => { setEditingUser(u); setShowForm(true); }} className="text-blue-600 hover:underline mr-3">Edit</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No parents found. Add your first parent.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && <UserForm user={editingUser} onClose={() => { setShowForm(false); setEditingUser(null); }} onSaved={handleSaved} />}
    </div>
  );
};

export default Parents;
