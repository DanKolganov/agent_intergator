import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { db } from "./db";
import { knowledgeBase, llmUsage } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

function getLLMClient() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  let baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey) return null;
  // Remove trailing slash to avoid /v1./chat/completions error with Groq
  if (baseURL) {
    baseURL = baseURL.replace(/\/$/, '');
  }
  return new OpenAI({ apiKey, baseURL });
}

function getLLMModel() {
  return process.env.AI_INTEGRATIONS_MODEL || "llama-3.1-8b-instant";
}

const FREE_LLM_REQUESTS = 2;

function getSubjectId(req: any): string {
  const userSub = req?.user?.claims?.sub || req?.session?.user?.claims?.sub;
  if (userSub) return `user:${userSub}`;
  const sid = req?.sessionID;
  if (sid) return `sess:${sid}`;
  // last resort (should be rare)
  return `anon:${req?.ip || "unknown"}`;
}

async function enforceFreeLlmQuota(req: any): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const subjectId = getSubjectId(req);
  const [row] = await db.select().from(llmUsage).where(eq(llmUsage.subjectId, subjectId)).limit(1);
  const used = row?.count ?? 0;
  const remaining = Math.max(0, FREE_LLM_REQUESTS - used);
  return { allowed: used < FREE_LLM_REQUESTS, used, remaining };
}

async function incrementLlmUsage(req: any): Promise<void> {
  const subjectId = getSubjectId(req);
  await db
    .insert(llmUsage)
    .values({ subjectId, count: 1 })
    .onConflictDoUpdate({
      target: llmUsage.subjectId,
      set: {
        count: sql`${llmUsage.count} + 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      },
    });
}

async function searchWikipediaRu(query: string, limit = 3): Promise<Array<{ title: string; snippet: string; url: string }>> {
  try {
    const url = new URL("https://ru.wikipedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("format", "json");
    url.searchParams.set("utf8", "1");
    url.searchParams.set("srlimit", String(limit));
    url.searchParams.set("srsearch", query);

    const res = await fetch(url.toString(), { headers: { "User-Agent": "agent_intergator/1.0" } });
    if (!res.ok) return [];
    const data: any = await res.json();
    const items: any[] = data?.query?.search || [];
    return items.slice(0, limit).map((it) => ({
      title: String(it?.title || "Wikipedia"),
      snippet: String(it?.snippet || "").replace(/<[^>]*>/g, ""),
      url: `https://ru.wikipedia.org/wiki/${encodeURIComponent(String(it?.title || ""))}`,
    }));
  } catch {
    return [];
  }
}

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

  app.post(api.agents.recommend.path, async (req, res) => {
    try {
      const input = api.agents.recommend.input.parse(req.body);
      const limit = input.limit ?? 5;

      const agents = await storage.getAgents();
      const q = input.query.toLowerCase();
      const candidates = agents
        .map(a => ({
          agent: a,
          keywordScore: [
            a.name,
            a.description,
            a.industry,
            a.useCase,
            ...(a.tags ?? []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
            ? 1
            : 0,
        }))
        .sort((a, b) => b.keywordScore - a.keywordScore)
        .slice(0, 30)
        .map(x => x.agent);

      const llm = getLLMClient();
      if (!llm) {
        // Fallback: naive ranking by keywordScore only
        const fallback = candidates.slice(0, limit).map((agent, idx) => ({
          agent,
          score: Math.max(0, 1 - idx * 0.15),
          reason: "Подобрано по совпадению ключевых слов (LLM не настроена).",
        }));
        return res.json({ matches: fallback });
      }

      const quota = await enforceFreeLlmQuota(req);
      if (!quota.allowed) {
        return res.status(402).json({
          message: "Лимит бесплатных запросов исчерпан. Оплатите дополнительные запросы.",
          paywall: true,
          freeLimit: FREE_LLM_REQUESTS,
        });
      }

      const prompt = `
Ты — ассистент каталога AI-агентов. Пользователь описал потребность на русском языке.
Твоя задача: выбрать из списка кандидатов наиболее подходящих агентов и кратко объяснить почему.

Запрос пользователя:
${input.query}

Кандидаты (JSON):
${JSON.stringify(candidates.map(a => ({
  id: a.id,
  name: a.name,
  description: a.description,
  industry: a.industry,
  useCase: a.useCase,
  tags: a.tags ?? [],
})))}

Верни JSON:
{
  "matches": [
    { "id": number, "score": number (0..1), "reason": string }
  ]
}
Правила:
- Выдай максимум ${limit} элементов.
- Ответы только на русском.
- score: чем выше, тем лучше.
`;

      const response = await llm.chat.completions.create({
        model: getLLMModel(),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      await incrementLlmUsage(req);

      const parsed = JSON.parse(response.choices[0]?.message?.content || "{}") as any;
      const ranked: Array<{ id: number; score: number; reason: string }> = Array.isArray(parsed.matches) ? parsed.matches : [];

      const byId = new Map(agents.map(a => [a.id, a] as const));
      const matches = ranked
        .filter(x => typeof x?.id === "number" && byId.has(x.id))
        .slice(0, limit)
        .map(x => ({
          agent: byId.get(x.id)!,
          score: typeof x.score === "number" ? Math.max(0, Math.min(1, x.score)) : 0.5,
          reason: typeof x.reason === "string" ? x.reason : "Подходит под запрос.",
        }));

      res.json({ matches });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to recommend agents" });
    }
  });

  app.post(api.agents.generateDraft.path, async (req, res) => {
    try {
      const input = api.agents.generateDraft.input.parse(req.body);
      const llm = getLLMClient();
      if (!llm) {
        return res.status(500).json({ message: "LLM is not configured (missing AI_INTEGRATIONS_OPENAI_API_KEY)" });
      }

      const quota = await enforceFreeLlmQuota(req);
      if (!quota.allowed) {
        return res.status(402).json({
          message: "Лимит бесплатных запросов исчерпан. Оплатите дополнительные запросы.",
          paywall: true,
          freeLimit: FREE_LLM_REQUESTS,
        });
      }

      const prompt = `
Ты — продуктовый ассистент. Сгенерируй карточку AI-агента для каталога (на русском).
Нужно вернуть строго JSON с полями:
{
  "name": string,
  "description": string,
  "industry": string,
  "useCase": string,
  "tags": string[],
  "imageUrl": string | null,
  "isTeamSolution": boolean
}
Ограничения:
- Коротко и по делу: description 2–4 предложения.
- tags: 3–8 тегов, латиницей, lowercase, слова через дефис (как у нас в UI).
- imageUrl: оставь null.
- isTeamSolution: true (это будет "Our Solution").

Данные бизнеса:
Название: ${input.businessName}
Потребности: ${input.businessNeeds}
`;

      const response = await llm.chat.completions.create({
        model: getLLMModel(),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      await incrementLlmUsage(req);

      const raw = JSON.parse(response.choices[0]?.message?.content || "{}");

      // Normalize + validate against shared insert schema
      const draft = api.agents.create.input.parse({
        name: raw.name,
        description: raw.description,
        industry: raw.industry,
        useCase: raw.useCase,
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        imageUrl: raw.imageUrl ?? "",
        isTeamSolution: raw.isTeamSolution ?? true,
      });

      res.json({ draft });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to generate agent draft" });
    }
  });

  // ─── Knowledge Base (Supabase/Postgres) ───────────────────────────────────

  app.post(api.knowledgeBase.upsert.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.knowledgeBase.upsert.input.parse(req.body);
      // Insert; rely on unique index for (source_url,title) if provided
      await db
        .insert(knowledgeBase)
        .values({
          title: input.title,
          content: input.content,
          sourceUrl: input.sourceUrl ?? null,
          tags: input.tags ?? [],
        })
        .onConflictDoNothing();
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to upsert knowledge base doc" });
    }
  });

  app.post(api.knowledgeBase.ask.path, async (req, res) => {
    try {
      const input = api.knowledgeBase.ask.input.parse(req.body);
      const includeExternal = input.includeExternal ?? true;

      // 1) KB first (priority)
      // IMPORTANT: user said KB is a Supabase table named "agents".
      // In this codebase, "agents" table is our directory. We'll prioritize it as KB as requested.
      const allAgents = await storage.getAgents();
      const q = input.query.toLowerCase();
      const kbAgents = allAgents
        .map((a) => ({
          agent: a,
          score:
            [a.name, a.description, a.industry, a.useCase, ...(a.tags ?? [])]
              .join(" ")
              .toLowerCase()
              .includes(q)
              ? 1
              : 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((x) => x.agent);

      // Optional secondary KB: knowledge_base table (if you keep it)
      const kbDocs = await db
        .select()
        .from(knowledgeBase)
        .where(
          sql`to_tsvector('simple', coalesce(${knowledgeBase.title}, '') || ' ' || coalesce(${knowledgeBase.content}, ''))
              @@ plainto_tsquery('simple', ${input.query})`,
        )
        .limit(4);

      // 2) Optional external snippets (cheap and free example: Wikipedia RU)
      const external = includeExternal ? await searchWikipediaRu(input.query, 3) : [];

      // 3) Recommend agents from directory
      const candidates = allAgents.slice(0, 50).map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        industry: a.industry,
        useCase: a.useCase,
        tags: a.tags ?? [],
      }));

      const llm = getLLMClient();
      if (!llm) {
        const answer =
          kbAgents.length > 0 || kbDocs.length > 0
            ? `Нашёл материалы в базе знаний. Настройте LLM (AI_INTEGRATIONS_OPENAI_API_KEY), чтобы я мог собрать из них готовое решение.`
            : `В базе знаний пока нет релевантных материалов. Добавьте данные и настройте LLM.`;
        return res.json({
          answer,
          citations: [
            ...kbAgents.map((a) => ({ title: a.name, sourceUrl: null })),
            ...kbDocs.map((d) => ({ title: d.title, sourceUrl: d.sourceUrl ?? null })),
          ].slice(0, 8),
          recommendedAgents: [],
        });
      }

      const quota = await enforceFreeLlmQuota(req);
      if (!quota.allowed) {
        return res.status(402).json({
          message: "Лимит бесплатных запросов исчерпан. Оплатите дополнительные запросы.",
          paywall: true,
          freeLimit: FREE_LLM_REQUESTS,
        });
      }

      const prompt = `
Ты — помощник по подбору готовых решений для бизнеса.
Приоритет №1: наша база знаний (KB) в Supabase (таблица agents из каталога) + опционально знания из knowledge_base.
Используй внешние источники только если KB не хватает.
Отвечай на русском. Если нет уверенности — явно скажи и задай 1 уточняющий вопрос.

Запрос пользователя:
${input.query}

База знаний (KB, приоритет) — агенты из каталога:
${JSON.stringify(kbAgents.map((a) => ({
  id: a.id,
  name: a.name,
  description: a.description,
  industry: a.industry,
  useCase: a.useCase,
  tags: a.tags ?? [],
})))}

Доп. база знаний (knowledge_base):
${JSON.stringify(kbDocs.map((d) => ({
  title: d.title,
  content: d.content,
  sourceUrl: d.sourceUrl,
  tags: d.tags ?? [],
})))}

Внешние источники (низкий приоритет):
${JSON.stringify(external)}

Каталог агентов (для подбора готового решения):
${JSON.stringify(candidates)}

Верни JSON:
{
  "answer": string,
  "citations": [{ "title": string, "sourceUrl": string | null }],
  "recommendedAgentIds": number[]
}
Правила:
- citations: только те источники, на которые ты реально опирался (сначала KB).
- recommendedAgentIds: 0..3 id из каталога, которые лучше всего подходят под запрос.
`;

      const response = await llm.chat.completions.create({
        model: getLLMModel(),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      await incrementLlmUsage(req);

      const raw = JSON.parse(response.choices[0]?.message?.content || "{}") as any;
      const ids: number[] = Array.isArray(raw.recommendedAgentIds) ? raw.recommendedAgentIds.filter((x: any) => typeof x === "number") : [];
      const byId = new Map(allAgents.map((a) => [a.id, a] as const));
      const recommendedAgents = ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 3) as any[];

      res.json({
        answer: typeof raw.answer === "string" ? raw.answer : "Не удалось сформировать ответ.",
        citations: Array.isArray(raw.citations)
          ? raw.citations
              .filter((c: any) => c && typeof c.title === "string")
              .slice(0, 8)
              .map((c: any) => ({ title: c.title, sourceUrl: c.sourceUrl ?? null }))
          : [
              ...kbAgents.map((a) => ({ title: a.name, sourceUrl: null })),
              ...kbDocs.map((d) => ({ title: d.title, sourceUrl: d.sourceUrl ?? null })),
              ...external.map((e) => ({ title: e.title, sourceUrl: e.url })),
            ].slice(0, 8),
        recommendedAgents,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to answer from knowledge base" });
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

      const openai = getLLMClient();
      if (!openai) {
        return res.status(503).json({ message: "AI service unavailable" });
      }

      const quota = await enforceFreeLlmQuota(req);
      if (!quota.allowed) {
        await storage.updateCustomRequestStatus(customReq.id, 'completed', "Лимит бесплатных запросов исчерпан. Оплатите дополнительные запросы.", "# No code generated", "# No readme generated");
        return res.status(402).json({
          message: "Лимит бесплатных запросов исчерпан. Оплатите дополнительные запросы.",
          paywall: true,
          freeLimit: FREE_LLM_REQUESTS,
        });
      }

      const followUpCount = customReq.followUpCount || 0;
      const contextData = customReq.contextData ? JSON.parse(customReq.contextData) : [];

      // If too many follow-ups, offer consultation
      if (followUpCount >= 3) {
        const consultationMessage = `На основе предоставленной информации:\n\n${contextData.map((c: any) => `Вопрос: ${c.question}\nОтвет: ${c.answer}`).join('\n\n')}\n\n**Предлагаем вам личную консультацию** с нашим специалистом для детальной проработки решения.\n\nСвяжитесь с нами:\n• Telegram: @your_support\n• Email: support@example.com\n• Телефон: +7 (XXX) XXX-XX-XX\n\nМы поможем создать идеального AI-агента для вашего бизнеса!`;
        
        const updatedReq = await storage.updateCustomRequestStatus(
          customReq.id, 'completed',
          consultationMessage,
          "# Консультация требуется",
          "# README не применим",
          followUpCount,
          customReq.contextData || undefined,
          undefined
        );
        await incrementLlmUsage(req);
        return res.json(updatedReq);
      }

      // First, assess if we have enough context
      const assessmentPrompt = `
        Проанализируй, достаточно ли информации в запросе бизнеса для создания AI-агента.
        ОБЯЗАТЕЛЬНО отвечай на РУССКОМ языке.
        
        Бизнес: ${customReq.businessName}
        Потребности: ${customReq.businessNeeds}
        ${contextData.length > 0 ? `Предыдущие вопросы и ответы:\n${contextData.map((c: any) => `В: ${c.question}\nО: ${c.answer}`).join('\n')}` : ''}
        
        Ответь в формате JSON:
        {
          "hasEnoughContext": true/false,
          "questionToAsk": "конкретный уточняющий вопрос на РУССКОМ языке, если информации недостаточно, или null если достаточно",
          "reasoning": "краткое объяснение на русском"
        }
      `;

      const assessmentResponse = await openai.chat.completions.create({
        model: getLLMModel(),
        messages: [{ role: "user", content: assessmentPrompt }],
        response_format: { type: "json_object" },
      });

      let assessment: any = {};
      try {
        assessment = JSON.parse(assessmentResponse.choices[0]?.message?.content || "{}");
      } catch {
        assessment = { hasEnoughContext: true };
      }

      // If not enough context, ask follow-up question
      if (!assessment.hasEnoughContext && assessment.questionToAsk && followUpCount < 3) {
        const newContextData = [...contextData, { question: assessment.questionToAsk, answer: null }];
        
        const updatedReq = await storage.updateCustomRequestStatus(
          customReq.id, 'needs_clarification',
          undefined, undefined, undefined,
          followUpCount + 1,
          JSON.stringify(newContextData),
          assessment.questionToAsk
        );
        await incrementLlmUsage(req);
        return res.json({
          ...updatedReq,
          needsClarification: true,
          question: assessment.questionToAsk,
          followUpCount: followUpCount + 1
        });
      }

      // Generate final recommendation
      const prompt = `
        У бизнеса следующие детали:
        Название: ${customReq.businessName}
        Потребности: ${customReq.businessNeeds}
        ${contextData.length > 0 ? `Дополнительный контекст из диалога:\n${contextData.map((c: any) => `Вопрос: ${c.question}\nОтвет: ${c.answer}`).join('\n\n')}` : ''}
        
        Задание (ОБЯЗАТЕЛЬНО отвечай на РУССКОМ языке):
        1. Подробная рекомендация по AI-агенту для бизнеса (минимум 3-4 предложения).
        2. Полный Python скрипт (agent.py) реализующий этого агента.
        3. Полный README.md с инструкциями по установке.

        Важно: Верни валидный JSON с этими строковыми полями:
        {
          "recommendation": "строка с подробной рекомендацией на русском...",
          "code": "строка с Python кодом...",
          "readme": "строка с markdown инструкцией на русском..."
        }
        Все значения должны быть строками, не объектами.
      `;

      const response = await openai.chat.completions.create({
        model: getLLMModel(),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      await incrementLlmUsage(req);

      const content = response.choices[0]?.message?.content || "{}";
      let result: any = {};
      try {
        result = JSON.parse(content);
      } catch {
        result = { recommendation: content, code: "# No code generated", readme: "# No readme generated" };
      }
      
      const normalizeToString = (val: any): string => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object") return JSON.stringify(val, null, 2);
        return String(val);
      };
      
      const updatedReq = await storage.updateCustomRequestStatus(
        customReq.id, 'completed',
        normalizeToString(result.recommendation) || "Мы рекомендуем AI-агента для автоматизации ваших бизнес-процессов.",
        normalizeToString(result.code) || "# Код не был сгенерирован",
        normalizeToString(result.readme) || "# README не был сгенерирован",
        followUpCount,
        customReq.contextData || undefined,
        undefined
      );
      res.json(updatedReq);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to analyze request" });
    }
  });

  // Answer follow-up question endpoint
  app.post(api.customRequests.answer.path, async (req, res) => {
    try {
      const customReq = await storage.getCustomRequest(Number(req.params.id));
      if (!customReq) return res.status(404).json({ message: 'Request not found' });

      const { answer } = req.body;
      if (!answer || typeof answer !== 'string') {
        return res.status(400).json({ message: 'Answer is required' });
      }

      // Update context with user's answer
      const contextData = customReq.contextData ? JSON.parse(customReq.contextData) : [];
      const lastEntry = contextData[contextData.length - 1];
      if (lastEntry) {
        lastEntry.answer = answer;
      }

      await storage.updateCustomRequestStatus(
        customReq.id,
        'analyzing',
        undefined, undefined, undefined,
        customReq.followUpCount,
        JSON.stringify(contextData),
        undefined
      );

      // Trigger re-analysis
      res.json({ success: true, message: 'Answer recorded, re-analyzing...' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to record answer" });
    }
  });

  return httpServer;
}
