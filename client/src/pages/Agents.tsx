import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AgentCard } from "@/components/AgentCard";
import { useAgents } from "@/hooks/use-agents";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Search, Star, Globe, Plus, X, Sparkles } from "lucide-react";
import AddAgentModal from "@/components/AddAgentModal";
import { AgentAssistantPanel } from "@/components/AgentAssistantPanel";

type Tab = "find" | "free" | "team";
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

export default function Agents() {
  const { data: agents, isLoading, error } = useAgents();
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  const [tab, setTab] = useState<Tab>("find");
  const [businessType, setBusinessType] = useState<BusinessType>("all");
  const [painPoint, setPainPoint] = useState<PainPoint>("all");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInitial, setAddInitial] = useState<any>(null);

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

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const business = params.get("business") as BusinessType;
    const task = params.get("task") as PainPoint;

    if (business && Object.keys(businessTypeMapping).includes(business)) {
      setBusinessType(business);
      setTab("free");
    }
    if (task && Object.keys(painPointMapping).includes(task)) {
      setPainPoint(task);
      setTab("free");
    }
  }, [location]);

  const allTags = useMemo(() => {
    if (!agents) return [];
    const tagSet = new Set<string>();
    agents.forEach((a) => a.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [agents]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    return agents.filter((agent) => {
      if (tab === "team" && !agent.isTeamSolution) return false;
      if (tab === "free" && agent.isTeamSolution) return false;

      if (
        search &&
        !agent.name.toLowerCase().includes(search.toLowerCase()) &&
        !agent.description.toLowerCase().includes(search.toLowerCase()) &&
        !agent.industry.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (
        selectedTags.length > 0 &&
        !selectedTags.every((t) => agent.tags?.includes(t))
      )
        return false;

      if (businessType !== "all") {
        const businessKeywords = {
          hospitality: [
            "отель",
            "гостиница",
            "хостел",
            "апартаменты",
            "бронирование",
          ],
          restaurant: ["ресторан", "кафе", "бар", "столовая", "еда", "кухня"],
          retail: ["магазин", "товар", "продажа", "торговля", "продукты"],
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
        const painKeywords = {
          customers: [
            "клиент",
            "покупатель",
            "обслуживание",
            "поддержка",
            "общение",
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
          ],
          hr: [
            "персонал",
            "сотрудник",
            "кадры",
            "найм",
            "обучение",
            "адаптация",
          ],
          operations: [
            "операции",
            "процессы",
            "автоматизация",
            "документы",
            "учет",
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
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="flex-grow pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-3">
                {tab === "find" && "Найти Агента"}
                {tab === "free" && "Бесплатные AI решения"}
                {tab === "team" && "Наши решения"}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {tab === "find" &&
                  "Опишите задачу — подберём идеального AI-агента для вашего бизнеса."}
                {tab === "free" &&
                  "Подбирайте бесплатные AI-инструменты для автоматизации и роста вашего бизнеса."}
                {tab === "team" &&
                  "Готовые решения от нашей команды для вашего бизнеса."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isAuthenticated && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Добавить агента
                </button>
              )}
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по агентам..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-2xl w-fit mb-8">
            <button
              onClick={() => setTab("find")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "find" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
            >
              <Sparkles size={16} />
              Найти Агента
            </button>
            <button
              onClick={() => setTab("free")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "free" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
            >
              <Globe size={16} />
              Бесплатные решения
            </button>
            <button
              onClick={() => setTab("team")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "team" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"}`}
            >
              <Star size={16} />
              Наши решения
            </button>
          </div>

          {tab === "find" ? (
            <AgentAssistantPanel
              agents={agents}
              onOpenAddModal={(initial) => {
                setAddInitial(initial);
                setShowAddModal(true);
              }}
            />
          ) : tab === "free" ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Поиск по бесплатным решениям
                  </h3>
                  <div className="relative flex-grow max-w-md">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по бесплатным агентам..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Тип бизнеса
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(businessTypeMapping).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setBusinessType(key as BusinessType)}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                        businessType === key
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary/40 hover:text-primary"
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
                      onClick={() => setPainPoint(key as PainPoint)}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                        painPoint === key
                          ? "bg-accent text-white border-accent shadow-sm"
                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-accent/40 hover:text-accent"
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
                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1"
                    >
                      <X size={11} /> Clear
                    </button>
                  )}
                </div>
              )}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse"
                    >
                      <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-600 rounded-2xl mb-6" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded-md w-2/3 mb-4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded-md w-1/3 mb-6" />
                      <div className="space-y-2 mb-8">
                        <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded-md w-full" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded-md w-4/5" />
                      </div>
                      <div className="h-10 bg-slate-100 dark:bg-slate-600 rounded-xl w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-red-100 dark:border-red-900/20">
                  <p className="text-red-500 dark:text-red-400 font-medium">
                    Не удалось загрузить агентов. Попробуйте ещё раз.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-2">
                    Ничего не найдено по фильтрам.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      tab +
                      selectedTags.join() +
                      search +
                      businessType +
                      painPoint
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
                        <AgentCard agent={agent} onTagClick={toggleTag} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Поиск по нашим решениям
                  </h3>
                  <div className="relative flex-grow max-w-md">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по нашим агентам..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse"
                    >
                      <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-600 rounded-2xl mb-6" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded-md w-2/3 mb-4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded-md w-1/3 mb-6" />
                      <div className="space-y-2 mb-8">
                        <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded-md w-full" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded-md w-4/5" />
                      </div>
                      <div className="h-10 bg-slate-100 dark:bg-slate-600 rounded-xl w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-red-100 dark:border-red-900/20">
                  <p className="text-red-500 dark:text-red-400 font-medium">
                    Не удалось загрузить агентов. Попробуйте ещё раз.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-2">
                    Пока нет наших решений.
                  </p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm"
                    >
                      <Plus size={16} /> Добавить первое решение
                    </button>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab + selectedTags.join() + search}
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
                        <AgentCard agent={agent} onTagClick={toggleTag} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
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
