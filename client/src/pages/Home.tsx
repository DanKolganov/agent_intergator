import { motion } from "framer-motion";
import { Link } from "wouter";
import { Bot, ArrowRight, Sparkles, Building2, BrainCircuit } from "lucide-react";
import { Navbar } from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-8 border border-primary/20"
              >
                <Sparkles size={16} />
                <span>Next-Generation Business Automation</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold font-display tracking-tight text-slate-900 mb-8 leading-tight"
              >
                Hire the perfect <span className="text-gradient">AI Agent</span> <br className="hidden md:block"/> for your business.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Browse our directory of specialized AI agents built for specific industries, or describe your unique business challenges and let us build a custom agent for you.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link 
                  href="/agents"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Bot size={20} />
                  Browse Directory
                </Link>
                <Link 
                  href="/custom"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} className="text-accent" />
                  Request Custom Agent
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features / Value Prop */}
        <section className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Building2 size={28} />
                </div>
                <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Industry Specific</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our agents are pre-trained on domain-specific knowledge, from healthcare to e-commerce, ensuring they speak your language.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-accent/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <BrainCircuit size={28} />
                </div>
                <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Custom Intelligence</h3>
                <p className="text-slate-600 leading-relaxed">
                  Can't find what you need? Our proprietary AI system analyzes your business needs to instantly scope a custom agent.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-pink-500/20 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6">
                  <Bot size={28} />
                </div>
                <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Ready to Deploy</h3>
                <p className="text-slate-600 leading-relaxed">
                  Skip the months of development. Our agents integrate with your existing workflows in minutes, not months.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
