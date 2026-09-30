import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from '@xyflow/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  LayoutList,
  Network,
  Search,
  X,
  BookOpen,
  GitBranch,
  Circle,
} from 'lucide-react';
import { phases, topics, specializations, deepGuides, type Phase } from '../data/roadmap';
import { useProgress } from '../hooks/useProgress';
import { CompleteButton } from './Progress';
import { url } from '../utils/urls';
type PhaseData = { phase: Phase; completed: number; expand: () => void; expanded: boolean };
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
function TopicNode({ data }: NodeProps) {
  return (
    <div className={`flow-topic ${data.done ? 'done' : ''}`}>
      <Handle type="target" position={Position.Top} />
      {data.done ? <Check size={13} /> : <Circle size={10} />}
      <span>{String(data.title)}</span>
      <span className={`kind-dot ${String(data.kind)}`} aria-label={String(data.kind)} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { phase: PhaseNode, topic: TopicNode };
export default function Roadmap() {
  const { completed } = useProgress();
  const [level, setLevel] = useState('all'),
    [path, setPath] = useState('all'),
    [query, setQuery] = useState(''),
    [view, setView] = useState('map'),
    [expanded, setExpanded] = useState<number[]>([]),
    [selected, setSelected] = useState<{ phase: Phase; topicId?: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
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
  const toggle = (number: number) =>
    setExpanded((old) =>
      old.includes(number) ? old.filter((n) => n !== number) : [...old, number],
    );
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let y = 35;
    filtered.forEach((p) => {
      const isExpanded = expanded.includes(p.number);
      nodes.push({
        id: p.id,
        type: 'phase',
        position: { x: 255, y },
        data: {
          phase: p,
          completed: p.topics.filter((t) => completed.includes(t.id)).length,
          expand: () => toggle(p.number),
          expanded: isExpanded,
        },
      });
      p.prerequisites.forEach((n) => {
        const pre = phases[n];
        if (filtered.some((f) => f.number === n))
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
      y += 190;
      if (isExpanded) {
        p.topics.forEach((t, i) => {
          nodes.push({
            id: t.id,
            type: 'topic',
            position: { x: 25 + (i % 3) * 250, y: y + Math.floor(i / 3) * 67 },
            data: { title: t.title, done: completed.includes(t.id), kind: t.kind },
          });
          edges.push({
            id: `${p.id}-${t.id}`,
            source: p.id,
            target: t.id,
            type: 'smoothstep',
            style: { stroke: 'var(--line)' },
            hidden: i > 2,
          });
        });
        y += Math.ceil(p.topics.length / 3) * 67 + 65;
      }
    });
    return { nodes, edges };
  }, [filtered.map((p) => p.id).join(','), expanded.join(','), completed.join(',')]);
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
          <span className="eyebrow">YOUR NEXT SMALL STEP</span>
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
        <span className="legend-note">{filtered.length} phases · Click a node to explore</span>
      </div>
      {filtered.length === 0 ? (
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
          ref={canvas}
          className="roadmap-canvas"
          role="region"
          aria-label="Interactive data science roadmap"
        >
          <ReactFlow
            key={`${level}-${path}-${query}`}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 10, y: 10, zoom: 0.82 }}
            onInit={(instance) =>
              instance.setViewport({
                x: (canvas.current?.clientWidth || 750) / 2 - 385 * 0.82,
                y: 45,
                zoom: 0.82,
              })
            }
            minZoom={0.08}
            maxZoom={1.8}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_e, node) => {
              const p = phases.find((p) => p.id === node.id);
              if (p) setSelected({ phase: p });
              else {
                const t = topics.find((t) => t.id === node.id);
                if (t) setSelected({ phase: phases[t.phase], topicId: t.id });
              }
            }}
          >
            <Background color="var(--line)" gap={20} />
            <Controls showInteractive={false} />
            <MiniMap nodeColor="var(--accent)" maskColor="transparent" pannable zoomable />
            <div className="canvas-caption">A map, not a race. Follow your curiosity.</div>
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
        Pan to explore. Use + / − to zoom, or switch to the list for a keyboard-friendly view.
        Progress stays in your browser.
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
                <a className="button" href={url(`topics/${guide}/`)}>
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
