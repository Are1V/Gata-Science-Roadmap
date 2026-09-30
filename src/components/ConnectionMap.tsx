import { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type NodeProps,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import { ArrowUpRight, GitBranch } from 'lucide-react';
import { url } from '../utils/urls';
export type GuideConnection = { id: string; title: string; prerequisites: string[] };
function GuideNode({ data }: NodeProps) {
  return (
    <a
      className={`connection-node ${data.target ? 'connection-target' : ''}`}
      href={url(`topics/${data.guideId}/`)}
    >
      <Handle type="target" position={Position.Top} />
      <span>{data.target ? 'PUT IT ALL TOGETHER' : 'FOUNDATION'}</span>
      <strong>{String(data.title)}</strong>
      <ArrowUpRight size={14} />
      <Handle type="source" position={Position.Bottom} />
    </a>
  );
}
const nodeTypes = { guide: GuideNode };
export default function ConnectionMap({ guides }: { guides: GuideConnection[] }) {
  const [target, setTarget] = useState('logistic-regression');
  const { nodes, edges, ancestors } = useMemo(() => {
    const graph = new Map(guides.map((g) => [g.id, g]));
    const depths = new Map<string, number>();
    const visit = (id: string): number => {
      if (depths.has(id)) return depths.get(id)!;
      const guide = graph.get(id)!;
      const depth = guide.prerequisites.length
        ? 1 + Math.max(...guide.prerequisites.map(visit))
        : 0;
      depths.set(id, depth);
      return depth;
    };
    visit(target);
    const tiers = new Map<number, string[]>();
    for (const [id, depth] of depths) tiers.set(depth, [...(tiers.get(depth) || []), id]);
    const nodes: Node[] = [],
      edges: Edge[] = [];
    for (const [depth, ids] of tiers)
      ids.forEach((id, i) => {
        const g = graph.get(id)!;
        nodes.push({
          id,
          type: 'guide',
          position: { x: 390 + (i - (ids.length - 1) / 2) * 255, y: depth * 155 },
          data: { title: g.title, guideId: id, target: id === target },
        });
        g.prerequisites.forEach((p) =>
          edges.push({
            id: `${p}-${id}`,
            source: p,
            target: id,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' },
            style: { stroke: 'var(--accent)', strokeWidth: 1.4 },
          }),
        );
      });
    return { nodes, edges, ancestors: [...depths.keys()].map((id) => graph.get(id)!) };
  }, [guides, target]);
  return (
    <section className="connection-section" id="connections">
      <div className="section-heading">
        <div>
          <h2>The why behind the how.</h2>
          <p>
            Trace a model back to its mathematical foundations. Every node opens a detailed guide.
          </p>
        </div>
        <GitBranch size={24} />
      </div>
      <div className="connection-selector">
        <label htmlFor="connection-target">Connect the ideas behind</label>
        <select
          id="connection-target"
          className="filter-select"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          {guides
            .filter((g) =>
              [
                'linear-regression',
                'logistic-regression',
                'pca',
                'neural-networks',
                'k-means',
              ].includes(g.id),
            )
            .map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
        </select>
      </div>
      <div
        className="connection-canvas"
        role="region"
        aria-label="Mathematical prerequisites graph"
      >
        <ReactFlow
          key={target}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background color="var(--line)" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <details className="connection-text">
        <summary>Read these connections as a list</summary>
        {ancestors.map((g) => (
          <div key={g.id}>
            <a href={url(`topics/${g.id}/`)}>{g.title}</a>
            <span>
              {g.prerequisites.length
                ? `Builds on: ${g.prerequisites.map((id) => guides.find((p) => p.id === id)?.title).join(', ')}`
                : 'Start here — no earlier detailed guide required.'}
            </span>
          </div>
        ))}
      </details>
    </section>
  );
}
