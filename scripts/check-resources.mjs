import { readFile, writeFile, mkdir } from 'node:fs/promises';
const resources = JSON.parse(await readFile('src/content/resources/resources.json', 'utf8'));
const projects = JSON.parse(await readFile('src/content/projects/projects.json', 'utf8'));
const urls = [...new Set([...resources.map((r) => r.url), ...projects.map((p) => p.datasetUrl)])];
const results = [];
for (let start = 0; start < urls.length; start += 6) {
  await Promise.all(
    urls.slice(start, start + 6).map(async (url) => {
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(25000),
          headers: { 'User-Agent': 'Gata Science Roadmap-Link-Checker/1.0' },
        });
        results.push({ url, status: response.status, finalUrl: response.url, ok: response.ok });
        await response.body?.cancel();
      } catch (error) {
        results.push({ url, status: 0, ok: false, error: error.message });
      }
    }),
  );
}
await mkdir('reports', { recursive: true });
await writeFile(
  'reports/resource-links.json',
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${urls.length} resources responded successfully.`);
failed.forEach((r) => console.log(`${r.status}: ${r.url} ${r.error || ''}`));
if (failed.length) process.exitCode = 1;
