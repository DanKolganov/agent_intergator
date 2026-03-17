import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Tag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onClose: () => void;
}

export default function AddAgentModal({ onClose }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    useCase: "",
    imageUrl: "",
    tags: [] as string[],
    isTeamSolution: true,
  });

  const addAgent = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(api.agents.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create agent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
      toast({ title: "Agent added!", description: "Your agent is now in the directory." });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add agent. Make sure you're signed in.", variant: "destructive" });
    },
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.industry || !form.useCase) return;
    addAgent.mutate(form);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold font-display text-slate-900">Add Agent</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {[
              { label: "Agent Name", key: "name", placeholder: "e.g. Smart Invoice Bot" },
              { label: "Industry", key: "industry", placeholder: "e.g. Finance" },
              { label: "Use Case", key: "useCase", placeholder: "e.g. Accounting Automation" },
              { label: "Image URL (optional)", key: "imageUrl", placeholder: "https://..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  data-testid={`input-${key}`}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="What does this agent do?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                data-testid="input-description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag, press Enter"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  data-testid="input-tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <Plus size={16} className="text-slate-600" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      <Tag size={10} />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X size={10} className="ml-1" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <input
                type="checkbox"
                id="isTeam"
                checked={form.isTeamSolution}
                onChange={e => setForm(f => ({ ...f, isTeamSolution: e.target.checked }))}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="isTeam" className="text-sm font-medium text-amber-800 cursor-pointer">
                Mark as "Our Solution" (visible in team tab)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addAgent.isPending}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-testid="button-submit-agent"
              >
                {addAgent.isPending ? "Adding..." : "Add Agent"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
