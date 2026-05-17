import { Link } from "wouter";
import { ArrowRight, Briefcase, Zap, Tag, CheckCircle2 } from "lucide-react";
import type { Agent } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";

interface AgentCardProps {
  agent: Agent;
  onTagClick?: (tag: string) => void;
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

export function AgentCard({ agent, onTagClick }: AgentCardProps) {
  const { isAuthenticated } = useAuth();
  const recordView = useRecordView();
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
        className="group relative flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      >
        <div className="aspect-[16/9] overflow-hidden relative">
          <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
          <img
            src={agent.imageUrl || fallbackImage}
            alt={agent.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4 z-20 flex gap-2 flex-wrap justify-end">
            {agent.isTeamSolution ? (
              <span className="px-3 py-1.5 bg-primary/90 text-white backdrop-blur-md rounded-full text-xs font-semibold shadow-sm">
                Наше решение
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-600/90 text-white backdrop-blur-md rounded-full text-xs font-semibold shadow-sm">
                Бесплатно
              </span>
            )}
            <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-1.5">
              <Briefcase size={12} className="text-primary" />
              {agent.industry}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary transition-colors">
            {agent.name}
          </h3>
          <p className="text-sm font-medium text-accent flex items-center gap-1.5 mb-3">
            <Zap size={14} />
            {agent.useCase}
          </p>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3 flex-grow line-clamp-3">
            {mainDescription}
          </p>

          {bulletPoints.length > 0 && (
            <ul className="mb-4 space-y-2">
              {bulletPoints.slice(0, 3).map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <CheckCircle2
                    size={12}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <span className="line-clamp-2">{point}</span>
                </li>
              ))}
              {bulletPoints.length > 3 && (
                <li className="text-xs text-primary font-medium">
                  +{bulletPoints.length - 3} ещё...
                </li>
              )}
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                  data-testid={`tag-${tag}`}
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <span className="w-full py-2.5 rounded-xl font-semibold text-sm text-primary bg-primary/5 group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
              Подробнее
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
