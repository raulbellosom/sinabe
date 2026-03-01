import { forwardRef } from 'react';
import cn from './cn';

const Select = forwardRef(
  (
    {
      className,
      children,
      icon: _icon,
      helperText: _helperText,
      addon: _addon,
      shadow: _shadow,
      sizing: _sizing,
      color: _color,
      ...props
    },
    ref,
  ) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';

export default Select;
