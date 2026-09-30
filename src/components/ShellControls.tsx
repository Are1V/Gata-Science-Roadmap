import { useEffect, useState } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
  }, []);
  return (
    <button
      className="icon-button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.dataset.theme = next ? 'dark' : 'light';
        try {
          localStorage.setItem('gata.theme', next ? 'dark' : 'light');
        } catch {
          /* The theme still works for this session. */
        }
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="icon-button mobile-menu"
      aria-label={open ? 'Close navigation' : 'Open navigation'}
      aria-expanded={open}
      onClick={() => {
        setOpen(!open);
        document.body.classList.toggle('nav-open', !open);
      }}
    >
      {open ? <X size={21} /> : <Menu size={21} />}
    </button>
  );
}
export function StorageNotice() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const onNotice = (event: Event) => setMessage((event as CustomEvent<string>).detail);
    window.addEventListener('gata-notice', onNotice);
    return () => window.removeEventListener('gata-notice', onNotice);
  }, []);
  return message ? (
    <div role="alert" className="notice-toast">
      {message}
      <button
        className="icon-button"
        aria-label="Dismiss notification"
        onClick={() => setMessage('')}
      >
        <X size={16} />
      </button>
    </div>
  ) : null;
}
