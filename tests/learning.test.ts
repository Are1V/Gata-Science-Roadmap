import { describe, expect, it } from 'vitest';
import { topics } from '../src/data/roadmap';
import { lessons, videos, learningOrder, categories, categoryForPhase } from '../src/data/learning';
import { connectedAlgorithms, featuredTopics, projectMilestones } from '../src/data/map';
import projects from '../src/content/projects/projects.json';
describe('Video-first curriculum', () => {
  it('gives every topic a concise lesson, a real video reference, and practice', () => {
    for (const t of topics) {
      const l = lessons[t.id];
      expect(l, t.id).toBeDefined();
      expect(l.summary.length).toBeGreaterThan(20);
      expect(l.summary.length).toBeLessThan(240);
      expect(videos[l.videoId], t.id).toBeDefined();
      expect(
        projects.some((p) => p.id === l.projectId),
        t.id,
      ).toBe(true);
      if (l.alternateVideoId) {
        expect(videos[l.alternateVideoId]).toBeDefined();
        expect(l.alternateVideoId).not.toBe(l.videoId);
      }
      if (l.videoStart) {
        expect(l.videoStart).toBeGreaterThanOrEqual(0);
        const duration = videos[l.videoId].durationSeconds;
        if (duration) expect(l.videoStart).toBeLessThan(duration);
      }
    }
  });
  it('keeps concept dependencies valid and acyclic', () => {
    const done = new Set<string>();
    function visit(id: string, path: string[]) {
      expect(lessons[id], id).toBeDefined();
      expect(path, `cycle at ${id}`).not.toContain(id);
      if (done.has(id)) return;
      for (const pre of lessons[id].prerequisites) visit(pre, [...path, id]);
      done.add(id);
    }
    for (const id of Object.keys(lessons)) visit(id, []);
    expect(lessons['21-pca'].prerequisites).toContain('4-eigenvectors');
    expect(lessons['14-naive-bayes'].prerequisites).toContain('6-bayes-theorem');
    expect(lessons['14-k-nearest-neighbors'].prerequisites).toContain('4-euclidean-distance');
    expect(lessons['15-decision-trees'].prerequisites).toContain('15-entropy');
  });
  it('only exposes valid graph nodes, milestones, and categories', () => {
    for (const id of [...connectedAlgorithms, ...Object.values(featuredTopics).flat()])
      expect(lessons[id], id).toBeDefined();
    for (const id of Object.values(projectMilestones))
      expect(projects.some((p) => p.id === id)).toBe(true);
    expect(new Set(learningOrder).size).toBe(37);
    for (const t of topics) expect(categories).toContain(categoryForPhase(t.phase));
  });
  it('records review evidence without duplicate catalog entries', () => {
    for (const [id, v] of Object.entries(videos)) {
      expect(id).toMatch(/^[\w-]{11}$/);
      expect(v.youtubeId).toBe(id);
      expect(v.title.length).toBeGreaterThan(3);
      expect(v.channel.length).toBeGreaterThan(2);
      expect(new URL(v.sourceUrl).protocol).toBe('https:');
      expect(v.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(v.verification).toMatch(/YouTube/);
    }
  });
});
