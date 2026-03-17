import { db } from "./db";
import {
  agents, customAgentRequests, viewHistory,
  type Agent,
  type InsertAgent,
  type CustomAgentRequest,
  type InsertCustomAgentRequest,
  type ViewHistory,
} from "@shared/schema";
import { eq, desc, inArray } from "drizzle-orm";

export interface IStorage {
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;

  getCustomRequests(): Promise<CustomAgentRequest[]>;
  getCustomRequest(id: number): Promise<CustomAgentRequest | undefined>;
  createCustomRequest(req: InsertCustomAgentRequest): Promise<CustomAgentRequest>;
  updateCustomRequestStatus(id: number, status: string, recommendation?: string, generatedCode?: string, generatedReadme?: string): Promise<CustomAgentRequest>;

  recordView(userId: string, agentId: number): Promise<void>;
  getViewHistory(userId: string): Promise<Agent[]>;
}

export class DatabaseStorage implements IStorage {
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [created] = await db.insert(agents).values(agent).returning();
    return created;
  }

  async getCustomRequests(): Promise<CustomAgentRequest[]> {
    return await db.select().from(customAgentRequests);
  }

  async getCustomRequest(id: number): Promise<CustomAgentRequest | undefined> {
    const [req] = await db.select().from(customAgentRequests).where(eq(customAgentRequests.id, id));
    return req;
  }

  async createCustomRequest(req: InsertCustomAgentRequest): Promise<CustomAgentRequest> {
    const [created] = await db.insert(customAgentRequests).values(req).returning();
    return created;
  }

  async updateCustomRequestStatus(id: number, status: string, recommendation?: string, generatedCode?: string, generatedReadme?: string): Promise<CustomAgentRequest> {
    const updateData: any = { status };
    if (recommendation !== undefined) updateData.recommendation = recommendation;
    if (generatedCode !== undefined) updateData.generatedCode = generatedCode;
    if (generatedReadme !== undefined) updateData.generatedReadme = generatedReadme;

    const [updated] = await db.update(customAgentRequests)
      .set(updateData)
      .where(eq(customAgentRequests.id, id))
      .returning();
    return updated;
  }

  async recordView(userId: string, agentId: number): Promise<void> {
    await db.insert(viewHistory).values({ userId, agentId }).onConflictDoNothing();
  }

  async getViewHistory(userId: string): Promise<Agent[]> {
    const rows = await db
      .select({ agentId: viewHistory.agentId, viewedAt: viewHistory.viewedAt })
      .from(viewHistory)
      .where(eq(viewHistory.userId, userId))
      .orderBy(desc(viewHistory.viewedAt))
      .limit(20);

    if (rows.length === 0) return [];

    const agentIds = [...new Set(rows.map(r => r.agentId))];
    return await db.select().from(agents).where(inArray(agents.id, agentIds));
  }
}

export const storage = new DatabaseStorage();
