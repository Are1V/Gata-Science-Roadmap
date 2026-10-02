import { useEffect, useMemo, useState } from 'react';
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
  ChevronDown,
  LayoutList,
  Network,
  Search,
  Check,
  Flag,
  Play,
} from 'lucide-react';
import { phases, specializations, type Phase } from '../data/roadmap';
import { categories, categoryForPhase, openTopic } from '../data/learning';
import { stages, projectMilestones, featuredTopics } from '../data/map';
import projects from '../content/projects/projects.json';
import { useProgress } from '../hooks/useProgress';
import { CompleteButton } from './Progress';
import { url } from '../utils/urls';
type PhaseData = { phase: Phase; completed: number; expand: () => void; expanded: boolean };
function PhaseNode({ data }: { data: PhaseData }) {
  return (
    <div className={`flow-phase ${data.completed === data.phase.topics.length ? 'done' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="flow-phase-top">
        <span>
          {data.phase.number < 4 && data.phase.number !== 1
            ? 'Foundations'
            : categoryForPhase(data.phase.number)}
        </span>
        <span>
          {data.completed}/{data.phase.topics.length}
        </span>
      </div>
      <strong>{data.phase.title}</strong>
      <div className="flow-phase-progress">
        <i style={{ width: `${(data.completed / data.phase.topics.length) * 100}%` }} />
      </div>
      <div className="flow-phase-footer">
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
function TopicNode({ data }: NodeProps) {
  return (
    <div className={`flow-topic ${data.done ? 'done' : ''} ${String(data.kind)}`}>
      <Handle type="target" position={data.side === 'left' ? Position.Right : Position.Left} />
      {data.kind === 'project' && <Flag size={13} />}
      <span>{String(data.title)}</span>
      {Boolean(data.done) && <Check size={14} />}
    </div>
  );
}
const nodeTypes = { phase: PhaseNode, preview: TopicNode };
export default function Roadmap() {
  const { completed } = useProgress();
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState('all'),
    [path, setPath] = useState('all'),
    [query, setQuery] = useState(''),
    [view, setView] = useState('map'),
    [stage, setStage] = useState(0),
    [expanded, setExpanded] = useState<number | null>(null);
  useEffect(() => {
    setReady(true);
    const params = new URLSearchParams(location.search);
    const p = params.get('path');
    if (p && specializations.some((s) => s.id === p)) setPath(p);
    const c = params.get('category');
    if (c && categories.some((x) => x === c)) setCategory(c);
    if (innerWidth < 760) setView('list');
  }, []);
  const filtered = phases.filter(
    (p) =>
      (category === 'all' || categoryForPhase(p.number) === category) &&
      (path === 'all' ||
        p.number < 4 ||
        specializations.find((s) => s.id === path)?.phases.includes(p.number)) &&
      (!query ||
        `${p.title} ${p.topics.map((t) => t.title).join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const activeStage = filtered.some((p) => stages[stage].phases.includes(p.number))
    ? stage
    : Math.max(
        0,
        stages.findIndex((s) => filtered.some((p) => s.phases.includes(p.number))),
      );
  const stagePhases = stages[activeStage].phases
    .map((n) => filtered.find((p) => p.number === n))
    .filter((p): p is Phase => Boolean(p));
  const toggle = (n: number) => setExpanded((old) => (old === n ? null : n));
  const matchingTopics = (p: Phase) =>
    p.topics.filter(
      (t) =>
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        t.title.toLowerCase().includes(query.toLowerCase()),
    );
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [],
      edges: Edge[] = [];
    stagePhases.forEach((p, i) => {
      const side = i % 2 === 0 ? 'right' : 'left';
      nodes.push({
        id: p.id,
        type: 'phase',
        position: { x: 375, y: 32 + i * 215 },
        data: {
          phase: p,
          completed: p.topics.filter((t) => completed.includes(t.id)).length,
          expand: () => toggle(p.number),
          expanded: expanded === p.number,
        },
      });
      const featured = featuredTopics[p.number]
        ?.map((id) => p.topics.find((t) => t.id === id))
        .filter(Boolean);
      const preview = query
        ? matchingTopics(p)
        : featured?.length
          ? featured
          : p.topics.filter((t) => t.kind === 'core');
      preview.slice(0, 3).forEach((t, j) => {
        if (!t) return;
        nodes.push({
          id: t.id,
          type: 'preview',
          position: { x: side === 'right' ? 720 : 30, y: 24 + i * 215 + j * 49 },
          data: { title: t.title, kind: t.kind, done: completed.includes(t.id), side },
        });
        edges.push({
          id: `${p.id}-${t.id}`,
          source: p.id,
          sourceHandle: side,
          target: t.id,
          type: 'smoothstep',
          style: { stroke: 'var(--accent)', strokeWidth: 1.25 },
        });
      });
      const project = projects.find((x) => x.id === projectMilestones[p.number]);
      if (project && !query) {
        const other = side === 'right' ? 'left' : 'right';
        nodes.push({
          id: `project-${project.id}`,
          type: 'preview',
          position: { x: other === 'right' ? 720 : 30, y: 65 + i * 215 },
          data: {
            title: project.title,
            kind: 'project',
            side: other,
            done: completed.includes(`project-${project.id}`),
          },
        });
        edges.push({
          id: `${p.id}-project`,
          source: p.id,
          sourceHandle: other,
          target: `project-${project.id}`,
          type: 'smoothstep',
          style: { stroke: 'var(--muted)', strokeDasharray: '5 4' },
        });
      }
      p.prerequisites.forEach((n) => {
        if (stagePhases.some((f) => f.number === n))
          edges.push({
            id: `${phases[n].id}-${p.id}`,
            source: phases[n].id,
            target: p.id,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
          });
      });
    });
    return { nodes, edges };
  }, [stagePhases.map((p) => p.id).join(','), completed.join(','), expanded, query]);
  const nextTopic = stagePhases
    .flatMap((p) => p.topics)
    .find((t) => t.kind === 'core' && !completed.includes(t.id));
  const renderTopics = (p: Phase) => (
    <div className="stage-topic-grid">
      {matchingTopics(p).map((t) => (
        <div key={t.id}>
          <button onClick={() => openTopic(t.id)}>
            <span className={`kind-dot ${t.kind}`} />
            {t.title}
            <Play size={12} />
          </button>
          <CompleteButton id={t.id} />
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div className="roadmap-start">
        {nextTopic && (
          <button className="text-button" onClick={() => openTopic(nextTopic.id)}>
            Next topic <ArrowRight size={14} />
            {nextTopic.title}
          </button>
        )}
      </div>
      <nav className="stage-nav" aria-label="Roadmap sections">
        {stages
          .map((s, i) => ({ ...s, index: i }))
          .filter((s) => filtered.some((p) => s.phases.includes(p.number)))
          .map((s) => (
            <button
              key={s.name}
              className={activeStage === s.index ? 'selected' : ''}
              aria-current={activeStage === s.index ? 'step' : undefined}
              onClick={() => {
                setStage(s.index);
                setExpanded(null);
              }}
            >
              <span>{String(s.index + 1).padStart(2, '0')}</span>
              {s.name}
            </button>
          ))}
      </nav>
      <div className="roadmap-toolbar">
        <div className="filter-input">
          <Search size={16} />
          <input
            disabled={!ready}
            aria-label="Filter roadmap"
            placeholder="Find a topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          disabled={!ready}
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All subjects</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="filter-select"
          disabled={!ready}
          aria-label="Filter by specialization"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        >
          <option value="all">All paths</option>
          {specializations.map((s) => (
            <option key={s.id} value={s.id}>
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
            <Network size={15} />
            Map
          </button>
          <button
            className={view === 'list' ? 'selected' : ''}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <LayoutList size={15} />
            List
          </button>
        </div>
      </div>
      <div className="stage-intro">
        <strong>{stages[activeStage].name}</strong>
        <div className="map-legend">
          <span>
            <i className="kind-dot core" />
            Recommended
          </span>
          <span>
            <i className="kind-dot optional" />
            Optional
          </span>
          <span>
            <Flag size={12} />
            Project
          </span>
          <span>
            <Check size={12} />
            Complete
          </span>
        </div>
      </div>
      {view === 'map' &&
        stagePhases
          .filter((p) => p.number === expanded)
          .map((p) => (
            <section className="stage-topics" key={p.id}>
              <div className="stage-topics-heading">
                <h3>{p.title}: topics</h3>
                <button className="text-button" onClick={() => setExpanded(null)}>
                  Close
                </button>
              </div>
              {renderTopics(p)}
            </section>
          ))}
      {!stagePhases.length ? (
        <div className="empty-state">
          No topics match these filters.
          <br />
          <button
            className="text-button"
            onClick={() => {
              setQuery('');
              setCategory('all');
              setPath('all');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : query ? (
        <div className="search-topic-matches">
          {stagePhases.map((p) => (
            <section key={p.id}>
              <h3>{p.title}</h3>
              {renderTopics(p)}
            </section>
          ))}
        </div>
      ) : view === 'map' ? (
        <div
          className="roadmap-canvas"
          style={{ height: Math.max(520, stagePhases.length * 215 + 35) }}
          role="region"
          aria-label="Interactive data science roadmap"
        >
          <ReactFlow
            key={`${activeStage}-${path}-${category}`}
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
              if (node.id.startsWith('project-'))
                location.href = url(`projects/#${node.id.slice(8)}`);
              else {
                const p = phases.find((p) => p.id === node.id);
                if (p) toggle(p.number);
                else openTopic(node.id);
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
                aria-expanded={expanded === p.number}
                onClick={() => toggle(p.number)}
              >
                <span className="phase-number">{String(p.number).padStart(2, '0')}</span>
                <div>
                  <h3>{p.title}</h3>
                  <span>
                    {p.topics.filter((t) => completed.includes(t.id)).length} / {p.topics.length}{' '}
                    complete
                  </span>
                </div>
                <ChevronDown size={18} />
              </button>
              {expanded === p.number && (
                <div className="list-topics">
                  {renderTopics(p)}
                  {projectMilestones[p.number] && (
                    <a className="text-link" href={url(`projects/#${projectMilestones[p.number]}`)}>
                      <Flag size={14} />
                      Practice project
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
