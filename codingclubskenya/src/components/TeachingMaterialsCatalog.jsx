import { useState } from 'react';
import useApiList from '../hooks/useApiList';

const TYPE_ICON = {
  video: '🎬',
  pdf: '📄',
  quiz: '📝',
  assignment: '📚',
};

const TeachingMaterialsCatalog = () => {
  const { data: materials, loading, refresh } = useApiList('/api/courses/learning-materials/');
  const [openArea, setOpenArea] = useState(null);
  const [onlyPublished, setOnlyPublished] = useState(true);

  const list = Array.isArray(materials) ? materials : materials?.results || [];

  const grouped = list.reduce((acc, m) => {
    const area = m.learning_area_name || 'Unmapped Learning Area';
    if (!acc[area]) acc[area] = [];
    acc[area].push(m);
    return acc;
  }, {});

  const areas = Object.keys(grouped).sort();
  const visible = onlyPublished
    ? Object.fromEntries(
        Object.entries(grouped).map(([area, items]) => [
          area,
          items.filter((m) => (m.course_status || 'draft') === 'published'),
        ]),
      )
    : grouped;

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-brand-navy">Materials to Train Learners</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={onlyPublished}
              onChange={(e) => setOnlyPublished(e.target.checked)}
            />
            Published only
          </label>
          <button
            onClick={refresh}
            className="px-2 py-1 text-xs text-brand-navy/60 hover:text-brand-orange"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-brand-navy/60">Loading materials…</p>}

      {!loading && areas.length === 0 && (
        <p className="text-sm text-brand-navy/60">
          No teaching materials found for your school yet.
        </p>
      )}

      {!loading &&
        areas.map((area) => {
          const items = Object.keys(visible[area] || {}).length
            ? visible[area]
            : grouped[area];
          const isOpen = openArea === area;
          return (
            <div key={area} className="bg-white rounded-2xl shadow mb-4">
              <button
                onClick={() => setOpenArea(isOpen ? null : area)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className="font-medium text-brand-navy">{area}</span>
                <span className="text-brand-navy/50">
                  {items.length} item{items.length === 1 ? '' : 's'} {isOpen ? '▾' : '▸'}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 border-t divide-y">
                  {items.length === 0 ? (
                    <p className="py-3 text-sm text-brand-navy/50">
                      No published materials in this area.
                    </p>
                  ) : (
                    items.map((m) => (
                      <div key={m.id} className="py-3 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {TYPE_ICON[m.material_type] ?? '📄'} {m.title}
                          </span>
                          <span className="text-xs text-brand-navy/50">
                            {m.material_type_label || m.material_type} · Grade {m.grade_name || '-'}
                          </span>
                        </div>
                        <div className="text-sm text-brand-navy/70">
                          Course: {m.course_title || '-'} · Lesson: {m.lesson_title || '-'}
                          {m.lesson_strand && ` · Strand: ${m.lesson_strand}`}
                          {m.course_status && ` · Status: ${m.course_status}`}
                        </div>
                        {m.teacher_name && (
                          <div className="text-xs text-brand-navy/50">Teacher: {m.teacher_name}</div>
                        )}
                        <div className="flex gap-3 text-sm">
                          {m.file && (
                            <a
                              href={m.file}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-orange hover:underline"
                            >
                              ⬇ File
                            </a>
                          )}
                          {m.url && (
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-orange hover:underline"
                            >
                              🔗 Open link
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
    </section>
  );
};

export default TeachingMaterialsCatalog;
