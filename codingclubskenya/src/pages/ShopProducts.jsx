import { useState, useEffect, useMemo } from 'react';
import useApiList from '../hooks/useApiList';

const ShopProducts = () => {
  const { data: distributorProducts, loading: dpLoading, refresh: refreshProducts } = useApiList('/api/distributor/products/');
  const { data: schoolProducts, loading: spLoading } = useApiList('/api/shop/products/');
  const { data: categories, loading: catLoading } = useApiList('/api/shop/categories/');
  const [view, setView] = useState('marketplace');
  const [distributorFilter, setDistributorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const distributors = useMemo(() => {
    if (!distributorProducts) return [];
    const map = new Map();
    distributorProducts.forEach((p) => {
      if (p.distributor && p.distributor_name) {
        map.set(p.distributor, { id: p.distributor, name: p.distributor_name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [distributorProducts]);

  const filteredProducts = useMemo(() => {
    if (!distributorProducts) return [];
    return distributorProducts.filter((p) => {
      if (!p.is_active) return false;
      if (distributorFilter && String(p.distributor) !== String(distributorFilter)) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [distributorProducts, distributorFilter, categoryFilter, search]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + product.min_order_quantity, product.available_stock) }
            : item
        );
      }
      return [...prev, { id: product.id, name: product.name, unit_price: product.unit_price, quantity: product.min_order_quantity, min_order_quantity: product.min_order_quantity, available_stock: product.available_stock, distributor: product.distributor, distributor_name: product.distributor_name, image: product.image }];
    });
  };

  const updateCartQuantity = (id, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(item.min_order_quantity, quantity) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        distributor: cart[0]?.distributor,
        items: cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        notes: orderNotes,
      };
      const res = await fetch('/api/distributor/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to place order');
      }
      setMessage('Order placed successfully!');
      setCart([]);
      setShowCheckout(false);
      setOrderNotes('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('marketplace')}
            className={`px-4 py-2 rounded ${view === 'marketplace' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setView('my-store')}
            className={`px-4 py-2 rounded ${view === 'my-store' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
          >
            My Store
          </button>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCheckout(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Cart ({cart.length})
            </button>
          )}
        </div>
      </div>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      {view === 'marketplace' && (
        <div className="space-y-6">
          <div className="bg-white rounded shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distributor</label>
                <select
                  value={distributorFilter}
                  onChange={(e) => setDistributorFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Distributors</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <p className="text-sm text-gray-500">{filteredProducts.length} products</p>
              </div>
            </div>
          </div>

          {dpLoading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-4xl">📦</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-blue-600 font-medium mb-1">{product.distributor_name}</p>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                    <div className="mt-auto">
                      <p className="text-lg font-bold text-gray-900">KES {parseFloat(product.unit_price).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Min order: {product.min_order_quantity}</p>
                      <p className="text-xs text-gray-500">Stock: {product.available_stock}</p>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.available_stock <= 0}
                        className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {product.available_stock > 0 ? 'Add to Order' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">No products found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'my-store' && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(schoolProducts || []).map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">{p.category?.name || '-'}</td>
                  <td className="px-6 py-4">KES {p.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {(schoolProducts || []).length === 0 && !spLoading && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleCheckout} className="bg-white p-6 rounded shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bulk Order</h2>
            {message && <p className="text-red-500 mb-3">{message}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="Delivery instructions, PO number, etc."
              />
            </div>
            <div className="mb-4 max-h-64 overflow-y-auto border rounded">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={item.min_order_quantity}
                          max={item.available_stock}
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10) || item.min_order_quantity)}
                          className="w-20 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-2">KES {parseFloat(item.unit_price).toLocaleString()}</td>
                      <td className="px-4 py-2">KES {(item.unit_price * item.quantity).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <button type="button" onClick={() => removeFromCart(item.id)} className="text-red-600 hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-bold">Total: KES {cartTotal.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Distributor: {cart[0]?.distributor_name}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowCheckout(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={submitting || cart.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShopProducts;
