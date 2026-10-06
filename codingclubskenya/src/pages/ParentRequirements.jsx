import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ParentRequirements = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learnerId, setLearnerId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/api/auth/parent-learner-links/');
        const links = res.data.results || res.data || [];
        setChildren(links);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.role === 'PARENT') {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const schoolId = user?.school;
        let url = `/api/requirements/public/?school_id=${schoolId}`;
        if (learnerId) {
          url = `/api/requirements/public/learner/${learnerId}/?school_id=${schoolId}`;
        }
        const res = await api.get(url);
        const data = res.data.results || res.data;
        setItems(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [learnerId, user?.school]);

  const filteredItems = learnerId ? items : items;

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
        <h1 className="text-3xl font-bold text-brand-navy">Required Items</h1>
        <p className="text-brand-navy/70 mt-1">Book list and items your child needs for the term</p>
      </div>

      {user?.role === 'PARENT' && (
        <div className="glass-card rounded-2xl p-4">
          <label className="block text-sm font-medium text-brand-navy/60 mb-1">Select Child</label>
          <select
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            className="w-full px-3 py-2 border border-brand-navy/10 rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange"
          >
            <option value="">All children / Show all</option>
            {children.map((link) => (
              <option key={link.id} value={link.learner?.id}>
                {link.learner?.first_name} {link.learner?.last_name} ({link.relationship})
              </option>
            ))}
          </select>
        </div>
      )}

      {(!filteredItems || filteredItems.length === 0) && (
        <div className="glass-card rounded-2xl p-6 text-center text-brand-navy/60">
          No required items published yet.
        </div>
      )}

      <div className="space-y-4">
        {(filteredItems || []).map((item) => {
          const selectedOption = getSelectedOption(item);
          return (
            <div key={item.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">{item.name}</h3>
                  <p className="text-sm text-brand-navy/60">
                    {item.class_level_name} • {item.term_name} • {item.is_mandatory ? 'Mandatory' : 'Optional'}
                  </p>
                  {item.description && (
                    <p className="text-sm text-brand-navy/70 mt-1">{item.description}</p>
                  )}
                </div>
                {selectedOption && (
                  <div className="text-right">
                    <p className="text-sm text-emerald-700">Selected</p>
                    <p className="text-lg font-bold text-brand-navy">KES {parseFloat(selectedOption.price).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {item.options && item.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.options.map((option) => {
                    const isSelected = selectedOption?.id === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleSelection(item.id, option.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-brand-orange bg-brand-orange/10'
                            : 'border-brand-navy/10 hover:border-brand-navy/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${option.source_type === 'school' ? 'bg-brand-navy/10 text-brand-navy' : 'bg-accent-teal/10 text-accent-teal-strong'}`}>
                            {option.source_type === 'school' ? '🏫 School' : '🏢 Distributor'}
                          </span>
                          {option.is_recommended && (
                            <span className="text-xs text-emerald-700">✅ Recommended</span>
                          )}
                        </div>
                        <p className="text-xl font-bold text-brand-navy mb-1">KES {parseFloat(option.price).toLocaleString()}</p>
                        {option.location && (
                          <p className="text-sm text-brand-navy/60">📍 {option.location}</p>
                        )}
                        {option.delivery_available && (
                          <p className="text-sm text-brand-navy">🚚 Delivery Available</p>
                        )}
                        {isSelected && (
                          <div className="mt-2 text-sm text-brand-orange font-medium">
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
