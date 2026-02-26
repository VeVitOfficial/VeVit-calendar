import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  isAllDay: boolean("is_all_day").default(false).notNull(),
  color: text("color").default("primary").notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const updateEventSchema = insertEventSchema.partial();

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
