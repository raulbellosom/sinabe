import React, { forwardRef } from 'react';
import cn from './cn';

const Textarea = forwardRef(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      'w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export default Textarea;
