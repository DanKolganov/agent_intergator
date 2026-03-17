import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Building2, FileText, ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useCreateCustomRequest } from "../hooks/use-custom-requests";

export default function CustomRequest() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateCustomRequest();
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessNeeds: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.businessNeeds) return;
    
    createMutation.mutate(formData, {
      onSuccess: (data) => {
        setLocation(`/custom/${data.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl relative">
          
          {/* Decorative background blobs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel rounded-3xl p-8 md:p-12 relative z-10"
          >
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-6 shadow-lg shadow-primary/20">
                <Sparkles size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-3">
                Request Custom Agent
              </h1>
              <p className="text-slate-600 text-lg">
                Tell us about your business. Our AI will analyze your needs and recommend the perfect custom agent architecture.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400" />
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  Business Needs & Challenges
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.businessNeeds}
                  onChange={(e) => setFormData({ ...formData, businessNeeds: e.target.value })}
                  placeholder="Describe your workflows, pain points, and what you'd like to automate..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4"
              >
                {createMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    Analyze My Needs
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
            
            {createMutation.isError && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {createMutation.error.message || "Something went wrong. Please try again."}
              </div>
            )}
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}
