import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "application_submitted" | "status_updated" | "allocation_confirmed"
  message: text("message").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("info"), // info | success | warning | error
  amount: numeric("amount", { precision: 18, scale: 2 }),
});

export const insertActivityLogSchema = createInsertSchema(activityLogTable).omit({ id: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;
