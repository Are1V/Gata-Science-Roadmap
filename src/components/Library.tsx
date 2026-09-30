import { useEffect, useState } from 'react';
import { Search, ArrowUpRight, BookOpen, ChevronDown, FolderKanban } from 'lucide-react';
import projects from '../content/projects/projects.json';
import questions from '../content/interviews/questions.json';
import sheets from '../content/cheatsheets/sheets.json';
import { phases, resources } from '../data/roadmap';
import { CompleteButton } from './Progress';
import { url } from '../utils/urls';
export default function Library({
  type,
}: {
  type: 'projects' | 'resources' | 'interviews' | 'cheatsheets';
}) {
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All'),
    [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      setOpen(id);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 100);
    }
  }, []);
  const filters =
    type === 'projects'
      ? ['All', 'beginner', 'intermediate', 'advanced']
      : type === 'resources'
        ? ['All', 'Documentation', 'Course', 'Book', 'Paper']
        : type === 'interviews'
          ? ['All', ...new Set(questions.map((q) => q.category))]
          : [];
  const match = (text: string) => text.toLowerCase().includes(query.toLowerCase());
  const items =
    type === 'projects'
      ? projects.filter(
          (p) =>
            match(`${p.title} ${p.problem} ${p.objectives.join(' ')}`) &&
            (filter === 'All' || p.level === filter),
        )
      : type === 'resources'
        ? resources.filter(
            (r) => match(`${r.title} ${r.provider}`) && (filter === 'All' || r.type === filter),
          )
        : type === 'interviews'
          ? questions.filter(
              (q) =>
                match(`${q.question} ${q.answer} ${q.category}`) &&
                (filter === 'All' || q.category === filter),
            )
          : sheets.filter((s) => match(`${s.title} ${s.principle} ${s.code}`));
  return (
    <>
      <div className="filter-bar">
        <div className="filter-input">
          <Search size={16} />
          <input
            aria-label={`Search ${type}`}
            placeholder={`Find ${type === 'interviews' ? 'a question' : type === 'cheatsheets' ? 'a cheat sheet' : `a ${type.slice(0, -1)}`}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {filters.length > 0 && (
          <select
            className="filter-select"
            aria-label={`Filter ${type}`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {filters.map((f) => (
              <option key={f} value={f}>
                {f === 'All'
                  ? 'All ' +
                    (type === 'projects'
                      ? 'levels'
                      : type === 'interviews'
                        ? 'categories'
                        : 'formats')
                  : f[0].toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        )}
        <span className="results-count">
          {items.length}{' '}
          {type === 'interviews' ? 'questions' : type === 'cheatsheets' ? 'sheets' : type}
        </span>
      </div>
      {items.length === 0 && (
        <div className="empty-state">No matches. Try a broader search or another filter.</div>
      )}
      {type === 'projects' && (
        <div className="project-grid">
          {(items as typeof projects).map((p, i) => (
            <article
              key={p.id}
              id={p.id}
              className={`project-card ${open === p.id ? 'expanded' : ''}`}
            >
              <div className="project-art" data-variant={i % 4}>
                <span className="project-art-grid" />
                <FolderKanban size={46} strokeWidth={0.8} />
                <span className="project-art-label">
                  FIELDWORK /{' '}
                  {String(projects.findIndex((x) => x.id === p.id) + 1).padStart(2, '0')}
                </span>
                <span className={`tag level-${p.level}`}>{p.level}</span>
              </div>
              <div className="project-content">
                <h2>{p.title}</h2>
                <p>{p.problem}</p>
                <div className="project-objectives">
                  {p.objectives.map((o) => (
                    <span key={o}>{o}</span>
                  ))}
                </div>
                <button
                  className="project-expand"
                  aria-expanded={open === p.id}
                  onClick={() => setOpen(open === p.id ? null : p.id)}
                >
                  {open === p.id ? 'Close project brief' : 'Explore project brief'}
                  <ChevronDown size={15} />
                </button>
                {open === p.id && (
                  <div className="project-details">
                    <h3>Dataset</h3>
                    <a className="text-link" href={p.datasetUrl} target="_blank" rel="noreferrer">
                      {p.dataset}
                      <ArrowUpRight size={13} />
                    </a>
                    <h3>Prerequisites</h3>
                    <div className="dependency-links">
                      {p.prerequisites.map((n) => (
                        <a key={n} href={url(`learn/${phases[n].id}/`)}>
                          {phases[n].title}
                        </a>
                      ))}
                    </div>
                    <h3>Expected output</h3>
                    <p>{p.output}</p>
                    <h3>How to evaluate your work</h3>
                    <p>{p.evaluation}</p>
                    <h3>Suggested repository structure</h3>
                    <pre>{p.structure}</pre>
                    <p className="project-hint">
                      Start with a baseline and keep an experiment log. The implementation is yours
                      to discover.
                    </p>
                    <CompleteButton id={`project-${p.id}`} label="Mark project complete" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {type === 'resources' && (
        <div className="resource-grid">
          {(items as typeof resources).map((r) => (
            <a className="resource-card" href={r.url} key={r.id} target="_blank" rel="noreferrer">
              <div className="card-top">
                <span className="card-icon green">
                  <BookOpen size={20} />
                </span>
                <span className="tag">{r.type}</span>
              </div>
              <h2>{r.title}</h2>
              <p>{r.provider}</p>
              <span className="text-link">
                Open free resource <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
        </div>
      )}
      {type === 'interviews' && (
        <div className="interview-list">
          {(items as typeof questions).map((q) => (
            <details
              id={q.id}
              key={q.id}
              open={open === q.id}
              onToggle={(e) => {
                if (e.currentTarget.open) setOpen(q.id);
              }}
            >
              <summary>
                <span className="tag">{q.category}</span>
                <strong>{q.question}</strong>
                <ChevronDown size={17} />
              </summary>
              <div className="interview-answer">
                <span className="eyebrow">A WAY TO THINK ABOUT IT</span>
                <p>{q.answer}</p>
                <small>Practice explaining this aloud, then give an example of your own.</small>
              </div>
            </details>
          ))}
        </div>
      )}
      {type === 'cheatsheets' && (
        <div className="cheatsheet-grid">
          {(items as typeof sheets).map((s) => (
            <article id={s.id} className="cheatsheet" key={s.id}>
              <div className="card-top">
                <BookOpen size={20} />
                <span className="tag">Quick reference</span>
              </div>
              <h2>{s.title}</h2>
              <p className="cheat-principle">{s.principle}</p>
              <pre>
                <code>{s.code}</code>
              </pre>
              <ul>
                {s.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
