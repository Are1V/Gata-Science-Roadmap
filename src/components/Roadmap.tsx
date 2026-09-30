import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
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
  Check,
} from 'lucide-react';
import { phases, specializations, deepGuides, type Phase } from '../data/roadmap';
import { useProgress } from '../hooks/useProgress';
import { CompleteButton } from './Progress';
import { url } from '../utils/urls';
type PhaseData = { phase: Phase; completed: number; expand: () => void; expanded: boolean };
const stages = [
  { name: 'Start here', range: [0, 3] },
  { name: 'Math & statistics', range: [4, 7] },
  { name: 'Work with data', range: [8, 11] },
  {
    name: 'Machine learning',
    range: [12, 17],
  },
  { name: 'Go deeper', range: [18, 23] },
  {
    name: 'Applied fields',
    range: [24, 29],
  },
  { name: 'Ship responsibly', range: [30, 34] },
] as const;
function PhaseNode({ data }: { data: PhaseData }) {
  return (
    <div className={`flow-phase ${data.completed === data.phase.topics.length ? 'done' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="flow-phase-top">
        <span>{String(data.phase.number).padStart(2, '0')}</span>
        <span>
          {data.completed}/{data.phase.topics.length}
        </span>
      </div>
      <strong>{data.phase.title}</strong>
      <div className="flow-phase-progress">
        <i style={{ width: `${(data.completed / data.phase.topics.length) * 100}%` }} />
      </div>
      <div className="flow-phase-footer">
        {data.phase.level}
        <button
          className="nodrag"
          aria-label={`${data.expanded ? 'Collapse' : 'Expand'} ${data.phase.title}`}
          onClick={(e) => {
            e.stopPropagation();
            data.expand();
          }}
        >
          {data.expanded ? 'Hide topics' : 'All topics'}
          <ChevronDown size={12} />
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
function PreviewNode({ data }: NodeProps) {
  return (
    <div className={`flow-topic ${data.done ? 'done' : ''} ${String(data.kind)}`}>
      <Handle type="target" position={data.side === 'left' ? Position.Right : Position.Left} />
      <span>{String(data.title)}</span>
      {Boolean(data.done) && <Check size={14} />}
    </div>
  );
}
const nodeTypes = { phase: PhaseNode, preview: PreviewNode };
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
    if (window.innerWidth < 760) setView('list');
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
      const side = i % 2 === 0 ? 'right' : 'left';
      nodes.push({
        id: p.id,
        type: 'phase',
        position: { x: 375, y: 32 + i * 190 },
        data: {
          phase: p,
          completed: p.topics.filter((t) => completed.includes(t.id)).length,
          expand: () => toggle(p.number),
          expanded: isExpanded,
        },
      });
      p.topics
        .filter((t) => t.kind === 'core')
        .slice(0, 3)
        .forEach((t, j) => {
          nodes.push({
            id: t.id,
            type: 'preview',
            position: { x: side === 'right' ? 720 : 30, y: 24 + i * 190 + j * 47 },
            data: { title: t.title, kind: t.kind, done: completed.includes(t.id), side },
          });
          edges.push({
            id: `${p.id}-${t.id}`,
            source: p.id,
            sourceHandle: side,
            target: t.id,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
          });
        });
      p.prerequisites.forEach((n) => {
        const pre = phases[n];
        if (stagePhases.some((f) => f.number === n))
          edges.push({
            id: `${pre.id}-${p.id}`,
            source: pre.id,
            target: p.id,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)', strokeWidth: 2 },
          });
      });
    });
    return { nodes, edges };
  }, [stagePhases.map((p) => p.id).join(','), expanded.join(','), completed.join(',')]);
  const nextPhase =
    stagePhases.find(
      (p) =>
        p.topics.some((t) => !completed.includes(t.id)) &&
        p.prerequisites.every((n) => phases[n].topics.every((t) => completed.includes(t.id))),
    ) || stagePhases.find((p) => p.topics.some((t) => !completed.includes(t.id)));
  const nextTopic = nextPhase?.topics.find((t) => !completed.includes(t.id));
  const selectedTopic = selected?.phase.topics.find((t) => t.id === selected.topicId);
  const guide = selectedTopic ? deepGuides[selectedTopic.id] : undefined;
  return (
    <>
      <div className="roadmap-start">
        {nextPhase && nextTopic && (
          <a href={url(`learn/${nextPhase.id}/#${nextTopic.id}`)}>
            Next topic <ArrowRight size={14} /> {nextTopic.title}
          </a>
        )}
        <span>Click a concept to learn it. Check it off when you’re ready.</span>
      </div>
      <nav className="stage-nav" aria-label="Roadmap sections">
        {stages
          .map((s, i) => ({ ...s, index: i }))
          .filter(
            (s) =>
              (level === 'all' && path === 'all' && !query) ||
              filtered.some((p) => p.number >= s.range[0] && p.number <= s.range[1]),
          )
          .map((s) => (
            <button
              key={s.name}
              className={stage === s.index ? 'selected' : ''}
              aria-current={stage === s.index ? 'step' : undefined}
              onClick={() => setStage(s.index)}
            >
              <span>{String(s.index + 1).padStart(2, '0')}</span>
              {s.name}
            </button>
          ))}
      </nav>
      <div className="stage-intro">
        <strong>{stages[stage].name}</strong>
        <span>{stagePhases.length} chapters</span>
      </div>
      <div className="roadmap-toolbar">
        <div className="filter-input">
          <Search size={16} />
          <input
            aria-label="Filter roadmap"
            placeholder="Find a topic..."
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
      {stagePhases.length === 0 ? (
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
        <div
          className="roadmap-canvas"
          style={{ height: Math.max(520, stagePhases.length * 190 + 50) }}
          role="region"
          aria-label="Interactive data science roadmap"
        >
          <ReactFlow
            key={`${stage}-${level}-${path}-${query}`}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.06, minZoom: 0.6, maxZoom: 1 }}
            minZoom={0.08}
            maxZoom={1.8}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_e, node) => {
              const p = phases.find((p) => p.id === node.id);
              if (p) setSelected({ phase: p });
              else {
                const phase = phases.find((p) => p.topics.some((t) => t.id === node.id));
                if (phase) setSelected({ phase, topicId: node.id });
              }
            }}
          >
            <Background color="var(--line)" gap={20} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      ) : (
        <div className="roadmap-list">
          {stagePhases.map((p) => (
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
              {selectedTopic ? selected.phase.title : selected.phase.subtitle}
            </p>
            {!selectedTopic && <p>{selected.phase.intuition}</p>}
            {selected.phase.prerequisites.length > 0 && <h3>Learn first</h3>}
            {selected.phase.prerequisites.length > 0 && (
              <div className="dependency-links">
                {selected.phase.prerequisites.map((n) => (
                  <a key={n} href={url(`learn/${phases[n].id}/`)}>
                    {phases[n].title}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            )}
            <div className="inline-actions">
              {guide ? (
                <a className="button" href={url(`topics/${guide}/?concept=${selectedTopic!.id}`)}>
                  Open guide <ArrowRight size={14} />
                </a>
              ) : (
                <a
                  className="button"
                  href={url(
                    `learn/${selected.phase.id}/${selectedTopic ? '#' + selectedTopic.id : ''}`,
                  )}
                >
                  Open chapter <ArrowRight size={14} />
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
          </div>
        )}
      </dialog>
    </>
  );
}
