import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AgentCard } from "@/components/AgentCard";
import { useAuth } from "@/hooks/use-auth";
import { Clock, LogIn } from "lucide-react";
import { api } from "@shared/routes";

function useViewHistory() {
  return useQuery({
    queryKey: [api.viewHistory.list.path],
    queryFn: async () => {
      const res = await fetch(api.viewHistory.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Не удалось загрузить историю");
      return res.json();
    },
    enabled: true,
  });
}

export default function History() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: agents, isLoading } = useViewHistory();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-slate-900">История просмотров</h1>
            <p className="text-slate-500 text-sm">Агенты, которых вы недавно смотрели</p>
          </div>
        </div>

        {!authLoading && !isAuthenticated ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-100">
            <LogIn size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Войдите, чтобы увидеть историю</h2>
            <p className="text-slate-500 mb-6">Мы сохраняем историю, когда вы авторизованы.</p>
            <a
              href="/api/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <LogIn size={16} />
              Войти
            </a>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse h-64" />
            ))}
          </div>
        ) : !agents || agents.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-100">
            <Clock size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg">Пока пусто. Начните просматривать агентов!</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {agents.map((agent: any, index: number) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
