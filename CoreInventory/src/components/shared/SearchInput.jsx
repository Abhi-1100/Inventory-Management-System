'use client';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function SearchInput({ value = '', onChange, placeholder = 'Search...', debounce = 300 }) {
  const [localValue, setLocalValue] = useState(value);
  const timer = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocalValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange?.(v), debounce);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="bg-bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors w-64"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
