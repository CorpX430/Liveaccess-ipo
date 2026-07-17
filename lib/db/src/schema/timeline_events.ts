import { pgTable, text, serial, boolean, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timelineEventsTable = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEventsTable).omit({ id: true });
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEventsTable.$inferSelect;
