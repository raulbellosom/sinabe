import React from 'react';
import Badge from './Badge';

const Chip = ({ children, ...props }) => <Badge {...props}>{children}</Badge>;

export default Chip;
