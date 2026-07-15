import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ParentRequirements = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learnerId, setLearnerId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const url = learnerId 
          ? `/api/requirements/public/learner/${learnerId}/`
          : '/api/requirements/public/';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setItems(data.results || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [learnerId]);

  const filteredItems = learnerId ? items?.filter((item) => 
    item.class_level?.id && item.class_level.enrollments?.some((e) => e.student?.id === parseInt(learnerId, 10) && e.is_active)
  ) : items;

  const toggleSelection = (itemId, optionId) => {
    setSelectedItems((prev) => {
      const existing = prev.find((s) => s.itemId === itemId);
      if (existing) {
        if (existing.optionId === optionId) {
          return prev.filter((s) => s.itemId !== itemId);
        }
        return prev.map((s) => (s.itemId === itemId ? { ...s, optionId } : s));
      }
      return [...prev, { itemId, optionId }];
    });
  };

  const getSelectedOption = (item) => {
    const selection = selectedItems.find((s) => s.itemId === item.id);
    if (!selection) return null;
    return item.options.find((o) => o.id === selection.optionId) || null;
  };

  if (loading) {
    return <div className="text-lg">Loading required items...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Required Items</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Items your child needs for the term</p>
      </div>

      {user?.role === 'PARENT' && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select Child</label>
          <select
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="">All children / Show all</option>
            {/* In a real app, populate with parent's linked learners */}
          </select>
        </div>
      )}

      {(!filteredItems || filteredItems.length === 0) && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 text-center text-zinc-500">
          No required items published yet.
        </div>
      )}

      <div className="space-y-4">
        {(filteredItems || []).map((item) => {
          const selectedOption = getSelectedOption(item);
          return (
            <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {item.class_level?.name} • {item.term?.name} • {item.is_mandatory ? 'Mandatory' : 'Optional'}
                  </p>
                  {item.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{item.description}</p>
                  )}
                </div>
                {selectedOption && (
                  <div className="text-right">
                    <p className="text-sm text-green-600 dark:text-green-400">Selected</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">KES {parseFloat(selectedOption.price).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {item.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.options.map((option) => {
                    const isSelected = selectedOption?.id === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleSelection(item.id, option.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${option.source_type === 'school' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                            {option.source_type === 'school' ? '🏫 School' : '🏢 Distributor'}
                          </span>
                          {option.is_recommended && (
                            <span className="text-xs text-green-600 dark:text-green-400">✅ Recommended</span>
                          )}
                        </div>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">KES {parseFloat(option.price).toLocaleString()}</p>
                        {option.location && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">📍 {option.location}</p>
                        )}
                        {option.delivery_available && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">🚚 Delivery Available</p>
                        )}
                        {isSelected && (
                          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentRequirements;
