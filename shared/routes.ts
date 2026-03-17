import { z } from 'zod';
import { insertAgentSchema, insertCustomAgentRequestSchema, agents, customAgentRequests } from './schema';

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
