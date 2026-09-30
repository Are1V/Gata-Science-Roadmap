# Contributing to Gata Science Roadmap

Make a small, coherent change and explain how you checked it. Content contributions are just as valuable as code.

## Development

Use Node 22.12+ and `npm ci`. Start the site with `npm run dev`. Run `npm run lint`, `npm run check`, `npm test`, and `npm run build` before opening a pull request. For interactive changes, run `npm run test:e2e` after building. Check mobile, keyboard navigation, and both themes.

## Add a curriculum concept

1. Edit the appropriate chapter in `src/data/curriculum.json`.
2. Add a topic with a stable unique ID, readable title, and `kind`: `core`, `recommended`, `optional`, or `advanced`.
3. IDs use `<phase-number>-<concept-slug>`. Preserve existing IDs; learners' saved progress refers to them.
4. Update the chapter explanation or resource selection if the new concept needs additional context.

Example metadata (choose the actual chapter before adding it):

```json
{ "id": "5-convexity", "title": "Convexity", "kind": "recommended" }
```

This automatically updates chapter checklists, search, graph expansion, and progress denominators. Do not edit UI components to add a topic.

## Add a detailed guide

Create `src/content/guides/<slug>.md`. Use this frontmatter structure:

```yaml
title: Convexity and optimization
description: How the shape of an objective changes what optimization can guarantee.
phase: 5
topicId: 5-convexity
prerequisites: [derivatives, gradient-descent]
resources: [calculus]
project: house-prices
estimatedHours: 3
```

Use these sections: What is it?, Why does it matter?, Intuition, Mathematics, Example, Python / From Scratch, Using a Library, Common Mistakes, Interview Questions, and Exercises. Include three or more substantive interview prompts. The page automatically adds clickable prerequisites, the project, free resources, and a completion control. An optional `lab` can select an existing `gradient`, `sigmoid`, or `vectors` demonstration.

Write inline math between `$` and display math between `$$`. Include units, dimensions, assumptions, and numerical examples. Show the connection to an actual ML method. Explain numerical stability and where a simple educational implementation stops being suitable for real use.

Add the concept-to-guide mapping to `deepGuides` in `src/data/roadmap.ts`. A guide's `prerequisites` refer to other **guide IDs**, not phase numbers. Tests catch missing references and cycles. The page route and mathematical graph are generated from the collection.

The guide should make a real addition to the library. Do not generate pages that merely repeat a title and a generic definition. If no guide is authored yet, retain the honest curriculum entry linked to the chapter resources.

## Add a resource

Add a record to `src/content/resources/resources.json` with `id`, `title`, `provider`, `url`, and `type` (`Documentation`, `Course`, `Book`, or `Paper`). Prefer HTTPS links to official documentation, universities, or reputable free textbooks. Verify that the educational content is available without payment. Optional paid certificates are acceptable; paid-only lessons are not.

Reference its ID in chapter `resourceIds` or guide `resources`. Run `npm run check:resources` and inspect `reports/resource-links.json`. A status code alone cannot confirm educational quality or future availability, so open the material and check its relevance too.

## Add a project

Edit `src/content/projects/projects.json`. Include a stable `id`, `title`, `level`, numeric chapter `prerequisites`, `problem`, `dataset`, `datasetUrl`, `objectives`, `output`, `evaluation`, and suggested `structure`. Provide an actual accessible dataset, mention any free account requirement, define a baseline and evaluation strategy, and avoid full solutions.

Use the same convention for project completion IDs: `project-<id>`. The library, global search, and chapter associations update automatically.

## Change roadmap structure

Chapter `prerequisites` refer to earlier phase numbers and generate visible edges. `specializations` in `src/data/roadmap.ts` selects relevant chapters after the common initial foundation. Lesson frontmatter generates the separate mathematical dependency view.

Avoid cycles and unclear implied dependencies. Optionality describes curriculum priority, not permission to ignore a real prerequisite. Keep labels concise and check that expanded branches remain navigable.

## Correct content

Name the page or concept, explain the issue, cite a primary source when possible, and provide a corrected explanation with assumptions. Distinguish factual errors from alternate notation or pedagogical preferences. Never imply that correlation or a model explanation establishes causation.

## Review checklist

- Accurate math, working links, and meaningful exercises.
- Existing progress IDs preserved.
- No copyrighted textbook passages or copied branding.
- No fake statistics or invented public URLs.
- Types, lint, content tests, build, and relevant browser tests pass.
- No secrets, large datasets, environment files, or generated build files in the change.
