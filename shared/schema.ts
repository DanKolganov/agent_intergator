import { pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Re-export auth models (sessions + users tables for Replit Auth)
export * from "./models/auth";

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(),
  useCase: text("use_case").notNull(),
  tags: text("tags").array().default([]).notNull(),
  imageUrl: text("image_url"),
  isTeamSolution: boolean("is_team_solution").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const customAgentRequests = pgTable("custom_agent_requests", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  businessNeeds: text("business_needs").notNull(),
  status: text("status").notNull().default('pending'),
  recommendation: text("recommendation"),
  generatedCode: text("generated_code"),
  generatedReadme: text("generated_readme"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const viewHistory = pgTable("view_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  agentId: serial("agent_id").notNull(),
  viewedAt: timestamp("viewed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true });
export const insertCustomAgentRequestSchema = createInsertSchema(customAgentRequests).omit({
  id: true,
  createdAt: true,
  status: true,
  recommendation: true,
  generatedCode: true,
  generatedReadme: true,
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type CustomAgentRequest = typeof customAgentRequests.$inferSelect;
export type InsertCustomAgentRequest = z.infer<typeof insertCustomAgentRequestSchema>;
export type ViewHistory = typeof viewHistory.$inferSelect;
