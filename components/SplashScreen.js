'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('splash_shown')) {
      sessionStorage.setItem('splash_shown', '1');
      setVisible(true);
      const t1 = setTimeout(() => setFading(true), 1800);
      const t2 = setTimeout(() => setVisible(false), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-50"
      style={{ transition: 'opacity 0.6s ease', opacity: fading ? 0 : 1 }}
    >
      <p className="font-body text-sm uppercase tracking-widest text-stone-400 mb-2">Built with</p>
      <p className="font-display text-4xl font-bold text-bark-800">Claude Code</p>
    </div>
  );
}
