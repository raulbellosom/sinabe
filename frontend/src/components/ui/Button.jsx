import React, { forwardRef } from 'react';
import cn from './cn';

const variantClass = {
  primary:
    'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90',
  secondary:
    'bg-[color:var(--surface-muted)] text-[color:var(--foreground)] hover:bg-[color:var(--surface)]',
  danger: 'bg-[color:var(--danger)] text-white hover:opacity-90',
  ghost: 'bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]',
};

const Button = forwardRef(
  (
    {
      as: Component = 'button',
      className,
      variant = 'primary',
      type = 'button',
      disabled = false,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        type={Component === 'button' ? type : undefined}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] disabled:cursor-not-allowed disabled:opacity-60',
          variantClass[variant] || variantClass.primary,
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export default Button;
