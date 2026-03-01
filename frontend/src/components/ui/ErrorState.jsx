import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorState = ({
  title = 'Ocurrió un error',
  description = 'No se pudo cargar la información. Inténtalo nuevamente.',
  action = null,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5 px-6 py-12 text-center">
    <AlertTriangle className="text-[color:var(--danger)]" />
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="max-w-md text-sm text-[color:var(--foreground-muted)]">{description}</p>
    {action}
  </div>
);

export default ErrorState;
