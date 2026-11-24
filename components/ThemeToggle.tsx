'use client';
import { useEffect, useState } from 'react';

type Mode = 'auto' | 'light' | 'dark';
const LABEL: Record<Mode, string> = { auto: 'Thema: automatisch', light: 'Thema: licht', dark: 'Thema: donker' };
const NEXT: Record<Mode, Mode> = { auto: 'light', light: 'dark', dark: 'auto' };

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('auto');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as Mode | null;
      if (saved === 'light' || saved === 'dark') setMode(saved);
    } catch {}
  }, []);

  function cycle() {
    const next = NEXT[mode];
    setMode(next);
    apply(next);
    try {
      if (next === 'auto') localStorage.removeItem('theme');
      else localStorage.setItem('theme', next);
    } catch {}
  }

  return (
    <button className="chip" onClick={cycle} title="Wissel tussen automatisch, licht en donker">
      <span aria-hidden="true">{mode === 'dark' ? '☾' : mode === 'light' ? '☀' : '◐'}</span> {LABEL[mode]}
    </button>
  );
}
