import React from 'react';
import cn from './cn';

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
