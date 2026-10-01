# Video-first redesign verification

Checked on 2026-10-01 in Chromium on Linux.

## Passing checks

- `npm run lint`: no lint errors.
- `npm run check`: 45 source/config files; zero errors, warnings, or hints.
- `npm test`: 10 content tests covering topic/video coverage, unique IDs, valid references, project milestones, preserved guide aliases, and acyclic prerequisites.
- `npm run check:videos -- --offline`: all 636 topics reference valid catalog records.
- Production build: 68 static HTML pages.
- Project-path link check: 2,023 internal page, fragment, and asset references validated under `/Gata-Science-Roadmap/`.
- Project-path browser suite: all 16 tests passed, including automated WCAG A/AA checks on representative light/dark pages and open mobile drawers.

Browser coverage includes search, filters, keyboard dismissal, topic-specific completion, page reloads, prerequisite navigation, browser history, legacy `?concept=` aliases, cross-tab progress, project milestones, graph zoom, math connections, mobile navigation, horizontal overflow, and optional interactive labs. Video cards use external links and never create autoplaying players.

Screenshots in `public/screenshots/` show the homepage, dependency graph, desktop video drawer, and mobile dark drawer. Thumbnail loading was checked before capturing the video screenshots.

## Content and availability limits

The curriculum includes 37 chapters, 636 concise topic lessons, 428 unique video records, and 22 project briefs. Longer original Markdown notes are optional and collapsed by default.

Video selection used publisher indexes, public titles/descriptions, chapter lists, educator context, and available metadata. Individual catalog records distinguish watch-page metadata from oEmbed verification. Public metadata does not prove playback in every region, and not every lesson was watched in full. Unavailable durations and engagement statistics are omitted rather than invented.

`video-links.json` records successful public-metadata checks for all 428 current video records. One access-error record was replaced and rechecked. `resource-links.json` records successful checks for all 48 other resource and dataset URLs. The Python tutorial uses its explicit index URL after the directory URL returned HTTP 503. Neither network report establishes complete teaching quality or guarantees future availability. Maintainers can update one shared video record and use the new broken-video and better-video issue templates for review.

Automated accessibility checks do not replace comprehensive assistive-technology testing.
