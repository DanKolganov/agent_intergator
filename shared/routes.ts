import { z } from 'zod';
import { insertAgentSchema, insertCustomAgentRequestSchema, insertKnowledgeBaseSchema, agents, customAgentRequests } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents' as const,
      responses: {
        200: z.array(z.custom<typeof agents.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/agents/:id' as const,
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/agents' as const,
      input: insertAgentSchema,
      responses: {
        201: z.custom<typeof agents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    recommend: {
      method: 'POST' as const,
      path: '/api/agents/recommend' as const,
      input: z.object({
        query: z.string().min(3),
        limit: z.number().int().min(1).max(10).optional(),
      }),
      responses: {
        200: z.object({
          matches: z.array(z.object({
            agent: z.custom<typeof agents.$inferSelect>(),
            score: z.number().min(0).max(1),
            reason: z.string(),
          })),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    generateDraft: {
      method: 'POST' as const,
      path: '/api/agents/generate-draft' as const,
      input: z.object({
        businessName: z.string().min(1),
        businessNeeds: z.string().min(10),
      }),
      responses: {
        200: z.object({
          draft: insertAgentSchema,
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  knowledgeBase: {
    upsert: {
      method: 'POST' as const,
      path: '/api/knowledge-base/upsert' as const,
      input: insertKnowledgeBaseSchema.extend({
        // optional stable key pattern: allow client-side de-dupe by URL+title
        sourceUrl: z.string().url().optional().nullable(),
      }),
      responses: {
        200: z.object({ ok: z.boolean() }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    ask: {
      method: 'POST' as const,
      path: '/api/knowledge-base/ask' as const,
      input: z.object({
        query: z.string().min(3),
        includeExternal: z.boolean().optional(),
      }),
      responses: {
        200: z.object({
          answer: z.string(),
          citations: z.array(z.object({
            title: z.string(),
            sourceUrl: z.string().nullable().optional(),
          })),
          recommendedAgents: z.array(z.custom<typeof agents.$inferSelect>()),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  customRequests: {
    create: {
      method: 'POST' as const,
      path: '/api/custom-requests' as const,
      input: insertCustomAgentRequestSchema,
      responses: {
        201: z.custom<typeof customAgentRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/custom-requests/:id' as const,
      responses: {
        200: z.custom<typeof customAgentRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/custom-requests/:id/analyze' as const,
      responses: {
        200: z.custom<typeof customAgentRequests.$inferSelect>(),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
    answer: {
      method: 'POST' as const,
      path: '/api/custom-requests/:id/answer' as const,
      input: z.object({
        answer: z.string().min(1),
      }),
      responses: {
        200: z.custom<typeof customAgentRequests.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
  },
  viewHistory: {
    record: {
      method: 'POST' as const,
      path: '/api/view-history' as const,
      responses: { 200: z.object({ ok: z.boolean() }) },
    },
    list: {
      method: 'GET' as const,
      path: '/api/view-history' as const,
      responses: { 200: z.array(z.custom<typeof agents.$inferSelect>()) },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
