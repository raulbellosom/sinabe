import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({
  title = 'No hay resultados',
  description = 'Ajusta los filtros e inténtalo de nuevo.',
  action = null,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-12 text-center">
    <SearchX className="text-[color:var(--foreground-muted)]" />
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="max-w-md text-sm text-[color:var(--foreground-muted)]">{description}</p>
    {action}
  </div>
);

export default EmptyState;
