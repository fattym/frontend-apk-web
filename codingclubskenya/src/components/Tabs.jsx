const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium ${
          active === t.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default Tabs;
