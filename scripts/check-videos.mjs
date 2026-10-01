import { readFile, mkdir, writeFile } from 'node:fs/promises';
const videos = JSON.parse(await readFile(new URL('../src/data/videos.json', import.meta.url)));
const lessons = JSON.parse(
  await readFile(new URL('../src/data/topic-lessons.json', import.meta.url)),
);
const curriculum = JSON.parse(
  await readFile(new URL('../src/data/curriculum.json', import.meta.url)),
);
const errors = [];
for (const phase of curriculum)
  for (const topic of phase.topics) {
    const lesson = lessons[topic.id];
    if (!lesson || !videos[lesson.videoId]) errors.push(`Missing video: ${topic.id}`);
    if (lesson?.alternateVideoId && !videos[lesson.alternateVideoId])
      errors.push(`Missing alternative: ${topic.id}`);
  }
for (const [id, video] of Object.entries(videos))
  if (!/^[\w-]{11}$/.test(id) || video.youtubeId !== id || !video.sourceUrl || !video.reviewedAt)
    errors.push(`Invalid record: ${id}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `${Object.keys(lessons).length} topics reference ${Object.keys(videos).length} catalog videos.`,
);
if (process.argv.includes('--offline')) process.exit(0);
const results = [];
const entries = Object.entries(videos);
// A successful oEmbed response verifies public metadata, not regional playback or teaching quality.
for (let i = 0; i < entries.length; i += 4) {
  await Promise.all(
    entries.slice(i, i + 4).map(async ([id, video]) => {
      const checkedAt = new Date().toISOString();
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
          { signal: AbortSignal.timeout(15000) },
        );
        if (!response.ok) {
          results.push({
            id,
            status: [401, 403, 404, 410].includes(response.status)
              ? 'review-required'
              : 'unconfirmed',
            http: response.status,
            checkedAt,
          });
          return;
        }
        const data = await response.json();
        results.push({
          id,
          status:
            data.title === video.title && data.author_name === video.channel
              ? 'available'
              : 'metadata-changed',
          title: data.title,
          channel: data.author_name,
          checkedAt,
        });
      } catch (error) {
        results.push({ id, status: 'unconfirmed', reason: error.message, checkedAt });
      }
    }),
  );
  console.log(`Checked ${Math.min(i + 4, entries.length)}/${entries.length}`);
}
await mkdir('reports', { recursive: true });
await writeFile('reports/video-links.json', JSON.stringify(results, null, 2) + '\n');
const review = results.filter((r) => r.status !== 'available');
console.log(
  `${results.length - review.length} available; ${review.length} require review. See reports/video-links.json.`,
);
if (review.length) process.exitCode = 1;
