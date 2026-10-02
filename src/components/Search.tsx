import { useEffect, useRef, useState } from 'react';
import { Search as SearchIcon, ArrowUpRight, X } from 'lucide-react';
import { topics, resources } from '../data/roadmap';
import { topicHref } from '../data/learning';
import projects from '../content/projects/projects.json';
import questions from '../content/interviews/questions.json';
import sheets from '../content/cheatsheets/sheets.json';
import { url } from '../utils/urls';
export const searchIndex = [
  ...topics.map((t) => ({
    title: t.title,
    type: 'Topic',
    detail: `Chapter ${String(t.phase).padStart(2, '0')}`,
    href: url(topicHref(t.id)),
  })),
  ...projects.map((p) => ({
    title: p.title,
    type: 'Project',
    detail: 'Project brief',
    href: url(`projects/#${p.id}`),
  })),
  ...resources.map((r) => ({ title: r.title, type: 'Resource', detail: r.provider, href: r.url })),
  ...questions.map((q) => ({
    title: q.question,
    type: 'Interview',
    detail: q.category,
    href: url(`interviews/#${q.id}`),
  })),
  ...sheets.map((s) => ({
    title: s.title,
    type: 'Cheat sheet',
    detail: s.principle,
    href: url(`cheatsheets/#${s.id}`),
  })),
];
export default function Search() {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      input.current?.focus();
    } else dialog.current?.close();
  }, [open]);
  const results = query.trim()
    ? searchIndex
        .filter((x) =>
          `${x.title} ${x.detail} ${x.type}`.toLowerCase().includes(query.toLowerCase().trim()),
        )
        .sort(
          (a, b) =>
            Number(b.title.toLowerCase() === query.trim().toLowerCase()) -
              Number(a.title.toLowerCase() === query.trim().toLowerCase()) ||
            a.title.length - b.title.length,
        )
        .slice(0, 30)
    : searchIndex
        .filter((x) =>
          [
            'Linear Regression',
            'Bayes theorem',
            'PCA',
            'Python foundations',
            'Matrices',
            'Gradient descent',
          ].some((t) => t.toLowerCase() === x.title.toLowerCase()),
        )
        .slice(0, 6);
  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)}>
        <SearchIcon size={16} />
        <span>Search anything...</span>
        <kbd>⌘ K</kbd>
      </button>
      <dialog
        ref={dialog}
        aria-label="Search the learning library"
        className="search-dialog"
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <div className="search-dialog-inner">
          <div className="search-input-row">
            <SearchIcon size={20} />
            <input
              ref={input}
              aria-label="Search topics, projects, and resources"
              placeholder="What would you like to learn?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="icon-button"
              aria-label="Close search"
              onClick={() => setOpen(false)}
            >
              <X size={19} />
            </button>
          </div>
          <div className="search-caption">
            {query
              ? `${results.length}${results.length === 30 ? '+' : ''} results`
              : 'A FEW PLACES TO START'}
          </div>
          <div className="search-results">
            {results.map((r, i) => (
              <a href={r.href} key={`${r.href}-${i}`} onClick={() => setOpen(false)}>
                <div>
                  <strong>{r.title}</strong>
                  <small>
                    {r.type} · {r.detail}
                  </small>
                </div>
                <ArrowUpRight size={16} />
              </a>
            ))}
            {results.length === 0 && (
              <p className="empty-state">
                No matches yet. Try “regression”, “SQL”, or “probability”.
              </p>
            )}
          </div>
          <div className="search-bottom">
            Search the complete curriculum, projects, resources, and interview questions.
            <kbd>esc to close</kbd>
          </div>
        </div>
      </dialog>
    </>
  );
}
