import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { AgentCard } from "@/components/AgentCard";
import { useAgents } from "@/hooks/use-agents";
import { useAuth } from "@/hooks/use-auth";
import { Search, Star, Globe, Plus, X } from "lucide-react";
import AddAgentModal from "@/components/AddAgentModal";

type Tab = "all" | "team";

export default function Agents() {
  const { data: agents, isLoading, error } = useAgents();
  const { isAuthenticated } = useAuth();

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const allTags = useMemo(() => {
    if (!agents) return [];
    const tagSet = new Set<string>();
    agents.forEach(a => a.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [agents]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    return agents.filter(agent => {
      if (tab === "team" && !agent.isTeamSolution) return false;
      if (tab === "all" && agent.isTeamSolution) return false;
      if (search && !agent.name.toLowerCase().includes(search.toLowerCase()) &&
          !agent.description.toLowerCase().includes(search.toLowerCase()) &&
          !agent.industry.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedTags.length > 0 && !selectedTags.every(t => agent.tags?.includes(t))) return false;
      return true;
    });
  }, [agents, tab, search, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold font-display text-slate-900 mb-3">
                Agent Directory
              </h1>
              <p className="text-lg text-slate-600">
                Browse specialized AI agents designed to automate and elevate your business.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isAuthenticated && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                  data-testid="button-add-agent"
                >
                  <Plus size={16} />
                  Add Agent
                </button>
              )}
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-200 rounded-2xl w-fit mb-6">
            <button
              onClick={() => setTab("all")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all ${tab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              data-testid="tab-all"
            >
              <Globe size={15} />
              Browse Agents
            </button>
            <button
              onClick={() => setTab("team")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all ${tab === "team" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              data-testid="tab-team"
            >
              <Star size={15} />
              Our Solutions
            </button>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                  }`}
                  data-testid={`filter-tag-${tag}`}
                >
                  #{tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse">
                  <div className="aspect-[16/9] bg-slate-200 rounded-2xl mb-6" />
                  <div className="h-6 bg-slate-200 rounded-md w-2/3 mb-4" />
                  <div className="h-4 bg-slate-200 rounded-md w-1/3 mb-6" />
                  <div className="space-y-2 mb-8">
                    <div className="h-3 bg-slate-100 rounded-md w-full" />
                    <div className="h-3 bg-slate-100 rounded-md w-4/5" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-red-100">
              <p className="text-red-500 font-medium">Failed to load agents. Please try again.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-500 font-medium text-lg mb-2">
                {tab === "team" ? "No team solutions yet." : "No agents match your filters."}
              </p>
              {tab === "team" && isAuthenticated && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm"
                >
                  <Plus size={16} /> Add First Solution
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
        </div>
      </main>

      {showAddModal && <AddAgentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
