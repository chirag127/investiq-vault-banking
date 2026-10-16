import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedDate: z.string(),
    lastVerifiedDate: z.string(),
    author: z.string().default('InvestiQ Banking Quantitative Research Team'),
    tags: z.array(z.string()),
    category: z.enum([
      'Institutional Architecture & Bank Risk',
      'DICGC Deposit Insurance & Statutory Limits',
      'Operating Cash & Auto-Sweep Mechanics',
      'Cooperative vs Scheduled Commercial Bank Risk',
      'Account Operations, Nomination & Fraud Defense'
    ]),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      publisher: z.string(),
      verifiedDate: z.string(),
    })),
  }),
});

export const collections = {
  articles: articlesCollection,
};
