import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    phase: z.number(),
    topicId: z.string(),
    prerequisites: z.array(z.string()),
    resources: z.array(z.string()),
    project: z.string(),
    estimatedHours: z.number(),
    lab: z.enum(['gradient', 'sigmoid', 'vectors']).optional(),
  }),
});
export const collections = { guides };
