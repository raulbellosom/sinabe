import React from 'react';
import cn from './cn';

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('animate-pulse rounded-md bg-[color:var(--surface-muted)]', className)}
    {...props}
  />
);

export default Skeleton;
