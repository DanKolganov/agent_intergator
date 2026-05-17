import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { AgentCard } from "@/components/AgentCard";
import { useAgents } from "@/hooks/use-agents";
import { useAuth } from "@/hooks/use-auth";
import { Search, Star, Globe, Plus, X, MessageCircle } from "lucide-react";
import AddAgentModal from "@/components/AddAgentModal";

type Tab = "free" | "team";
type BusinessType =
  | "all"
  | "hospitality"
  | "restaurant"
  | "retail"
  | "rental"
  | "service";
type PainPoint =
  | "all"
  | "customers"
  | "marketing"
  | "finance"
  | "hr"
  | "operations";

const businessTypeMapping = {
  all: "Все типы бизнеса",
  hospitality: "Гостиничный бизнес",
  restaurant: "Рестораны и кафе",
  retail: "Розничная торговля",
  rental: "Арендный бизнес",
  service: "Сервисные услуги",
};

const painPointMapping = {
  all: "Все задачи",
  customers: "Работа с клиентами",
  marketing: "Маркетинг",
  finance: "Финансы",
  hr: "HR и персонал",
  operations: "Операционная деятельность",
};

function parseAgentsSearch(location: string) {
  const qs = location.split("?")[1] || "";
  const params = new URLSearchParams(qs);
  return {
    tab: (params.get("tab") === "team" ? "team" : "free") as Tab,
    business: (params.get("business") as BusinessType) || "all",
    task: (params.get("task") as PainPoint) || "all",
    tag: params.get("tag") || "",
    q: params.get("q") || "",
  };
}

function buildAgentsPath(opts: {
  tab: Tab;
  business?: BusinessType;
  task?: PainPoint;
  tag?: string;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("tab", opts.tab);
  if (opts.business && opts.business !== "all")
    params.set("business", opts.business);
  if (opts.task && opts.task !== "all") params.set("task", opts.task);
  if (opts.tag) params.set("tag", opts.tag);
  if (opts.q) params.set("q", opts.q);
  return `/agents?${params.toString()}`;
}

export default function Agents() {
  const { data: agents, isLoading, error } = useAgents();
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const urlState = useMemo(() => parseAgentsSearch(location), [location]);
  const [tab, setTab] = useState<Tab>(urlState.tab);
  const [businessType, setBusinessType] = useState<BusinessType>(
    Object.keys(businessTypeMapping).includes(urlState.business)
      ? urlState.business
      : "all",
  );
  const [painPoint, setPainPoint] = useState<PainPoint>(
    Object.keys(painPointMapping).includes(urlState.task)
      ? urlState.task
      : "all",
  );
  const [search, setSearch] = useState(urlState.q);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    urlState.tag ? [urlState.tag] : [],
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInitial, setAddInitial] = useState<any>(null);

  useEffect(() => {
    const parsed = parseAgentsSearch(location);
    setTab(parsed.tab);
    if (Object.keys(businessTypeMapping).includes(parsed.business))
      setBusinessType(parsed.business);
    if (Object.keys(painPointMapping).includes(parsed.task))
      setPainPoint(parsed.task);
    setSearch(parsed.q);
    setSelectedTags(parsed.tag ? [parsed.tag] : []);
  }, [location]);

  const pushUrl = useCallback(
    (patch: Partial<{
      tab: Tab;
      business: BusinessType;
      task: PainPoint;
      tag: string;
      q: string;
    }>) => {
      const next = {
        tab: patch.tab ?? tab,
        business: patch.business ?? businessType,
        task: patch.task ?? painPoint,
        tag: patch.tag !== undefined ? patch.tag : selectedTags[0] || "",
        q: patch.q !== undefined ? patch.q : search,
      };
      setLocation(
        buildAgentsPath({
          tab: next.tab,
          business: next.business,
          task: next.task,
          tag: next.tag,
          q: next.q,
        }),
      );
    },
    [tab, businessType, painPoint, selectedTags, search, setLocation],
  );

  const allTags = useMemo(() => {
    if (!agents) return [];
    const tagSet = new Set<string>();
    agents
      .filter((a) => (tab === "team" ? a.isTeamSolution : !a.isTeamSolution))
      .forEach((a) => a.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [agents, tab]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    return agents.filter((agent) => {
      if (tab === "team" && !agent.isTeamSolution) return false;
      if (tab === "free" && agent.isTeamSolution) return false;

      if (
        search &&
        !agent.name.toLowerCase().includes(search.toLowerCase()) &&
        !agent.description.toLowerCase().includes(search.toLowerCase()) &&
        !agent.industry.toLowerCase().includes(search.toLowerCase()) &&
        !agent.tags?.some((t) =>
          t.toLowerCase().includes(search.toLowerCase()),
        )
      )
        return false;

      if (
        selectedTags.length > 0 &&
        !selectedTags.every((t) => agent.tags?.includes(t))
      )
        return false;

      if (businessType !== "all") {
        const businessKeywords: Record<string, string[]> = {
          hospitality: [
            "отель",
            "гостиница",
            "хостел",
            "апартаменты",
            "бронирование",
          ],
          restaurant: ["ресторан", "кафе", "бар", "столовая", "еда", "кухня"],
          retail: ["магазин", "товар", "продажа", "торговля", "продукты", "ритейл"],
          rental: ["аренда", "прокат", "имущество", "жилье", "транспорт"],
          service: ["услуга", "сервис", "консультация", "ремонт", "помощь"],
        };
        const keywords = businessKeywords[businessType];
        const hasBusinessType = keywords.some(
          (keyword) =>
            agent.name.toLowerCase().includes(keyword) ||
            agent.description.toLowerCase().includes(keyword) ||
            agent.industry.toLowerCase().includes(keyword) ||
            agent.tags?.some((tag) => tag.toLowerCase().includes(keyword)),
        );
        if (!hasBusinessType) return false;
      }

      if (painPoint !== "all") {
        const painKeywords: Record<string, string[]> = {
          customers: [
            "клиент",
            "покупатель",
            "обслуживание",
            "поддержка",
            "общение",
            "чат-бот",
          ],
          marketing: [
            "маркетинг",
            "реклама",
            "продвижение",
            "контент",
            "seo",
            "соцсети",
          ],
          finance: [
            "финансы",
            "деньги",
            "бюджет",
            "отчетность",
            "аналитика",
            "налоги",
            "бухгалтер",
          ],
          hr: [
            "персонал",
            "сотрудник",
            "кадры",
            "найм",
            "обучение",
            "адаптация",
            "hr",
          ],
          operations: [
            "операции",
            "процессы",
            "автоматизация",
            "документы",
            "учет",
            "склад",
            "заказы",
          ],
        };
        const keywords = painKeywords[painPoint];
        const hasPainPoint = keywords.some(
          (keyword) =>
            agent.name.toLowerCase().includes(keyword) ||
            agent.description.toLowerCase().includes(keyword) ||
            agent.tags?.some((tag) => tag.toLowerCase().includes(keyword)),
        );
        if (!hasPainPoint) return false;
      }

      return true;
    });
  }, [agents, tab, search, selectedTags, businessType, painPoint]);

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(next);
    pushUrl({ tag: next[0] || "", tab: "free" });
  };

  const gridContent = (
    <>
      {isLoading ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse"
            >
              <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-600 rounded-2xl mb-6" />
              <motion.div className="h-6 bg-slate-200 dark:bg-slate-600 rounded-md w-2/3 mb-4" />
              <motion.div className="h-4 bg-slate-200 dark:bg-slate-600 rounded-md w-1/3 mb-6" />
            </div>
          ))}
        </motion.div>
      ) : error ? (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-red-100 dark:border-red-900/20">
          <p className="text-red-500 dark:text-red-400 font-medium mb-2">
            Не удалось загрузить агентов.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Проверьте подключение к базе данных (DATABASE_URL в .env).
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-2">
            {tab === "team"
              ? "Пока нет наших решений по выбранным фильтрам."
              : "Ничего не найдено по фильтрам."}
          </p>
          {tab === "free" && selectedTags.length > 0 && (
            <button
              onClick={() => {
                setSelectedTags([]);
                pushUrl({ tag: "" });
              }}
              className="mt-4 text-primary font-medium text-sm hover:underline"
            >
              Сбросить теги
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={
              tab + selectedTags.join() + search + businessType + painPoint
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filtered.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
              >
                <AgentCard
                  agent={agent}
                  onTagClick={(tag) => {
                    setTab("free");
                    setSelectedTags([tag]);
                    pushUrl({ tab: "free", tag });
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="flex-grow pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-3">
                {tab === "free"
                  ? "Бесплатные AI-решения"
                  : "Наши решения"}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {tab === "free"
                  ? "Бесплатные инструменты с открытым доступом и наши бесплатные предложения для автоматизации бизнеса."
                  : "Кастомные AI-решения от нашей команды под задачи вашего бизнеса."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isAuthenticated && tab === "team" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Добавить агента
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-2xl w-fit mb-8">
            <button
              onClick={() => {
                setTab("free");
                pushUrl({ tab: "free" });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "free" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
            >
              <Globe size={16} />
              Бесплатные решения
            </button>
            <button
              onClick={() => {
                setTab("team");
                pushUrl({ tab: "team" });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "team" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
            >
              <Star size={16} />
              Наши решения
            </button>
          </div>

          {tab === "team" && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Нужна консультация?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Расскажите о задаче — подберём архитектуру и внедрим
                  кастомного агента под ваш бизнес.
                </p>
              </div>
              <Link
                href="/custom"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shrink-0"
              >
                <MessageCircle size={18} />
                Связаться с нами
              </Link>
            </div>
          )}

          <div className="mb-6">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    pushUrl({ q: search, tab });
                }}
                onBlur={() => pushUrl({ q: search, tab })}
                placeholder={
                  tab === "free"
                    ? "Поиск по бесплатным решениям..."
                    : "Поиск по нашим решениям..."
                }
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
          </div>

          {tab === "free" && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Тип бизнеса
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(businessTypeMapping).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        const v = key as BusinessType;
                        setBusinessType(v);
                        pushUrl({ business: v, tab: "free" });
                      }}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                        businessType === key
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Основные задачи
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(painPointMapping).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        const v = key as PainPoint;
                        setPainPoint(v);
                        pushUrl({ task: v, tab: "free" });
                      }}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                        painPoint === key
                          ? "bg-accent text-white border-accent shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-accent/40 hover:text-accent"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedTags([]);
                        pushUrl({ tag: "", tab: "free" });
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1"
                    >
                      <X size={11} /> Сбросить
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {gridContent}
        </div>
      </main>
      {showAddModal && (
        <AddAgentModal
          initial={addInitial || undefined}
          onClose={() => {
            setShowAddModal(false);
            setAddInitial(null);
          }}
        />
      )}
    </div>
  );
}
