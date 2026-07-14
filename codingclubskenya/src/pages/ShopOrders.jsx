import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';

const ShopOrders = () => {
  const { data: orders, loading, refresh } = useApiList('/api/shop/orders/');
  const [actionError, setActionError] = useState('');

  const handleMarkReady = async (orderId) => {
    setActionError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/shop/orders/${orderId}/mark_ready/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to mark ready');
      refresh();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleMarkPickedUp = async (orderId) => {
    setActionError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/shop/orders/${orderId}/mark_picked_up/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to mark picked up');
      refresh();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop Orders</h1>
      </div>
      {actionError && <p className="text-red-500 mb-4">{actionError}</p>}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-4">#{o.id}</td>
                <td className="px-6 py-4">{o.parent?.email || o.parent}</td>
                <td className="px-6 py-4">{o.learner?.email || o.learner}</td>
                <td className="px-6 py-4">KES {o.total_amount}</td>
                <td className="px-6 py-4 capitalize">{o.status?.replace('_', ' ')}</td>
                <td className="px-6 py-4 font-mono">{o.pickup_code || '-'}</td>
                <td className="px-6 py-4">
                  {o.status === 'paid' && (
                    <button onClick={() => handleMarkReady(o.id)} className="text-blue-600 hover:underline mr-3">Mark Ready</button>
                  )}
                  {o.status === 'ready_for_pickup' && (
                    <button onClick={() => handleMarkPickedUp(o.id)} className="text-green-600 hover:underline">Mark Picked Up</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopOrders;
