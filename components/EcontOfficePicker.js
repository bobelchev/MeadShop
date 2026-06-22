'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function EcontOfficePicker({ inputClass, onSelect }) {
  const t = useTranslations('checkout');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query || selected) return;
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/econt/offices?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query, selected]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function pick(office) {
    setSelected(office);
    setQuery(`${office.city} — ${office.name}`);
    setOpen(false);
    onSelect?.(office);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    if (selected) setSelected(null);
  }

  return (
    <div ref={containerRef} className="relative">
      {selected && (
        <>
          <input type="hidden" name="address_or_office" value={`${selected.name}, ${selected.address}`} />
          <input type="hidden" name="city" value={selected.city} />
          <input type="hidden" name="econt_office_code" value={selected.code} />
        </>
      )}

      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={t('office_search_placeholder')}
        className={inputClass}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && results.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-cream-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map(o => (
            <li
              key={o.code}
              className="px-3 py-2 cursor-pointer hover:bg-honey-50 font-body text-sm text-bark-700"
              onMouseDown={() => pick(o)}
            >
              <span className="font-medium">{o.city}</span>
              {' — '}
              {o.name}
              <div className="text-xs text-stone-400 mt-0.5">{o.address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
