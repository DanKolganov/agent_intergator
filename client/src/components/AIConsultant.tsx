import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Bot, Sparkles, ArrowRight } from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useLocation } from "wouter";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIConsultant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [, setLocation] = useLocation();
  const { data: agents } = useAgents();

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Анализ запроса и рекомендации
    if (
      lowerMessage.includes("клиент") ||
      lowerMessage.includes("покупатель") ||
      lowerMessage.includes("обслуживание")
    ) {
      return "На основе вашего запроса рекомендую решения для работы с клиентами. Вот лучшие варианты:\n\n🤖 **Чат-бот для поддержки клиентов** - 24/7 автоматическая поддержка\n📊 **Анализ обратной связи** - сбор и обработка отзывов\n📧 **Email-маркетинг** - персонализированные рассылки\n\nХотите посмотреть полный каталог решений для работы с клиентами?";
    }

    if (
      lowerMessage.includes("маркетинг") ||
      lowerMessage.includes("реклама") ||
      lowerMessage.includes("продвижение")
    ) {
      return "Отлично! Для маркетинга рекомендую следующие решения:\n\n✍️ **Контент-маркетинг** - генерация идей для статей и постов\n🔍 **SEO-оптимизация** - анализ ключевых слов и оптимизация\n📱 **Соцсети** - автоматизация публикаций и аналитика\n\nКакой аспект маркетинга вас интересует больше всего?";
    }

    if (
      lowerMessage.includes("финансы") ||
      lowerMessage.includes("деньги") ||
      lowerMessage.includes("бюджет")
    ) {
      return "Для финансовых задач рекомендую:\n\n📈 **Финансовая аналитика** - анализ доходов и расходов\n💰 **Бюджетирование** - планирование и контроль бюджета\n🧾 **Налоговая оптимизация** - автоматизация налоговой отчетности\n\nКакая финансовая задача наиболее актуальна для вашего бизнеса?";
    }

    if (
      lowerMessage.includes("ресторан") ||
      lowerMessage.includes("кафе") ||
      lowerMessage.includes("еда")
    ) {
      return "Для ресторанного бизнеса рекомендую:\n\n🍽️ **Управление заказами** - автоматизация приёма заказов\n⭐ **Работа с отзывами** - мониторинг и ответ на отзывы\n📊 **Аналитика посещаемости** - анализ загруженности и популярности блюд\n\nХотите увидеть все решения для ресторанов и кафе?";
    }

    if (
      lowerMessage.includes("отель") ||
      lowerMessage.includes("гостиница") ||
      lowerMessage.includes("бронирование")
    ) {
      return "Для гостиничного бизнеса рекомендую:\n\n🏨 **Управление бронированием** - автоматизация номерного фонда\n⭐ **Работа с отзывами** - мониторинг на всех площадках\n📧 **Email-рассылки** - информирование гостей о специальных предложениях\n\nКакая задача наиболее актуальна для вашего отеля?";
    }

    // Общий ответ
    return "Понял вашу задачу! Чтобы подобрать лучшие решения, уточните:\n\n🎯 **Сфера деятельности:** рестораны, отели, торговля, услуги?\n🎯 **Основная задача:** клиенты, маркетинг, финансы, операции?\n\nИли можете сразу посмотреть полный каталог бесплатных AI-решений - там уже всё сгруппировано по отраслям и задачам!";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Имитация задержки ответа
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(input),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            Кратко опишите вашу задачу, и я подберу наиболее подходящие
            AI-инструменты для вашего бизнеса
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Сообщения */}
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
                  Расскажите о вашей задаче, и я помогу найти подходящие
                  решения. Например:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() =>
                      setInput("Нужен чат-бот для работы с клиентами")
                    }
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Чат-бот для клиентов
                  </button>
                  <button
                    onClick={() =>
                      setInput("Хочу автоматизировать маркетинг в соцсетях")
                    }
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Маркетинг в соцсетях
                  </button>
                  <button
                    onClick={() =>
                      setInput("Нужна финансовая аналитика для ресторана")
                    }
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Финансы для ресторана
                  </button>
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
                    className={`max-w-[80%] ${message.isUser ? "order-2" : "order-1"}`}
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

          {/* Поле ввода */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
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
                  onKeyPress={handleKeyPress}
                  placeholder="Опишите вашу задачу..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                  disabled={isTyping}
                />
              </div>
              <button
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
                onClick={() => setLocation("/agents")}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors dark:text-primary/90 dark:hover:text-primary"
              >
                <span>Или перейти к полному каталогу решений</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
