import { pgTable, serial, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const investorStatusEnum = pgEnum("investor_status", ["pending", "approved", "rejected"]);

export const investorsTable = pgTable("investors", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  status: investorStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvestorSchema = createInsertSchema(investorsTable).omit({
  id: true,
  createdAt: true,
  status: true,
  passwordHash: true,
  emailVerified: true,
  verificationToken: true,
  resetToken: true,
  resetTokenExpires: true,
});
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investorsTable.$inferSelect;
