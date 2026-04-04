'use client';
import { useState, useEffect } from 'react';

/** Renders a blinking text cursor. Isolated so its 530ms interval never re-renders the page. */
export function BlinkingCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return <span className="typed-cursor" style={{ opacity: on ? 1 : 0, transition: 'opacity 0.1s' }} />;
}
