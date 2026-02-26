import { z } from "zod";
import { insertEventSchema, updateEventSchema, events } from "./schema";

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
  })
};

const eventResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.date(),
  endDate: z.date().nullable(),
  isAllDay: z.boolean(),
  color: z.string(),
});

export const api = {
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(eventResponseSchema),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: eventResponseSchema,
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/events/:id' as const,
      input: updateEventSchema,
      responses: {
        200: eventResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  }
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
