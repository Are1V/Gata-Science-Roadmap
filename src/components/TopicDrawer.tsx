import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { lessons, topicById, categoryForPhase, openTopic } from '../data/learning';
import { useProgress } from '../hooks/useProgress';
import { CompleteButton } from './Progress';
import VideoCard from './VideoCard';
import { url } from '../utils/urls';
export function TopicLesson({
  id,
  headingId = 'lesson-title',
}: {
  id: string;
  headingId?: string;
}) {
  const topic = topicById.get(id);
  const lesson = lessons[id];
  const { completed } = useProgress();
  if (!topic || !lesson) return null;
  return (
    <div className="topic-lesson">
      <div className="topic-meta">
        {categoryForPhase(topic.phase)}
      </div>
      <h2 id={headingId}>{topic.title}</h2>
      <p className="topic-summary">{lesson.summary}</p>
      {lesson.prerequisites.length > 0 && (
        <section className="topic-prerequisites">
          <h3>Learn first</h3>
          <div className="dependency-links">
            {lesson.prerequisites.map((pre) => (
              <button key={pre} onClick={() => openTopic(pre)}>
                {completed.includes(pre) && <Check size={12} />}
                {topicById.get(pre)?.title}
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="topic-video">
        <h3>Recommended video</h3>
        <VideoCard id={lesson.videoId} start={lesson.videoStart} />
        {lesson.alternateVideoId && (
          <details className="video-alternative">
            <summary>Another perspective</summary>
            <VideoCard id={lesson.alternateVideoId} secondary />
          </details>
        )}
      </section>
      <section className="topic-practice">
        <div>
          <h3>Try it yourself</h3>
          <p>{lesson.practice}</p>
        </div>
        <a className="text-link" href={url(`projects/#${lesson.projectId}`)}>
          Start practice <ArrowRight size={14} />
        </a>
      </section>
      <div className="topic-completion">
        <CompleteButton id={id} />
      </div>
    </div>
  );
}
export default function TopicDrawer() {
  const [id, setId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const sync = () => {
      const value = new URLSearchParams(location.search).get('topic');
      setId(value && topicById.has(value) ? value : null);
    };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('topicchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('topicchange', sync);
    };
  }, []);
  useEffect(() => {
    if (id) {
      if (!dialog.current?.open) dialog.current?.showModal();
      dialog.current?.scrollTo(0, 0);
    } else dialog.current?.close();
    const previous = document.body.style.overflow;
    if (id) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [id]);
  const close = () => {
    const next = new URL(location.href);
    next.searchParams.delete('topic');
    history.replaceState({}, '', next);
    setId(null);
  };
  return (
    <dialog
      ref={dialog}
      className="topic-drawer"
      aria-labelledby="drawer-topic-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="topic-drawer-inner">
        <div className="drawer-toolbar">
          <span>GATA / FIELD NOTE</span>
          <button className="icon-button" aria-label="Close topic" onClick={close} autoFocus>
            <X size={21} />
          </button>
        </div>
        {id && <TopicLesson key={id} id={id} headingId="drawer-topic-title" />}
      </div>
    </dialog>
  );
}
