# Gata Science Roadmap

A visual, video-first path through data science. Click a topic, watch a lesson, try a project, and mark it complete.

[Live roadmap](https://are1v.github.io/Gata-Science-Roadmap/) · [Repository](https://github.com/Are1V/Gata-Science-Roadmap)

![Gata Science Roadmap](public/screenshots/home.png)

## Features

- 37 chapters and 636 individually addressable concepts, from Python through career preparation.
- 428 distinct YouTube lessons, stored separately from the UI, with public metadata checks and review provenance.
- A concise topic drawer with prerequisites, a video card, practice, and completion. Mobile uses a bottom sheet.
- Pan, zoom, chapter expansion, subject and difficulty filters, and ten specialization paths.
- Actual mathematical dependency graphs for regression, logistic regression, PCA, neural networks, Naive Bayes, KNN, K-means, and trees.
- 22 project briefs, with project milestones throughout the roadmap.
- Local search, persistent progress, cross-tab updates, progress export, dark mode, and keyboard navigation.
- Optional notes and interactive math labs, collapsed by default.

No account, backend, paid API, or analytics is needed. Progress stays in your browser. Videos open on YouTube without autoplay; their thumbnails load from YouTube when a lesson opens. Some external datasets require a free account.

## Local development

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:4321`. To verify a production build:

```sh
npm run lint
npm run check
npm test
npm run check:videos -- --offline
npm run build
npm run check:links
npx playwright install chromium
npm run test:e2e
```

`npm run preview` serves the built site. The browser tests cover drawers, deep links, history, topic-specific completion, search, filters, mobile layout, keyboard dismissal, accessibility, and storage behavior.

## Content architecture

| File | Purpose |
| --- | --- |
| `src/data/curriculum.json` | Chapters, stable topic IDs, levels, and chapter prerequisites |
| `src/data/topic-lessons.json` | Short explanations, concept prerequisites, video references, and practice |
| `src/data/videos.json` | Deduplicated YouTube metadata and curation evidence |
| `src/data/map.ts` | Visual stages, featured topics, model connections, and project milestones |
| `src/data/learning.ts` | Typed indexes, subject categories, and drawer navigation |
| `src/data/roadmap.ts` | Curriculum indexes, specializations, and legacy guide mappings |
| `src/content/projects/projects.json` | Project briefs and evaluation criteria |
| `src/content/guides/` | Optional Markdown explanations and mathematics |
| `src/hooks/useProgress.ts` | Versioned localStorage progress and cross-tab synchronization |

Astro renders static routes. React islands provide interaction; XYFlow renders graph nodes and edges. TypeScript, Tailwind CSS, Lucide, Markdown/MDX, and KaTeX support the implementation. There are no server routes or secrets.

The topic drawer uses `?topic=TOPIC_ID` on the current page. Global search links to `/roadmap/?topic=TOPIC_ID`. Existing guide URLs and `?concept=` links still work, and existing progress IDs are preserved. The prerequisite graph reads the same concept IDs as the drawer, rather than maintaining a separate set of decorative connections.

## Video curation and verification

Lessons were selected using topic fit, publisher descriptions, teaching format, educator background, and available public metadata. Focused explanations are preferred; relevant chapters of longer practical courses are linked where publisher timestamps were available. Visual mathematics, conceptual statistics, and practical programming use different educators. A second perspective is included only for selected concepts.

The catalog records source URLs, the review date, selection rationale, difficulty, and duration when available. View counts and publication dates are recorded only when returned by YouTube. Likes and audience-feedback scores are not invented. Popularity is supporting evidence, not a ranking formula. “Recommended” means an editorial choice, not an objectively proven best video.

Availability was checked against public YouTube watch metadata or oEmbed. The `verification` field distinguishes the two: oEmbed confirms accessible public metadata, not end-to-end playback in every region. We have not watched every video in full. Course coverage and technical quality still benefit from maintainer review, particularly after library changes. A network timeout must not be treated as proof that a video was deleted.

```sh
npm run check:videos -- --offline  # structural coverage, no network
npm run check:videos              # recheck public metadata, write reports/video-links.json
npm run check:resources           # check other external resource and dataset links
```

The online checker flags unavailable, changed, and unconfirmed records for review; it never silently substitutes a different lesson. Network checks are separate from deployment so rate limits cannot break an otherwise valid release. See [CONTRIBUTING.md](CONTRIBUTING.md) for adding or replacing a video.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` verifies and deploys pushes to `main`. Pull requests run verification without publishing. In the repository's **Settings → Pages**, select **GitHub Actions** as the source.

The workflow derives `SITE_URL`, `BASE_PATH`, and `PUBLIC_REPOSITORY_URL` from the repository. All internal links and assets use the base-aware URL helper. A project repository deploys at `https://OWNER.github.io/REPOSITORY/`; a repository named `OWNER.github.io` uses `/`.

To reproduce a project-path build:

```sh
BASE_PATH=/Gata-Science-Roadmap/ SITE_URL=https://are1v.github.io PUBLIC_REPOSITORY_URL=https://github.com/Are1V/Gata-Science-Roadmap npm run build
BASE_PATH=/Gata-Science-Roadmap/ npm run check:links
BASE_PATH=/Gata-Science-Roadmap/ npm run test:e2e
```

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and the issue templates for broken videos, better resources, topics, and corrections.

Code and original content are MIT licensed. Linked videos, images, datasets, and resources remain their creators' property. Roadmap.sh inspired the exploration pattern; this project's code, branding, writing, and styling are original.
