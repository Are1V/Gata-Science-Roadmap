# Contributing

Small, focused improvements are welcome. Open an issue for a broken video, a better lesson, an incorrect explanation, or a missing topic. Explain the learner's problem and the proposed change.

## Add or update a topic

1. Add a uniquely named topic to `src/data/curriculum.json`. Preserve existing IDs because they identify saved progress and shared links.
2. Add its entry to `src/data/topic-lessons.json`: one short explanation, one reason it matters, prerequisite topic IDs, a primary video ID, a practical task, and an existing project ID. An alternative video is optional.
3. Add a new video to `src/data/videos.json` only if the ID is not already present. Prefer updating one shared catalog record over duplicating metadata.
4. Add a milestone or featured node to `src/data/map.ts` if it helps learners understand progression. Keep prerequisite edges acyclic and specialties independent where appropriate.

Keep the default UI concise. Longer original explanations belong in optional Markdown notes, not in the topic drawer.

## Select a video

Check that the video exists, is free and public, actually teaches the concept, and fits the learner's prerequisites. Review its examples, assumptions, language, and software versions. Prefer a focused lesson over a long course unless the relevant course chapter is clearly identified.

Compare plausible alternatives using topic fit, clarity, technical accuracy, educator expertise, recency when relevant, and available audience feedback. Do not choose only by views, accept the first search result without review, or assume one channel is strongest for every topic. Avoid misleading titles and low-quality generated instruction.

Each video record needs:

- `youtubeId`, title, and channel from the real source;
- difficulty and duration in seconds (`0` means unavailable; the UI omits it);
- a publisher or video `sourceUrl`, ISO `reviewedAt` date, and original `selectionReason`;
- a precise `verification` note describing what was checked.

Optional `viewsAtReview` and `publishedAt` fields must come from actual metadata. Omit unavailable likes, ratings, and durations. Do not invent timestamps. `videoStart` on a lesson must match a published chapter and remain inside the video's duration.

Run `npm run check:videos`. Review the resulting report manually: blocked requests and timeouts are inconclusive, while successful metadata retrieval still does not prove playback in every location. Use the broken-video template for links that cannot be confirmed. Do not silently replace a topic with an unrelated course.

## Development checks

```sh
npm ci
npm run lint
npm run check
npm test
npm run check:videos -- --offline
npm run build
npm run check:links
npx playwright install chromium
npm run test:e2e
```

Check desktop and mobile, light and dark mode, and keyboard operation. For route or asset changes, also build with `BASE_PATH=/Gata-Science-Roadmap/` and run the link and browser checks with that base path.

Describe the change and relevant validation in your pull request. Do not commit credentials, downloaded video content, dependencies, build output, or local progress data. Respect the license and attribution of external teaching material.
