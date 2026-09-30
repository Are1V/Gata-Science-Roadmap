import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  LayoutList,
  Network,
  Search,
  X,
  BookOpen,
  GitBranch,
} from 'lucide-react';
import { phases, specializations, deepGuides, type Phase } from '../data/roadmap';
import { useProgress } from '../hooks/useProgress';
import { CompleteButton } from './Progress';
import { url } from '../utils/urls';
type PhaseData = { phase: Phase; completed: number; expand: () => void; expanded: boolean };
const stages = [
  { name: 'Start here', range: [0, 3], description: 'Learn how to code and work on a project.' },
  { name: 'Math & statistics', range: [4, 7], description: 'Build the math behind data science.' },
  { name: 'Work with data', range: [8, 11], description: 'Load, query, clean, and explore data.' },
  {
    name: 'Machine learning',
    range: [12, 17],
    description: 'Train models and check whether they work.',
  },
  { name: 'Go deeper', range: [18, 23], description: 'Improve models and explore new methods.' },
  {
    name: 'Applied fields',
    range: [24, 29],
    description: 'Apply models to text, images, products, and experiments.',
  },
  { name: 'Ship responsibly', range: [30, 34], description: 'Put data science into practice.' },
] as const;
function PhaseNode({ data }: { data: PhaseData }) {
  return (
    <div className={`flow-phase ${data.completed === data.phase.topics.length ? 'done' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="flow-phase-top">
        <span>PHASE {String(data.phase.number).padStart(2, '0')}</span>
        <span>
          {data.completed}/{data.phase.topics.length}
        </span>
      </div>
      <strong>{data.phase.title}</strong>
      <small>{data.phase.subtitle}</small>
      <div className="flow-phase-footer">
        <span className={`level-dot ${data.phase.level}`} />
        {data.phase.level}
        <button
          className="nodrag"
          aria-label={`${data.expanded ? 'Collapse' : 'Expand'} ${data.phase.title}`}
          onClick={(e) => {
            e.stopPropagation();
            data.expand();
          }}
        >
          {data.expanded ? 'Collapse' : 'Explore'}
          <ChevronDown size={12} />
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { phase: PhaseNode };
export default function Roadmap() {
  const { completed } = useProgress();
  const [level, setLevel] = useState('all'),
    [path, setPath] = useState('all'),
    [query, setQuery] = useState(''),
    [view, setView] = useState('map'),
    [stage, setStage] = useState(0),
    [expanded, setExpanded] = useState<number[]>([]),
    [selected, setSelected] = useState<{ phase: Phase; topicId?: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('path');
    if (p && specializations.some((s) => s.id === p)) setPath(p);
  }, []);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const filtered = phases.filter(
    (p) =>
      (level === 'all' || p.level === level) &&
      (path === 'all' ||
        p.number < 4 ||
        specializations.find((s) => s.id === path)?.phases.includes(p.number)) &&
      (!query ||
        `${p.title} ${p.topics.map((t) => t.title).join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const stagePhases = filtered.filter(
    (p) => p.number >= stages[stage].range[0] && p.number <= stages[stage].range[1],
  );
  useEffect(() => {
    if (!filtered.length || stagePhases.length) return;
    const first = stages.findIndex((s) =>
      filtered.some((p) => p.number >= s.range[0] && p.number <= s.range[1]),
    );
    if (first >= 0) setStage(first);
  }, [level, path, query]);
  const toggle = (number: number) => setExpanded((old) => (old.includes(number) ? [] : [number]));
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    stagePhases.forEach((p, i) => {
      const isExpanded = expanded.includes(p.number);
      nodes.push({
        id: p.id,
        type: 'phase',
        position: { x: 35 + (i % 2) * 330, y: 35 + Math.floor(i / 2) * 180 },
        data: {
          phase: p,
          completed: p.topics.filter((t) => completed.includes(t.id)).length,
          expand: () => toggle(p.number),
          expanded: isExpanded,
        },
      });
      p.prerequisites.forEach((n) => {
        const pre = phases[n];
        if (stagePhases.some((f) => f.number === n))
          edges.push({
            id: `${pre.id}-${p.id}`,
            source: pre.id,
            target: p.id,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)', opacity: 0.45 },
            label: n < p.number - 1 ? 'prerequisite' : undefined,
            labelStyle: { fontSize: 9, fill: 'var(--muted)' },
            labelBgStyle: { fill: 'var(--bg)' },
          });
      });
    });
    return { nodes, edges };
  }, [stagePhases.map((p) => p.id).join(','), expanded.join(','), completed.join(',')]);
  const nextPhase =
    filtered.find(
      (p) =>
        p.topics.some((t) => !completed.includes(t.id)) &&
        p.prerequisites.every((n) => phases[n].topics.every((t) => completed.includes(t.id))),
    ) || filtered.find((p) => p.topics.some((t) => !completed.includes(t.id)));
  const nextTopic = nextPhase?.topics.find((t) => !completed.includes(t.id));
  const selectedTopic = selected?.phase.topics.find((t) => t.id === selected.topicId);
  const guide = selectedTopic ? deepGuides[selectedTopic.id] : undefined;
  return (
    <>
      <div className="roadmap-next">
        <div>
          <span className="eyebrow">NEXT TOPIC</span>
          {nextPhase && nextTopic ? (
            <a href={url(`learn/${nextPhase.id}/#${nextTopic.id}`)}>
              {nextTopic.title}
              <ArrowRight size={14} />
            </a>
          ) : (
            <strong>You've explored every topic in this view.</strong>
          )}
        </div>
        <a className="text-link" href="#connections">
          See the math connections <GitBranch size={14} />
        </a>
      </div>
      <nav className="stage-nav" aria-label="Roadmap sections">
        {stages.map((s, i) => (
          <button
            key={s.name}
            className={stage === i ? 'selected' : ''}
            aria-current={stage === i ? 'step' : undefined}
            onClick={() => setStage(i)}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            {s.name}
          </button>
        ))}
      </nav>
      <div className="stage-intro">
        <div>
          <strong>{stages[stage].name}</strong>
          <p>{stages[stage].description}</p>
        </div>
        <span>{stagePhases.length} chapters in this section</span>
      </div>
      <div className="roadmap-toolbar">
        <div className="filter-input">
          <Search size={16} />
          <input
            aria-label="Filter roadmap"
            placeholder="Find a concept or phase..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          aria-label="Filter by level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="all">All levels</option>
          {['beginner', 'intermediate', 'advanced'].map((l) => (
            <option key={l} value={l}>
              {l[0].toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          aria-label="Filter by specialization"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        >
          <option value="all">All learning paths</option>
          {specializations.map((s) => (
            <option value={s.id} key={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <div className="pill-tabs">
          <button
            className={view === 'map' ? 'selected' : ''}
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
          >
            <Network size={15} /> Map
          </button>
          <button
            className={view === 'list' ? 'selected' : ''}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <LayoutList size={15} /> List
          </button>
        </div>
      </div>
      <div className="roadmap-legend">
        <span>
          <i className="kind-dot core" />
          Core
        </span>
        <span>
          <i className="kind-dot recommended" />
          Recommended
        </span>
        <span>
          <i className="kind-dot optional" />
          Optional
        </span>
        <span>
          <i className="kind-dot advanced" />
          Advanced
        </span>
        <span className="legend-note">
          {view === 'map' ? `${stagePhases.length} shown in this section · ` : ''}
          {filtered.length} matching chapters
        </span>
      </div>
      {view === 'map' &&
        stagePhases
          .filter((p) => expanded.includes(p.number))
          .map((p) => (
            <section className="stage-topics" key={p.id}>
              <div className="stage-topics-heading">
                <div>
                  <span>CHAPTER {String(p.number).padStart(2, '0')}</span>
                  <h3>{p.title}: topics</h3>
                </div>
                <a className="text-link" href={url(`learn/${p.id}/`)}>
                  Read chapter <ArrowRight size={14} />
                </a>
              </div>
              <p>{p.description}</p>
              <div className="stage-topic-grid">
                {p.topics.map((t) => (
                  <div key={t.id}>
                    <button onClick={() => setSelected({ phase: p, topicId: t.id })}>
                      <span className={`kind-dot ${t.kind}`} />
                      {t.title}
                      {deepGuides[t.id] && <BookOpen size={13} />}
                    </button>
                    <CompleteButton id={t.id} />
                  </div>
                ))}
              </div>
            </section>
          ))}
      {(view === 'map' ? stagePhases : filtered).length === 0 ? (
        <div className="empty-state">
          No phases match these filters. Try another concept or learning path.
          <br />
          <button
            className="text-button"
            onClick={() => {
              setQuery('');
              setLevel('all');
              setPath('all');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : view === 'map' ? (
        <div className="roadmap-canvas" role="region" aria-label="Interactive data science roadmap">
          <ReactFlow
            key={`${stage}-${level}-${path}-${query}`}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.16, minZoom: 0.6, maxZoom: 1 }}
            minZoom={0.08}
            maxZoom={1.8}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_e, node) => {
              const p = phases.find((p) => p.id === node.id);
              if (p) setSelected({ phase: p });
            }}
          >
            <Background color="var(--line)" gap={20} />
            <Controls showInteractive={false} />
            <div className="canvas-caption">Select a chapter for details or expand its topics.</div>
          </ReactFlow>
        </div>
      ) : (
        <div className="roadmap-list">
          {filtered.map((p) => (
            <section key={p.id} className="roadmap-list-phase">
              <button
                className="phase-list-heading"
                aria-expanded={expanded.includes(p.number)}
                onClick={() => toggle(p.number)}
              >
                <span className="phase-number">{String(p.number).padStart(2, '0')}</span>
                <div>
                  <h3>{p.title}</h3>
                  <span>
                    {p.topics.filter((t) => completed.includes(t.id)).length} / {p.topics.length}{' '}
                    complete · {p.level}
                  </span>
                </div>
                <ChevronDown className={expanded.includes(p.number) ? 'rotated' : ''} size={18} />
              </button>
              {expanded.includes(p.number) && (
                <div className="list-topics">
                  <p>{p.description}</p>
                  <a className="text-link" href={url(`learn/${p.id}/`)}>
                    Read the chapter <ArrowRight size={14} />
                  </a>
                  <div className="topic-checklist">
                    {p.topics
                      .filter(
                        (t) =>
                          !query ||
                          p.title.toLowerCase().includes(query.toLowerCase()) ||
                          t.title.toLowerCase().includes(query.toLowerCase()),
                      )
                      .map((t) => (
                        <div key={t.id}>
                          <button onClick={() => setSelected({ phase: p, topicId: t.id })}>
                            <span className={`kind-dot ${t.kind}`} />
                            {t.title}
                            {deepGuides[t.id] && <BookOpen size={12} />}
                          </button>
                          <CompleteButton id={t.id} />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
      <p className="map-help">
        Select a section above, explore a chapter, or switch to the full list. Progress stays in
        your browser.
      </p>
      <dialog
        aria-label="Topic details"
        ref={dialog}
        className="topic-dialog"
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setSelected(null);
        }}
      >
        {selected && (
          <div className="topic-dialog-content">
            <div className="section-heading">
              <span className="eyebrow">
                PHASE {String(selected.phase.number).padStart(2, '0')} · {selected.phase.level}
              </span>
              <button
                className="icon-button"
                aria-label="Close topic"
                onClick={() => setSelected(null)}
              >
                <X size={21} />
              </button>
            </div>
            <h2>{selectedTopic?.title || selected.phase.title}</h2>
            <p className="topic-dialog-subtitle">
              {selectedTopic ? `A concept in ${selected.phase.title}` : selected.phase.subtitle}
            </p>
            <p>{selected.phase.description}</p>
            <div className="callout">
              <strong>Build the intuition</strong>
              <p>{selected.phase.intuition}</p>
            </div>
            <h3>Start with these foundations</h3>
            <div className="dependency-links">
              {selected.phase.prerequisites.length ? (
                selected.phase.prerequisites.map((n) => (
                  <a key={n} href={url(`learn/${phases[n].id}/`)}>
                    <GitBranch size={13} />
                    {phases[n].title}
                    <ArrowUpRight size={12} />
                  </a>
                ))
              ) : (
                <span>No prerequisites. Bring your curiosity.</span>
              )}
            </div>
            <h3>Put it into practice</h3>
            <p>{selected.phase.exercise}</p>
            <div className="inline-actions">
              {guide ? (
                <a className="button" href={url(`topics/${guide}/?concept=${selectedTopic!.id}`)}>
                  Read the detailed guide <ArrowRight size={14} />
                </a>
              ) : (
                <a
                  className="button"
                  href={url(
                    `learn/${selected.phase.id}/${selectedTopic ? '#' + selectedTopic.id : ''}`,
                  )}
                >
                  Explore the chapter <ArrowRight size={14} />
                </a>
              )}
              {selectedTopic ? (
                <CompleteButton id={selectedTopic.id} />
              ) : (
                <button
                  className="button secondary"
                  onClick={() => {
                    toggle(selected.phase.number);
                    setSelected(null);
                  }}
                >
                  {expanded.includes(selected.phase.number) ? 'Collapse' : 'Expand'}{' '}
                  {selected.phase.topics.length} topics
                </button>
              )}
            </div>
            {selectedTopic && !guide && (
              <small className="curriculum-note">
                Curriculum entry · Learn this concept through the chapter and its curated resources.
              </small>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
