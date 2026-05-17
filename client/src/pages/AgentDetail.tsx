import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MessageCircle,
  Tag,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAgent } from "@/hooks/use-agents";

function parseDescription(description: string) {
  const lines = description.split("\n").filter((line) => line.trim());
  const mainDescription = lines[0] || "";
  const bulletPoints = lines
    .slice(1)
    .filter(
      (line) =>
        line.trim().startsWith("•") ||
        line.trim().startsWith("-") ||
        line.trim().startsWith("*") ||
        line.trim().match(/^\d+\./),
    )
    .map((line) => line.trim().replace(/^[•\-\*\d\.]\s*/, ""));
  return { mainDescription, bulletPoints };
}

export default function AgentDetail() {
  const [, params] = useRoute("/agents/:id");
  const id = Number(params?.id);
  const { data: agent, isLoading, error } = useAgent(id);

  const fallbackImage =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900"
      >
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-8" />
          <div className="aspect-[21/9] bg-slate-200 dark:bg-slate-700 rounded-3xl mb-8" />
          <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-5/6" />
          </div>
        </main>
      </motion.div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Агент не найден или не удалось загрузить данные.
          </p>
          <Link
            href="/agents?tab=free"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            <ArrowLeft size={16} />
            Вернуться в каталог
          </Link>
        </main>
      </div>
    );
  }

  const { mainDescription, bulletPoints } = parseDescription(agent.description);
  const catalogTab = agent.isTeamSolution ? "team" : "free";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="flex-grow pt-8 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/agents?tab=${catalogTab}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Назад к каталогу
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
          >
            <div className="aspect-[21/9] relative overflow-hidden">
              <img
                src={agent.imageUrl || fallbackImage}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                {agent.isTeamSolution ? (
                  <span className="px-3 py-1.5 bg-primary/90 text-white rounded-full text-xs font-semibold">
                    Наше решение
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-600/90 text-white rounded-full text-xs font-semibold">
                    Бесплатно
                  </span>
                )}
                <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Briefcase size={12} className="text-primary" />
                  {agent.industry}
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">
                {agent.name}
              </h1>
              <p className="text-accent font-medium flex items-center gap-2 mb-6">
                <Zap size={18} />
                {agent.useCase}
              </p>

              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed mb-6">
                {mainDescription}
              </p>

              {bulletPoints.length > 0 && (
                <ul className="space-y-3 mb-8">
                  {bulletPoints.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle2
                        size={18}
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {agent.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/agents?tab=free&tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Tag size={12} />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                {agent.isTeamSolution ? (
                  <Link
                    href="/custom"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <MessageCircle size={18} />
                    Обратиться за консультацией
                  </Link>
                ) : (
                  <Link
                    href="/agents?tab=free"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                  >
                    Смотреть в каталоге
                  </Link>
                )}
                <Link
                  href={`/agents?tab=${catalogTab}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Смотреть похожие
                </Link>
              </div>
            </div>
          </motion.article>
        </div>
      </main>
    </div>
  );
}
