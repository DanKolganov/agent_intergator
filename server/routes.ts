import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";

async function seedDatabase() {
  const existingAgents = await storage.getAgents();
  if (existingAgents.length === 0) {
    await storage.createAgent({
      name: "Customer Support Hero",
      description: "A 24/7 AI agent that handles tier-1 customer inquiries, refunds, and FAQs automatically.",
      industry: "E-commerce",
      useCase: "Customer Support",
      tags: ["support", "chat", "automation"],
      imageUrl: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=800&q=80",
      isTeamSolution: false,
    });
    await storage.createAgent({
      name: "Data Analyst Pro",
      description: "Connects to your database and answers natural language questions about your metrics and KPIs.",
      industry: "Finance",
      useCase: "Analytics",
      tags: ["analytics", "data", "reporting"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      isTeamSolution: false,
    });
    await storage.createAgent({
      name: "Lead Generation Specialist",
      description: "Engages website visitors, qualifies them, and books meetings on your calendar automatically.",
      industry: "B2B Services",
      useCase: "Sales",
      tags: ["sales", "leads", "crm"],
      imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80",
      isTeamSolution: false,
    });
    await storage.createAgent({
      name: "HR Onboarding Assistant",
      description: "Guides new employees through onboarding, answers HR questions, and collects required documents.",
      industry: "Human Resources",
      useCase: "HR Automation",
      tags: ["hr", "onboarding", "automation"],
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
      isTeamSolution: false,
    });
    // Team solution example
    await storage.createAgent({
      name: "RetailBot v2",
      description: "Our flagship retail automation agent. Handles inventory alerts, order tracking, and customer notifications in real time.",
      industry: "Retail",
      useCase: "Operations",
      tags: ["retail", "inventory", "notifications", "automation"],
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      isTeamSolution: true,
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth MUST be set up first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed DB on startup
  seedDatabase().catch(console.error);

  // ─── Agents ──────────────────────────────────────────────────────────────

  app.get(api.agents.list.path, async (req, res) => {
    const list = await storage.getAgents();
    res.json(list);
  });

  app.get(api.agents.get.path, async (req, res) => {
    const agent = await storage.getAgent(Number(req.params.id));
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  });

  app.post(api.agents.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.agents.create.input.parse(req.body);
      const created = await storage.createAgent(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // ─── View History ─────────────────────────────────────────────────────────

  app.post(api.viewHistory.record.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { agentId } = req.body;
    if (!agentId) return res.status(400).json({ message: 'agentId required' });
    await storage.recordView(userId, Number(agentId));
    res.json({ ok: true });
  });

  app.get(api.viewHistory.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const history = await storage.getViewHistory(userId);
    res.json(history);
  });

  // ─── Custom Requests ──────────────────────────────────────────────────────

  app.post(api.customRequests.create.path, async (req, res) => {
    try {
      const input = api.customRequests.create.input.parse(req.body);
      const created = await storage.createCustomRequest(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.customRequests.get.path, async (req, res) => {
    const customReq = await storage.getCustomRequest(Number(req.params.id));
    if (!customReq) return res.status(404).json({ message: 'Request not found' });
    res.json(customReq);
  });

  app.post(api.customRequests.analyze.path, async (req, res) => {
    try {
      const customReq = await storage.getCustomRequest(Number(req.params.id));
      if (!customReq) return res.status(404).json({ message: 'Request not found' });

      await storage.updateCustomRequestStatus(customReq.id, 'analyzing');

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const prompt = `
        A business has the following details:
        Name: ${customReq.businessName}
        Needs: ${customReq.businessNeeds}
        
        Task:
        1. Provide a recommendation for what kind of AI Agent they need and how it can help them.
        2. Generate a Python script (agent.py) that implements a basic version of this agent using OpenAI.
        3. Generate a README.md explaining how to install dependencies and run this agent.

        Respond in JSON format:
        {
          "recommendation": "...",
          "code": "...",
          "readme": "..."
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      const updatedReq = await storage.updateCustomRequestStatus(
        customReq.id, 'completed',
        result.recommendation || "We recommend a custom workflow agent.",
        result.code || "# No code generated",
        result.readme || "# No readme generated",
      );
      res.json(updatedReq);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to analyze request" });
    }
  });

  return httpServer;
}
