import { Play, ExternalLink } from 'lucide-react';
import { videos } from '../data/learning';
export default function VideoCard({
  id,
  start = 0,
  secondary = false,
}: {
  id: string;
  start?: number;
  secondary?: boolean;
}) {
  const video = videos[id];
  if (!video) return null;
  const seconds = video.durationSeconds;
  const duration =
    seconds >= 3600
      ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
      : `${Math.ceil(seconds / 60)} min`;
  return (
    <a
      className={`video-card ${secondary ? 'video-card-secondary' : ''}`}
      href={`https://www.youtube.com/watch?v=${video.youtubeId}${start ? `&t=${start}s` : ''}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="video-thumbnail">
        <img
          src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          width="480"
          height="360"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        <span className="video-play">
          <Play size={22} fill="currentColor" />
        </span>
        {seconds > 0 && <span className="video-duration">{duration}</span>}
      </div>
      <div className="video-card-copy">
        <strong>{video.title}</strong>
        <span>
          {video.channel} · {video.difficulty}
        </span>
        <span className="video-watch">
          {start ? 'Watch this chapter' : 'Watch video'} <ExternalLink size={13} />
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
      </div>
    </a>
  );
}
