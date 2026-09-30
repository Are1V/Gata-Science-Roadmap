import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { phases, topics, resources, deepGuides, specializations } from '../src/data/roadmap';
import projects from '../src/content/projects/projects.json';
const guideFiles = readdirSync('src/content/guides').filter((f) => f.endsWith('.md'));
const guideIds = guideFiles.map((f) => f.replace('.md', ''));
describe('The learning graph is coherent', () => {
  it('covers all 35 requested phases with uniquely addressable concepts', () => {
    expect(phases.map((p) => p.number)).toEqual(Array.from({ length: 35 }, (_, i) => i));
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    expect(topics.length).toBeGreaterThan(600);
  });
  it('has valid, acyclic phase prerequisites', () => {
    for (const p of phases)
      for (const n of p.prerequisites) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(p.number);
      }
  });
  it('has valid resource, project, and specialization references', () => {
    for (const p of phases)
      for (const id of p.resourceIds) expect(resources.some((r) => r.id === id)).toBe(true);
    for (const p of [...projects, ...specializations])
      for (const n of 'prerequisites' in p ? p.prerequisites : p.phases)
        expect(phases[n]).toBeDefined();
    for (const r of resources) expect(new URL(r.url).protocol).toBe('https:');
  });
  it('only links to guides and concepts that exist', () => {
    for (const [id, guide] of Object.entries(deepGuides)) {
      expect(
        topics.some((t) => t.id === id),
        id,
      ).toBe(true);
      expect(guideIds, guide).toContain(guide);
    }
  });
  it('gives each deep guide real teaching sections and valid references', () => {
    const graph: Record<string, string[]> = {};
    for (const file of guideFiles) {
      const raw = readFileSync(`src/content/guides/${file}`, 'utf8');
      for (const section of [
        'What is it?',
        'Why does it matter?',
        'Intuition',
        'Mathematics',
        'Example',
        'Common mistakes',
        'Interview questions',
        'Exercises',
      ])
        expect(raw, file).toContain(`## ${section}`);
      const meta = parse(raw.split('---')[1]);
      expect(topics.some((t) => t.id === meta.topicId)).toBe(true);
      expect(projects.some((p) => p.id === meta.project)).toBe(true);
      for (const id of meta.resources) expect(resources.some((r) => r.id === id)).toBe(true);
      graph[file.replace('.md', '')] = meta.prerequisites;
      for (const id of meta.prerequisites) expect(guideIds).toContain(id);
    }
    const visit = (id: string, path: string[]) => {
      expect(path, `cycle at ${id}`).not.toContain(id);
      for (const p of graph[id]) visit(p, [...path, id]);
    };
    for (const id of guideIds) visit(id, []);
  });
});
