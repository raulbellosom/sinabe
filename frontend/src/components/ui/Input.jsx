import React, { forwardRef } from 'react';
import cn from './cn';

const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export default Input;
