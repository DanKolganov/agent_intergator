import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  TerminalSquare,
  FileCode,
  Download,
  MessageCircle,
  Send,
  Headphones,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import {
  useCustomRequest,
  useAnalyzeCustomRequest,
} from "../hooks/use-custom-requests";
import { useQueryClient } from "@tanstack/react-query";

export default function RequestStatus() {
  const [, params] = useRoute("/custom/:id");
  const requestId = params?.id ? parseInt(params.id, 10) : null;

  const { data: request, isLoading, error } = useCustomRequest(requestId!);
  const analyzeMutation = useAnalyzeCustomRequest();
  const [activeTab, setActiveTab] = useState<
    "recommendation" | "code" | "readme"
  >("recommendation");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Trigger analysis if it's pending and we haven't already started
  useEffect(() => {
    if (
      request?.status === "pending" &&
      !analyzeMutation.isPending &&
      !analyzeMutation.isSuccess
    ) {
      analyzeMutation.mutate(request.id);
    }
  }, [request?.status, request?.id, analyzeMutation]);

  if (!requestId) return null;

  const isAnalyzing =
    request?.status === "pending" || request?.status === "analyzing";
  const isCompleted = request?.status === "completed";
  const needsClarification = request?.status === "needs_clarification";
  const followUpCount = request?.followUpCount || 0;

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !requestId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/custom-requests/${requestId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });
      if (res.ok) {
        setAnswer("");
        // Re-trigger analysis
        await analyzeMutation.mutateAsync(requestId);
        // Refresh data
        queryClient.invalidateQueries({
          queryKey: ["custom-request", requestId],
        });
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-slate-500 font-medium">
              Loading request details...
            </p>
          </div>
        ) : error || !request ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-red-100">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Request Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We couldn't find the custom request you're looking for.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header / Status Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 size={20} className="text-slate-400" />
                  <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                    {request.businessName}
                  </h1>
                </div>
                <p className="text-slate-500 text-sm">
                  Request #{request.id.toString().padStart(4, "0")}
                </p>
              </div>

              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                {isAnalyzing ? (
                  <>
                    <div className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                    </div>
                    <span className="font-semibold text-primary">
                      AI анализирует...
                    </span>
                  </>
                ) : needsClarification ? (
                  <>
                    <MessageCircle size={24} className="text-accent" />
                    <span className="font-semibold text-accent">
                      Нужно уточнение (вопрос {followUpCount}/3)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} className="text-green-500" />
                    <span className="font-semibold text-green-700">
                      Анализ завершён
                    </span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Tabs for Recommendation and Code */}
            {!isAnalyzing && isCompleted && (
              <div className="flex gap-2 p-1 bg-slate-200 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab("recommendation")}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === "recommendation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Recommendation
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === "code" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Agent Code
                </button>
                <button
                  onClick={() => setActiveTab("readme")}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === "readme" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Setup Guide
                </button>
              </div>
            )}

            {/* Analysis Result / Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-3xl p-1 overflow-hidden"
            >
              <div className="bg-slate-900 rounded-[22px] p-8 md:p-10 text-white min-h-[400px] relative overflow-hidden">
                {/* Background glow for the dark panel */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    {activeTab === "recommendation" ? (
                      <TerminalSquare size={24} className="text-accent" />
                    ) : (
                      <FileCode size={24} className="text-accent" />
                    )}
                    <h2 className="text-xl font-bold font-display">
                      {activeTab === "recommendation"
                        ? "AI Architect Recommendation"
                        : activeTab === "code"
                          ? "Generated Agent Code"
                          : "Installation Guide"}
                    </h2>
                  </div>
                  {!isAnalyzing &&
                    isCompleted &&
                    activeTab !== "recommendation" && (
                      <button
                        onClick={() =>
                          downloadFile(
                            activeTab === "code" ? "agent.py" : "README.md",
                            activeTab === "code"
                              ? request.generatedCode!
                              : request.generatedReadme!,
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    )}
                </div>

                <div className="relative z-10">
                  {needsClarification ? (
                    <div className="py-8">
                      <div className="mb-6 p-6 bg-accent/10 border border-accent/20 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <MessageCircle size={20} className="text-accent" />
                          Уточняющий вопрос от AI:
                        </h3>
                        <p className="text-slate-300 text-lg leading-relaxed">
                          {request.lastQuestion ||
                            "Можете рассказать подробнее о ваших задачах?"}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Ваш ответ..."
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                          rows={4}
                        />
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={
                            !answer.trim() ||
                            isSubmitting ||
                            analyzeMutation.isPending
                          }
                          className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                        >
                          {isSubmitting || analyzeMutation.isPending ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Отправка...
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              Отправить ответ
                            </>
                          )}
                        </button>
                      </div>

                      {followUpCount >= 2 && (
                        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Headphones
                              size={20}
                              className="text-primary flex-shrink-0 mt-0.5"
                            />
                            <div>
                              <p className="text-sm text-slate-300">
                                Устали отвечать на вопросы?
                              </p>
                              <a
                                href="https://t.me/your_support"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline font-medium"
                              >
                                Получите бесплатную консультацию →
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-24 h-24 relative mb-8">
                        <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-r-4 border-accent rounded-full animate-spin direction-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles
                            size={32}
                            className="text-white animate-pulse"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Processing your workflow...
                      </h3>
                      <p className="text-slate-400 max-w-md text-center">
                        Our intelligence engine is mapping your business needs
                        to optimal AI agent architectures and generating
                        deployment-ready code.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="prose prose-invert prose-lg max-w-none"
                    >
                      {activeTab === "recommendation" ? (
                        request.recommendation ? (
                          <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
                            {request.recommendation}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">
                            No recommendation generated.
                          </p>
                        )
                      ) : activeTab === "code" ? (
                        <pre className="bg-black/50 p-6 rounded-2xl border border-white/10 overflow-x-auto text-sm font-mono text-emerald-400">
                          <code>
                            {request.generatedCode || "# No code generated"}
                          </code>
                        </pre>
                      ) : (
                        <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
                          {request.generatedReadme || "No readme generated."}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Original Request Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 mb-4 uppercase tracking-wider text-sm">
                Original Submission
              </h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {request.businessNeeds}
              </p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
