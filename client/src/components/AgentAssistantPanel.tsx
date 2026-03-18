import { useMemo, useState } from "react";
import { Sparkles, Search, Wand2, Loader2, BookOpen } from "lucide-react";
import { api } from "@shared/routes";
import type { Agent, InsertAgent } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PaywallDialog } from "@/components/PaywallDialog";

type RecommendMatch = { agent: Agent; score: number; reason: string };
type KbAnswer = { answer: string; citations: Array<{ title: string; sourceUrl?: string | null }>; recommendedAgents: Agent[] };

interface Props {
  agents: Agent[] | undefined;
  onOpenAddModal: (initial: Partial<InsertAgent>) => void;
}

export function AgentAssistantPanel({ agents, onOpenAddModal }: Props) {
  const { isAuthenticated } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState<string | undefined>(undefined);
  const [kbQuery, setKbQuery] = useState("");
  const [includeExternal, setIncludeExternal] = useState(true);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbError, setKbError] = useState<string | null>(null);
  const [kbResult, setKbResult] = useState<KbAnswer | null>(null);

  const [findQuery, setFindQuery] = useState("");
  const [finding, setFinding] = useState(false);
  const [matches, setMatches] = useState<RecommendMatch[] | null>(null);
  const [findError, setFindError] = useState<string | null>(null);

  const [bizName, setBizName] = useState("");
  const [bizNeeds, setBizNeeds] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [draft, setDraft] = useState<InsertAgent | null>(null);

  const hasAgents = useMemo(() => (agents?.length ?? 0) > 0, [agents]);

  async function askKnowledgeBase() {
    setKbLoading(true);
    setKbError(null);
    setKbResult(null);
    try {
      const res = await fetch(api.knowledgeBase.ask.path, {
        method: api.knowledgeBase.ask.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(api.knowledgeBase.ask.input.parse({ query: kbQuery, includeExternal })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 402 && err?.paywall) {
          setPaywallMessage(err?.message);
          setPaywallOpen(true);
          return;
        }
        throw new Error(err?.message || "Не удалось выполнить поиск решения");
      }
      const data = await res.json();
      const parsed = api.knowledgeBase.ask.responses[200].parse(data);
      setKbResult(parsed);
    } catch (e: any) {
      setKbError(e?.message || "Ошибка");
    } finally {
      setKbLoading(false);
    }
  }

  async function recommend() {
    setFinding(true);
    setFindError(null);
    setMatches(null);
    try {
      const res = await fetch(api.agents.recommend.path, {
        method: api.agents.recommend.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(api.agents.recommend.input.parse({ query: findQuery, limit: 5 })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 402 && err?.paywall) {
          setPaywallMessage(err?.message);
          setPaywallOpen(true);
          return;
        }
        throw new Error(err?.message || "Не удалось подобрать агентов");
      }
      const data = await res.json();
      const parsed = api.agents.recommend.responses[200].parse(data);
      setMatches(parsed.matches);
    } catch (e: any) {
      setFindError(e?.message || "Ошибка при подборе");
    } finally {
      setFinding(false);
    }
  }

  async function generateDraft() {
    setGenerating(true);
    setGenError(null);
    setDraft(null);
    try {
      const res = await fetch(api.agents.generateDraft.path, {
        method: api.agents.generateDraft.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(api.agents.generateDraft.input.parse({ businessName: bizName, businessNeeds: bizNeeds })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 402 && err?.paywall) {
          setPaywallMessage(err?.message);
          setPaywallOpen(true);
          return;
        }
        throw new Error(err?.message || "Не удалось сгенерировать черновик");
      }
      const data = await res.json();
      const parsed = api.agents.generateDraft.responses[200].parse(data);
      setDraft(parsed.draft);
    } catch (e: any) {
      setGenError(e?.message || "Ошибка при генерации");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} message={paywallMessage} />
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-slate-900/10 flex items-center justify-center">
            <BookOpen className="text-slate-900" size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-display text-slate-900">Найти готовое решение</h2>
            <p className="text-slate-600 text-sm mt-1">
              Сначала ищу по вашей базе знаний (Supabase), при необходимости добавляю внешние источники.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            value={kbQuery}
            onChange={(e) => setKbQuery(e.target.value)}
            rows={3}
            placeholder='Например: "Как автоматизировать ответы на вопросы клиентов про доставку и возвраты в Telegram + создать тикет в поддержку?"'
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
          />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeExternal}
                onChange={(e) => setIncludeExternal(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Использовать внешние источники (если KB не хватает)
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={askKnowledgeBase}
                disabled={kbLoading || kbQuery.trim().length < 3}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {kbLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Найти решение
              </button>
              {kbError && <span className="text-sm text-red-600">{kbError}</span>}
            </div>
          </div>
        </div>

        {kbResult && (
          <div className="mt-6 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="whitespace-pre-wrap text-sm text-slate-800">{kbResult.answer}</div>
            </div>

            {kbResult.citations?.length > 0 && (
              <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                <div className="text-sm font-semibold text-slate-900 mb-2">Источники</div>
                <div className="space-y-1">
                  {kbResult.citations.map((c, idx) => (
                    <div key={idx} className="text-sm text-slate-700">
                      {c.sourceUrl ? (
                        <a className="underline hover:text-primary" href={c.sourceUrl} target="_blank" rel="noreferrer">
                          {c.title}
                        </a>
                      ) : (
                        c.title
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kbResult.recommendedAgents?.length > 0 && (
              <div className="p-5 rounded-2xl border border-slate-100 bg-white">
                <div className="text-sm font-semibold text-slate-900 mb-3">Готовые решения из каталога</div>
                <div className="space-y-3">
                  {kbResult.recommendedAgents.map((a) => (
                    <div key={a.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="font-semibold text-slate-900">{a.name}</div>
                      <div className="text-sm text-slate-700 mt-1">{a.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Search className="text-primary" size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-display text-slate-900">Подобрать подходящего агента</h2>
            <p className="text-slate-600 text-sm mt-1">
              Опишите задачу (на русском). Я верну несколько лучших вариантов из каталога.
            </p>
          </div>
        </div>

        {!hasAgents && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 text-sm">
            Каталог агентов пуст — сначала добавьте несколько агентов, чтобы подбор имел смысл.
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            rows={3}
            placeholder='Например: "Нужен агент, который будет отвечать на вопросы клиентов про доставку и возвраты, и создавать тикеты в поддержку."'
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={recommend}
              disabled={finding || findQuery.trim().length < 3 || !hasAgents}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finding ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Подобрать
            </button>
            {findError && <span className="text-sm text-red-600">{findError}</span>}
          </div>
        </div>

        {matches && (
          <div className="mt-6 space-y-3">
            {matches.length === 0 ? (
              <div className="text-sm text-slate-600">Не нашёл хороших совпадений — попробуйте уточнить запрос.</div>
            ) : (
              matches.map((m) => (
                <div key={m.agent.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{m.agent.name}</div>
                      <div className="text-sm text-slate-600 mt-1">{m.reason}</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1">
                      score {(m.score ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Wand2 className="text-accent" size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-display text-slate-900">Сгенерировать агента под бизнес</h2>
            <p className="text-slate-600 text-sm mt-1">
              Я сгенерирую черновик карточки агента. Затем вы сможете сохранить его в каталог.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Название бизнеса</label>
            <input
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="Например: Доставка цветов Blossom"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Потребности</label>
            <textarea
              value={bizNeeds}
              onChange={(e) => setBizNeeds(e.target.value)}
              rows={4}
              placeholder="Опишите процессы/боль/что автоматизировать (пара абзацев)."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={generateDraft}
            disabled={generating || bizName.trim().length < 1 || bizNeeds.trim().length < 10}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Сгенерировать черновик
          </button>
          {genError && <span className="text-sm text-red-600">{genError}</span>}
        </div>

        {draft && (
          <div className="mt-6 p-5 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="font-semibold text-slate-900">{draft.name}</div>
            <div className="text-sm text-slate-700">{draft.description}</div>
            <div className="text-xs text-slate-600">
              {draft.industry} · {draft.useCase}
            </div>
            {(draft.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {(draft.tags ?? []).map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 flex items-center gap-3">
              <button
                onClick={() => onOpenAddModal(draft)}
                disabled={!isAuthenticated}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить в каталог
              </button>
              {!isAuthenticated && (
                <span className="text-sm text-slate-600">Войдите, чтобы сохранить агента.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

