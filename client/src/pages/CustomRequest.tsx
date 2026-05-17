import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Building2,
  FileText,
  ArrowRight,
  Sparkles,
  HeadphonesIcon,
  CheckCircle2,
  Lightbulb,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useCreateCustomRequest } from "../hooks/use-custom-requests";
import { SUPPORT_CONTACTS } from "@shared/contacts";

export default function CustomRequest() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateCustomRequest();

  const [formData, setFormData] = useState({
    businessName: "",
    businessNeeds: "",
  });
  const [showHelpOffer, setShowHelpOffer] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.businessNeeds) return;

    createMutation.mutate(formData, {
      onSuccess: (data) => {
        setLocation(`/custom/${data.id}`);
      },
    });
  };

  return (
    <motion.div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
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
            className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-800/95 rounded-3xl p-8 md:p-12 relative z-10 border border-slate-200/80 dark:border-slate-600/80"
          >
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-6 shadow-lg shadow-primary/20">
                <Sparkles size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-3">
                Заказать кастомного агента
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Расскажите о бизнесе. AI проанализирует потребности и предложит
                архитектуру подходящего агента.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Help Offer Banner */}
              {showHelpOffer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 dark:border-primary/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0">
                      <HeadphonesIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Нужна помощь с формулировкой?
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                        Наша команда поможет разобраться в ваших задачах и
                        составить техническое задание бесплатно.
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={SUPPORT_CONTACTS.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Написать в Telegram →
                        </a>
                        <span className="text-slate-400 dark:text-slate-500">|</span>
                        <a
                          href={`mailto:${SUPPORT_CONTACTS.email}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowHelpOffer(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 size={16} className="text-slate-400 dark:text-slate-500" />
                  Название бизнеса
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="Например: Acme Corp"
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400 dark:text-slate-500" />
                  Потребности и задачи
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.businessNeeds}
                  onChange={(e) =>
                    setFormData({ ...formData, businessNeeds: e.target.value })
                  }
                  placeholder="Опишите процессы, боли и что хотите автоматизировать..."
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* Business Plan Preview */}
              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={20} className="text-accent" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Примерный план работы агента
                  </h3>
                </div>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                      1
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        Анализ входящих данных
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Агент будет собирать и структурировать информацию из
                        указанных источников
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                      2
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        Обработка и аналитика
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Обработка данных с использованием AI для выявления
                        паттернов и инсайтов
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                      3
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        Автоматические действия
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Выполнение рутинных задач: отправка уведомлений,
                        создание отчётов, обновление данных
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                      4
                    </div>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        Отчётность и интеграция
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">
                        Формирование отчётов и интеграция с вашими существующими
                        системами
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Clock size={16} />
                    <span>
                      Срок разработки:{" "}
                      <strong className="text-slate-900 dark:text-slate-100">3-7 дней</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-1">
                    <Users size={16} />
                    <span>
                      Поддержка:{" "}
                      <strong className="text-slate-900 dark:text-slate-100">
                        первые 2 недели бесплатно
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4"
              >
                {createMutation.isPending ? (
                  "Отправляем..."
                ) : (
                  <>
                    Проанализировать
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {createMutation.isError && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800/40">
                {createMutation.error.message ||
                  "Что-то пошло не так. Попробуйте ещё раз."}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
