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
  const fallbackImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

  // Parse description to extract bullet points
  const parseDescription = (description: string) => {
    const lines = description.split('\n').filter(line => line.trim());
    const mainDescription = lines[0] || '';
    const bulletPoints = lines.slice(1).filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('*') ||
      line.trim().match(/^\d+\./)
    ).map(line => line.trim().replace(/^[•\-\*\d\.]\s*/, ''));
    
    return { mainDescription, bulletPoints };
  };

  const { mainDescription, bulletPoints } = parseDescription(agent.description);

  const handleClick = () => {
    if (isAuthenticated) {
      recordView.mutate(agent.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      data-testid={`card-agent-${agent.id}`}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply group-hover:bg-transparent transition-colors duration-500 z-10" />
        <img
          src={agent.imageUrl || fallbackImage}
          alt={agent.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 z-20 flex gap-2 flex-wrap justify-end">
          {agent.isTeamSolution && (
            <span className="px-3 py-1.5 bg-primary/90 text-white backdrop-blur-md rounded-full text-xs font-semibold shadow-sm">
              Our Solution
            </span>
          )}
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5">
            <Briefcase size={12} className="text-primary" />
            {agent.industry}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm font-medium text-accent flex items-center gap-1.5">
              <Zap size={14} />
              {agent.useCase}
            </p>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-3 flex-grow">
          {mainDescription}
        </p>

        {bulletPoints.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-2">
              {bulletPoints.slice(0, 3).map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={12} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
              {bulletPoints.length > 3 && (
                <li className="text-xs text-primary font-medium">
                  +{bulletPoints.length - 3} еще...
                </li>
              )}
            </ul>
          </div>
        )}

        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                data-testid={`tag-${tag}`}
              >
                <Tag size={10} />
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 mt-auto">
          <button className="w-full py-2.5 rounded-xl font-semibold text-sm text-primary bg-primary/5 hover:bg-primary hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
            View Details
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
