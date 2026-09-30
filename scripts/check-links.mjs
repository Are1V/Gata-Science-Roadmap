import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name))),
    )
  ).flat();
}
const files = (await walk('dist')).filter((f) => f.endsWith('.html'));
const failures = [];
let count = 0;
for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|data:|javascript:)/.test(href)) continue;
    const parsed = new URL(href, 'https://local.test' + base + '/' + path.relative('dist', file));
    if (base && parsed.pathname !== base && !parsed.pathname.startsWith(base + '/')) {
      failures.push(`${file}: missing base in ${href}`);
      continue;
    }
    let target = path.join('dist', decodeURIComponent(parsed.pathname.slice(base.length)));
    try {
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      await stat(target);
      if (parsed.hash && target.endsWith('.html')) {
        const targetHtml = await readFile(target, 'utf8');
        const id = decodeURIComponent(parsed.hash.slice(1));
        if (!targetHtml.includes(`id="${id}"`)) failures.push(`${file}: missing anchor ${href}`);
      }
    } catch {
      failures.push(`${file}: missing target ${href}`);
    }
    count++;
  }
}
if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Validated ${count} local links and assets across ${files.length} pages (base: ${base || '/'}).`,
  );
