import lessonData from './topic-lessons.json';
import videoData from './videos.json';
import { phases, topics } from './roadmap';
export type Lesson = {
  summary: string;
  why: string;
  prerequisites: string[];
  videoId: string;
  videoStart?: number;
  alternateVideoId?: string;
  practice: string;
  projectId: string;
};
export type Video = {
  youtubeId: string;
  title: string;
  channel: string;
  durationSeconds: number;
  difficulty: string;
  sourceUrl: string;
  reviewedAt: string;
  selectionReason: string;
  verification: string;
  publishedAt?: string;
  viewsAtReview?: number;
};
export const lessons = lessonData as Record<string, Lesson>;
export const videos = videoData as Record<string, Video>;
export const topicById = new Map(topics.map((t) => [t.id, t]));
export const categories = [
  'Python',
  'Mathematics',
  'Statistics',
  'SQL',
  'Data Analysis',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Large Language Models',
  'Computer Vision',
  'Data Engineering',
  'MLOps',
  'Career',
] as const;
const groups: Record<string, number[]> = {
  Python: [0, 1, 2, 3],
  Mathematics: [4, 5],
  Statistics: [6, 7, 28, 29],
  SQL: [9],
  'Data Analysis': [8, 10, 11, 35],
  'Machine Learning': [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 33],
  'Deep Learning': [23],
  'Natural Language Processing': [24],
  'Large Language Models': [37],
  'Computer Vision': [25],
  'Data Engineering': [30],
  MLOps: [31, 32],
  Career: [34, 36],
};
export const categoryForPhase = (n: number) => categories.find((c) => groups[c].includes(n))!;
export const learningOrder = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 35, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  37, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36,
];
export const phaseForTopic = (id: string) => phases[topicById.get(id)!.phase];
export function openTopic(id: string) {
  if (!topicById.has(id)) return;
  const next = new URL(window.location.href);
  next.searchParams.set('topic', id);
  if (next.href !== window.location.href) history.pushState({}, '', next);
  window.dispatchEvent(new Event('topicchange'));
}
export const topicHref = (id: string) => `roadmap/?topic=${encodeURIComponent(id)}`;
