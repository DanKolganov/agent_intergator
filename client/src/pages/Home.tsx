import { motion } from "framer-motion";
import { Link } from "wouter";
import { Bot, ArrowRight, Sparkles, Building2, BrainCircuit, Utensils, Home as HomeIcon, ShoppingCart, Car, Wrench, Users } from "lucide-react";
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
                <span>Автоматизация бизнеса нового поколения</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold font-display tracking-tight text-slate-900 mb-8 leading-tight"
              >
                Найдите идеального <span className="text-gradient">AI-агента</span> <br className="hidden md:block"/> для вашего бизнеса.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Выберите агента из каталога под вашу отрасль или опишите задачу — и мы соберём кастомного агента под ваш бизнес.
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
                  Открыть каталог
                </Link>
                <Link 
                  href="/custom"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} className="text-accent" />
                  Заказать кастомного агента
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Business Type Segmentation */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">
                Решения для вашего бизнеса
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Выберите вашу сферу деятельности и найдите готовые AI-инструменты для решения конкретных задач
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group"
              >
                <Link href="/agents?business=hospitality">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      <HomeIcon size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Гостиничный бизнес</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Автоматизация бронирования, управление отзывами, оптимизация загрузки номеров
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Смотреть решения</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group"
              >
                <Link href="/agents?business=restaurant">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      <Utensils size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Рестораны и кафе</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Управление заказами, работа с отзывами, аналитика посещаемости
                    </p>
                    <div className="flex items-center text-orange-600 font-medium">
                      <span>Смотреть решения</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group"
              >
                <Link href="/agents?business=retail">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      <ShoppingCart size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Розничная торговля</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Управление запасами, работа с клиентами, аналитика продаж
                    </p>
                    <div className="flex items-center text-green-600 font-medium">
                      <span>Смотреть решения</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <Link href="/agents?business=rental">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      <Car size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Арендный бизнес</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Управление арендой, обработка заявок, автоматизация платежей
                    </p>
                    <div className="flex items-center text-purple-600 font-medium">
                      <span>Смотреть решения</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="group"
              >
                <Link href="/agents?business=service">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      <Wrench size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Сервисные услуги</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Запись клиентов, управление расписанием, автоматизация напоминаний
                    </p>
                    <div className="flex items-center text-pink-600 font-medium">
                      <span>Смотреть решения</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="group"
              >
                <Link href="/agents">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-slate-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                      <Bot size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Все решения</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Просмотр полного каталога бесплатных AI-инструментов
                    </p>
                    <div className="flex items-center text-slate-600 font-medium">
                      <span>Смотреть все</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">
                Решите ваши бизнес-задачи
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Найдите готовые решения для конкретных проблем вашего бизнеса
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group"
              >
                <Link href="/agents?task=customers">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <BrainCircuit size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-slate-900">Работа с клиентами</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Автоматизация общения, обработка обращений, управление лояльностью
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group"
              >
                <Link href="/agents?task=marketing">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-accent/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-slate-900">Маркетинг</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Контент-маркетинг, SEO, соцсети, email-рассылки
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group"
              >
                <Link href="/agents?task=finance">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-green-500/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                      <Building2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-slate-900">Финансы</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Финансовая аналитика, бюджетирование, налоговая оптимизация
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <Link href="/agents?task=hr">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-slate-900">HR и персонал</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Адаптация сотрудников, обучение, управление кадровыми документами
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="group"
              >
                <Link href="/agents?task=operations">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                      <ArrowRight size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-slate-900">Операции</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Автоматизация процессов, управление документами, оптимизация рабочих потоков
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="group"
              >
                <Link href="/agents">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-4">
                      <Bot size={24} />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-slate-900">Все задачи</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Полный каталог всех доступных решений
                    </p>
                  </div>
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
                <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Под вашу отрасль</h3>
                <p className="text-slate-600 leading-relaxed">
                  Агенты заточены под доменную экспертизу — от e-commerce до финтеха — и “говорят на вашем языке”.
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
                <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Кастомная логика</h3>
                <p className="text-slate-600 leading-relaxed">
                  Не нашли подходящее? Система анализирует ваши потребности и предлагает архитектуру кастомного агента.
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
                <h3 className="text-xl font-bold font-display mb-3 text-slate-900">Готово к внедрению</h3>
                <p className="text-slate-600 leading-relaxed">
                  Без месяцев разработки: интеграция с вашими процессами — за минуты, а не за месяцы.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
