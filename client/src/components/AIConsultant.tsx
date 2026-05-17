import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Bot, Sparkles, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import {
  buildAgentsCatalogUrl,
  resolveCatalogFromText,
} from "@/lib/catalog-filters";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  catalogUrl?: string;
}

const QUICK_PROMPTS = [
  {
    label: "Чат-бот для клиентов",
    text: "Нужен чат-бот для работы с клиентами и поддержки",
  },
  {
    label: "Маркетинг в соцсетях",
    text: "Хочу автоматизировать маркетинг и email-рассылки",
  },
  {
    label: "Финансы для ресторана",
    text: "Нужна финансовая аналитика и отчёты для ресторана",
  },
];

export default function AIConsultant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [, setLocation] = useLocation();

  const analyzeAndReply = (userText: string) => {
    const { tags, summary } = resolveCatalogFromText(userText);
    const catalogUrl = buildAgentsCatalogUrl({ tab: "free", tags });

    if (tags.length > 0) {
      return {
        text: `Подобрал ${summary}.\n\n🏷️ Теги: ${tags.slice(0, 4).join(", ")}${tags.length > 4 ? "…" : ""}\n\nСейчас открою каталог с подходящими агентами.`,
        catalogUrl,
        redirect: true,
      };
    }

    return {
      text: "Опишите задачу чуть конкретнее — например: «чат-бот для отеля», «маркетинг для кафе», «финансовая аналитика». Или нажмите кнопку ниже, чтобы открыть весь каталог бесплатных решений.",
      catalogUrl: buildAgentsCatalogUrl({ tab: "free" }),
      redirect: false,
    };
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = analyzeAndReply(trimmed);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: result.text,
        isUser: false,
        timestamp: new Date(),
        catalogUrl: result.catalogUrl,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);

      if (result.redirect && result.catalogUrl) {
        setTimeout(() => setLocation(result.catalogUrl!), 1200);
      }
    }, 700);
  };

  const handleSend = () => sendMessage(input);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastUserText =
    [...messages].reverse().find((m) => m.isUser)?.text || input;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
            <Sparkles size={16} />
            <span>AI-консультант</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-slate-100 mb-4">
            Найдите идеальное решение для вашего бизнеса
          </h2>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Опишите задачу — подберём теги и сразу откроем каталог с подходящими
            AI-инструментами
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-4 mx-auto">
                  <Bot size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Привет! Я ваш AI-консультант
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Напишите задачу — открою каталог с нужными тегами. Например:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => sendMessage(item.text)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${message.isUser ? "order-2" : "order-1"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.isUser
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {message.text}
                      </p>
                      {!message.isUser && message.catalogUrl && (
                        <button
                          type="button"
                          onClick={() => setLocation(message.catalogUrl!)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-primary hover:underline"
                        >
                          Открыть подборку
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MessageCircle
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Опишите вашу задачу..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  disabled={isTyping}
                />
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                <Send size={16} />
                Отправить
              </button>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() =>
                  setLocation(
                    buildAgentsCatalogUrl({
                      tab: "free",
                      tags: resolveCatalogFromText(lastUserText).tags,
                    }),
                  )
                }
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors dark:text-primary dark:hover:text-primary/80"
              >
                <span>Перейти к поиску бесплатных решений</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
