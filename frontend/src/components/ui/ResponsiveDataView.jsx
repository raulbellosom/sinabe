import React from 'react';
import cn from './cn';

const ResponsiveDataView = ({
  items = [],
  view = 'auto',
  columns = [],
  renderCard,
  className = '',
  emptyState = null,
}) => {
  const resolvedView = view === 'auto' ? 'table md:table lg:table' : view;

  if (!items.length) {
    return emptyState;
  }

  if (view === 'cards') {
    return (
      <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>
        {items.map((item, index) => (
          <div key={item.id || index}>{renderCard(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={cn('hidden overflow-x-auto rounded-2xl border border-[color:var(--border)] md:block', className)}>
        <table className="min-w-full text-sm">
          <thead className="bg-[color:var(--surface-muted)] text-left">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-2 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className="border-t border-[color:var(--border)]">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2">
                    {column.render ? column.render(item, index) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item, index) => (
          <div key={item.id || index}>{renderCard(item, index)}</div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveDataView;
