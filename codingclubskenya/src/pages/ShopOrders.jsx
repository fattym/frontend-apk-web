import { useState, useEffect } from 'react';
import useApiList from '../hooks/useApiList';

const ShopOrders = () => {
  const [orderType, setOrderType] = useState('b2c');
  const { data: b2cOrders, loading: b2cLoading, refresh: refreshB2C } = useApiList('/api/shop/orders/');
  const { data: b2bOrders, loading: b2bLoading, refresh: refreshB2B } = useApiList('/api/distributor/orders/');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const orders = orderType === 'b2c' ? b2cOrders : b2bOrders;
  const loading = orderType === 'b2c' ? b2cLoading : b2bLoading;

  const handleMarkReady = async (orderId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/shop/orders/${orderId}/mark_ready/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to mark ready');
      setActionSuccess('Order marked ready');
      refreshB2C();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleMarkPickedUp = async (orderId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/shop/orders/${orderId}/mark_picked_up/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to mark picked up');
      setActionSuccess('Order marked picked up');
      refreshB2C();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdateB2BStatus = async (orderId, newStatus) => {
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/distributor/orders/${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setActionSuccess(`Order updated to ${newStatus}`);
      refreshB2B();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending_payment: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      ready_for_pickup: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop Orders</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType('b2c')}
            className={`px-4 py-2 rounded ${orderType === 'b2c' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            Parent Orders (B2C)
          </button>
          <button
            onClick={() => setOrderType('b2b')}
            className={`px-4 py-2 rounded ${orderType === 'b2b' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            Distributor Orders (B2B)
          </button>
        </div>
      </div>
      {actionError && <p className="text-red-500 mb-4">{actionError}</p>}
      {actionSuccess && <p className="text-green-500 mb-4">{actionSuccess}</p>}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {orderType === 'b2c' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distributor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={orderType === 'b2c' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : orders?.length === 0 ? (
              <tr><td colSpan={orderType === 'b2c' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">No orders yet.</td></tr>
            ) : (
              orders?.map((o) => (
                <tr key={o.id}>
                  {orderType === 'b2c' ? (
                    <>
                      <td className="px-6 py-4">#{o.id}</td>
                      <td className="px-6 py-4">{o.parent?.email || o.parent}</td>
                      <td className="px-6 py-4">{o.learner?.email || o.learner}</td>
                      <td className="px-6 py-4">KES {o.total_amount}</td>
                      <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                      <td className="px-6 py-4 font-mono">{o.pickup_code || '-'}</td>
                      <td className="px-6 py-4">
                        {o.status === 'paid' && (
                          <button onClick={() => handleMarkReady(o.id)} className="text-blue-600 hover:underline mr-3">Mark Ready</button>
                        )}
                        {o.status === 'ready_for_pickup' && (
                          <button onClick={() => handleMarkPickedUp(o.id)} className="text-green-600 hover:underline">Mark Picked Up</button>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">#{o.id}</td>
                      <td className="px-6 py-4">{o.distributor?.company_name || o.distributor}</td>
                      <td className="px-6 py-4">KES {o.total_amount}</td>
                      <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                      <td className="px-6 py-4">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {o.status === 'PENDING' && (
                          <button onClick={() => handleUpdateB2BStatus(o.id, 'CONFIRMED')} className="text-blue-600 hover:underline mr-3">Confirm</button>
                        )}
                        {o.status === 'CONFIRMED' && (
                          <button onClick={() => handleUpdateB2BStatus(o.id, 'PROCESSING')} className="text-blue-600 hover:underline mr-3">Process</button>
                        )}
                        {o.status === 'PROCESSING' && (
                          <button onClick={() => handleUpdateB2BStatus(o.id, 'SHIPPED')} className="text-blue-600 hover:underline mr-3">Ship</button>
                        )}
                        {o.status === 'SHIPPED' && (
                          <button onClick={() => handleUpdateB2BStatus(o.id, 'DELIVERED')} className="text-green-600 hover:underline">Deliver</button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopOrders;
