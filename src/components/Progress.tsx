import { Check, ArrowUpRight, RotateCcw, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { phases, topicCount, deepGuides } from '../data/roadmap';
import { url } from '../utils/urls';
export function CompleteButton({ id, label = 'Mark complete' }: { id: string; label?: string }) {
  const { completed, toggle } = useProgress();
  const done = completed.includes(id);
  return (
    <button
      className={`complete-button ${done ? 'is-complete' : ''}`}
      onClick={() => toggle(id)}
      aria-pressed={done}
    >
      <Check size={16} />
      {done ? 'Completed' : label}
    </button>
  );
}
export function GuideCompleteButton({ guideId, topicId }: { guideId: string; topicId: string }) {
  const [activeId, setActiveId] = useState(topicId);
  useEffect(() => {
    const requested = new URLSearchParams(location.search).get('concept');
    if (requested && deepGuides[requested] === guideId) setActiveId(requested);
  }, [guideId]);
  return <CompleteButton id={activeId} />;
}
export function ProgressMini() {
  const { topicTotal } = useProgress();
  const percent = Math.round((topicTotal / topicCount) * 100);
  return (
    <a href={url('progress/')} className="progress-mini">
      <div>
        <span>Your progress</span>
        <ArrowUpRight size={15} />
      </div>
      <strong>
        {percent}% <span>of the roadmap complete</span>
      </strong>
      <div className="progress-track">
        <i style={{ width: `${percent}%` }} />
      </div>
      <small>
        {topicTotal} of {topicCount} topics
      </small>
    </a>
  );
}
export function ProgressDashboard() {
  const { completed, topicTotal, reset } = useProgress();
  const [confirm, setConfirm] = useState(false);
  function download() {
    const blob = new Blob([JSON.stringify({ version: 1, completed }, null, 2)], {
      type: 'application/json',
    });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = 'gata-progress.json';
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
  return (
    <>
      <div className="metric-grid">
        <div className="metric">
          <strong>{Math.round((topicTotal / topicCount) * 100)}%</strong>
          <span>Overall progress</span>
        </div>
        <div className="metric">
          <strong>{topicTotal}</strong>
          <span>Topics completed</span>
        </div>
        <div className="metric">
          <strong>{topicCount - topicTotal}</strong>
          <span>Topics to explore</span>
        </div>
        <div className="metric">
          <strong>{completed.filter((x) => x.startsWith('project-')).length}</strong>
          <span>Projects completed</span>
        </div>
      </div>
      <div className="section-heading">
        <h2>A little further, every day.</h2>
        <button className="text-button" onClick={download}>
          <Download size={16} /> Export progress
        </button>
      </div>
      <div className="progress-sections">
        {phases.map((p) => {
          const n = p.topics.filter((t) => completed.includes(t.id)).length;
          return (
            <a className="progress-section" key={p.id} href={url(`learn/${p.id}/`)}>
              <span className="phase-number">{String(p.number).padStart(2, '0')}</span>
              <div>
                <strong>{p.title}</strong>
                <div className="progress-track">
                  <i style={{ width: `${(n / p.topics.length) * 100}%` }} />
                </div>
              </div>
              <span>
                {n} / {p.topics.length}
              </span>
              <ArrowUpRight size={17} />
            </a>
          );
        })}
      </div>
      <div className="reset-area">
        <p>Progress is stored in this browser. Export it to keep a personal record.</p>
        {confirm ? (
          <div className="inline-actions">
            <strong>Clear all topic and project progress?</strong>
            <button
              className="button danger"
              onClick={() => {
                reset();
                setConfirm(false);
              }}
            >
              Yes, reset progress
            </button>
            <button className="button secondary" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="text-button" onClick={() => setConfirm(true)}>
            <RotateCcw size={15} /> Reset progress
          </button>
        )}
      </div>
    </>
  );
}
