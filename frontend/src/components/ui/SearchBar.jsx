import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

const SearchBar = ({
  value = '',
  onChange = () => {},
  delay = 350,
  placeholder = 'Buscar...',
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const debounced = useMemo(() => {
    let timeout;
    return (nextValue) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => onChange(nextValue), delay);
    };
  }, [delay, onChange]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);
    debounced(nextValue);
  };

  return (
    <label className={`relative block ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--foreground-muted)]"
      />
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
      />
    </label>
  );
};

export default SearchBar;
