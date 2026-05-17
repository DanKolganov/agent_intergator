import { Link } from "wouter";
import {
  ArrowRight,
  Briefcase,
  Zap,
  Tag,
  CheckCircle2,
  Crown,
  Sparkles,
} from "lucide-react";
import type { Agent } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";

interface AgentCardProps {
  agent: Agent;
  onTagClick?: (tag: string) => void;
  variant?: "default" | "premium";
}

function useRecordView() {
  return useMutation({
    mutationFn: async (agentId: number) => {
      await fetch("/api/view-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ agentId }),
      });
    },
  });
}

export function AgentCard({
  agent,
  onTagClick,
  variant = "default",
}: AgentCardProps) {
  const { isAuthenticated } = useAuth();
  const recordView = useRecordView();
  const isPremium = variant === "premium" || agent.isTeamSolution;
  const fallbackImage =
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

  const parseDescription = (description: string) => {
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
  };

  const { mainDescription, bulletPoints } = parseDescription(agent.description);

  const handleOpen = () => {
    if (isAuthenticated) {
      recordView.mutate(agent.id);
    }
  };

  return (
    <Link href={`/agents/${agent.id}`} onClick={handleOpen}>
      <article
        data-testid={`card-agent-${agent.id}`}
        className={`group relative flex flex-col h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1 ${
          isPremium
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-primary/20 border-2 border-primary/40 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 ring-1 ring-primary/20"
            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        {isPremium && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-cyan-400 z-30 pointer-events-none" />
        )}

        <div
          className={`aspect-[16/9] overflow-hidden relative ${isPremium ? "ring-inset ring-primary/10" : ""}`}
        >
          <div
            className={`absolute inset-0 z-10 pointer-events-none transition-colors duration-500 ${
              isPremium
                ? "bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"
                : "bg-slate-900/10 mix-blend-multiply group-hover:bg-transparent"
            }`}
          ></div>
          <img
            src={agent.imageUrl || fallbackImage}
            alt={agent.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4 z-20 flex gap-2 flex-wrap justify-end">
            {isPremium ? (
              <span className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white backdrop-blur-md rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Crown size={12} />
                Наше решение
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-600/90 text-white backdrop-blur-md rounded-full text-xs font-semibold shadow-sm">
                Бесплатно
              </span>
            )}
            <span
              className={`px-3 py-1.5 backdrop-blur-md rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5 ${
                isPremium
                  ? "bg-white/15 text-white border border-white/20"
                  : "bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Briefcase size={12} className={isPremium ? "text-accent" : "text-primary"} />
              {agent.industry}
            </span>
          </div>
        </div>

        <div className={`p-6 flex flex-col flex-grow ${isPremium ? "text-white" : ""}`}>
          <h3
            className={`text-xl font-display font-bold mb-1 transition-colors ${
              isPremium
                ? "text-white group-hover:text-primary-foreground"
                : "text-slate-900 dark:text-slate-100 group-hover:text-primary"
            }`}
          >
            {agent.name}
          </h3>
          <p
            className={`text-sm font-medium flex items-center gap-1.5 mb-3 ${
              isPremium ? "text-accent" : "text-accent"
            }`}
          >
            <Zap size={14} />
            {agent.useCase}
          </p>

          <p
            className={`text-sm leading-relaxed mb-3 flex-grow line-clamp-3 ${
              isPremium ? "text-slate-300" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {mainDescription}
          </p>

          {bulletPoints.length > 0 && (
            <ul className="mb-4 space-y-2">
              {bulletPoints.slice(0, 3).map((point, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-xs ${
                    isPremium ? "text-slate-300" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <CheckCircle2
                    size={12}
                    className={`mt-0.5 flex-shrink-0 ${isPremium ? "text-primary" : "text-primary"}`}
                  />
                  <span className="line-clamp-2">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {agent.tags && agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.tags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    isPremium
                      ? "bg-white/10 text-slate-200 hover:bg-primary/30 hover:text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary"
                  }`}
                  data-testid={`tag-${tag}`}
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div
            className={`pt-4 mt-auto border-t ${
              isPremium ? "border-white/10" : "border-slate-100 dark:border-slate-700"
            }`}
          >
            <span
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2 ${
                isPremium
                  ? "bg-gradient-to-r from-primary to-accent text-white group-hover:opacity-90 shadow-lg shadow-primary/25"
                  : "text-primary bg-primary/5 group-hover:bg-primary group-hover:text-white"
              }`}
            >
              {isPremium ? (
                <>
                  <Sparkles size={16} />
                  Подробнее о решении
                </>
              ) : (
                <>
                  Подробнее
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
