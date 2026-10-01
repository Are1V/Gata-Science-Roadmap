import { Play } from 'lucide-react';
import { phases } from '../data/roadmap';
import { openTopic } from '../data/learning';
import { CompleteButton } from './Progress';
export default function TopicList({ phase }: { phase: number }) {
  return (
    <div className="topic-checklist">
      {phases[phase].topics.map((t) => (
        <div id={t.id} key={t.id}>
          <button onClick={() => openTopic(t.id)}>
            <span className={`kind-dot ${t.kind}`} />
            {t.title}
            <Play size={13} />
          </button>
          <CompleteButton id={t.id} />
        </div>
      ))}
    </div>
  );
}
