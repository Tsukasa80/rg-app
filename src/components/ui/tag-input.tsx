'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({ value, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = suggestions.filter((tag) => tag.includes(input) && !value.includes(tag)).slice(0, 6);

  function addTag(tag: string) {
    if (!tag.trim()) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
    setInput('');
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((current) => current !== tag));
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-200">
            {tag}
            <button type="button" className="text-green-200/70" onClick={() => removeTag(tag)} aria-label={`${tag}を削除`}>
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          value={input}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setInput(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag(input.trim());
            }
            if (event.key === 'Backspace' && !input) {
              removeTag(value[value.length - 1]);
            }
          }}
        />
      </div>
      {open && filtered.length ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/80 shadow-xl">
          {filtered.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="block w-full px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-800"
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
