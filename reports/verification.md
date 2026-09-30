# V1 verification

Checked on 2026-09-30 in Chromium on Linux, using Node 22.23.3.

## Passing checks

- `npm run lint`: TypeScript and JavaScript lint.
- `npm run check`: 37 source/config files; zero errors, warnings, or hints.
- `npm test`: five content-integrity tests, including uniqueness, complete phase coverage, valid references, and acyclic prerequisites.
- `npm run build`: 66 static HTML pages.
- `npm run check:links`: 3,173 internal page, fragment, and asset references validated.
- `npm run test:e2e`: 11 browser tests pass at both `/` and `/Gata-Science-Roadmap/`.
- `npm run check:resources`: all 45 unique resource and dataset URLs responded successfully; full response evidence is in `resource-links.json`.
- 37 Python teaching code blocks parse with Python's `ast.parse`. This is a syntax check; all external Python libraries were not installed or executed in this workspace.

The browser suite exercises search and Escape dismissal; topic persistence and reset confirmation; graph expansion, topic dialogs, zoom, filters, and empty results; project completion; interview answers; mathematical rendering and gradient updates; mobile navigation and overflow; theme persistence; corrupt storage; mathematical dependency graphs; cross-tab updates and export; and automated WCAG A/AA checks on representative light/dark pages.

Desktop and mobile screenshots are in `public/screenshots/`. Mobile overflow checks use a 390 × 844 viewport; the main desktop suite uses 1440 × 1050. Automated accessibility tests do not replace comprehensive assistive-technology testing.

## Delivery scope

The complete 35-phase structure contains 603 concept entries. There are 35 chapter overviews and 19 detailed authored guides, not 603 complete tutorials. Non-guide concepts explicitly link to their chapter's curated study resources. The initial project library has 19 briefs, the resource catalog 33 entries, the interview bank 30 questions, and the cheat-sheet library 12 sheets.

The public repository is Are1V/Gata-Science-Roadmap. The workflow and repository-aware URLs are configured and tested locally under the actual repository subpath. GitHub Pages status will be verified after the push.
