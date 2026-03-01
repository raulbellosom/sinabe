import React from 'react';
import cn from './cn';

const colorClass = {
  primary: 'bg-[color:var(--primary)]/15 text-[color:var(--primary)]',
  success: 'bg-[color:var(--success)]/15 text-[color:var(--success)]',
  warning: 'bg-[color:var(--warning)]/15 text-[color:var(--warning)]',
  danger: 'bg-[color:var(--danger)]/15 text-[color:var(--danger)]',
  gray: 'bg-[color:var(--surface-muted)] text-[color:var(--foreground-muted)]',
};

const Badge = ({ className, color = 'gray', children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
      colorClass[color] || colorClass.gray,
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
