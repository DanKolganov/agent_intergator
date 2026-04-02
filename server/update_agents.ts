import { db } from "./db";
import { agents } from "../shared/schema";
import { eq } from "drizzle-orm";

// Обновление названий агентов на более понятные для малого бизнеса
const agentUpdates = [
  {
    id: 1, // Customer Support Hero
    name: "Клиентский сервис 24/7",
    description: "Автоматический обработчик обращений клиентов. Работает 24/7, обрабатывает запросы, возвраты и часто задаваемые вопросы.",
    industry: "E-commerce",
    useCase: "Обслуживание клиентов",
    tags: ["поддержка клиентов", "чат-бот", "автоответчик", "FAQ"],
  },
  {
    id: 2, // Data Analyst Pro
    name: "Финансовая аналитика",
    description: "Подключается к вашей базе данных и отвечает на вопросы о метриках, KPI и финансовых показателях. Строит отчеты и дашборды.",
    industry: "Finance",
    useCase: "Финансовый анализ",
    tags: ["аналитика", "отчеты", "KPI", "дэшборд", "метрики"],
  },
  {
    id: 3, // Lead Generation Specialist
    name: "Генератор лидов",
    description: "Привлекает посетителей сайта, квалифицирует их и автоматически записывает встречи в ваш календарь.",
    industry: "B2B Services",
    useCase: "Продажи",
    tags: ["лиды", "продажи", "CRM", "календарь", "квалификация"],
  },
  {
    id: 4, // HR Onboarding Assistant
    name: "HR-ассистент",
    description: "Помогает новым сотрудникам пройти адаптацию, отвечает на HR-вопросы и собирает необходимые документы.",
    industry: "Human Resources",
    useCase: "Кадровый делопроизводство",
    tags: ["онбординг", "кадры", "HR", "адаптация", "обучение"],
  },
  {
    id: 5, // RetailBot v2
    name: "Розничный помощник",
    description: "Флагманский агент для ритейла. Отслеживает остатки, заказы и отправляет уведомления клиентам в реальном времени.",
    industry: "Retail",
    useCase: "Операционная деятельность",
    tags: ["ритейл", "склад", "заказы", "уведомления", "автоматизация"],
  },
];

async function updateAgents() {
  console.log("Обновление названий агентов...");
  
  for (const update of agentUpdates) {
    try {
      await db
        .update(agents)
        .set({
          name: update.name,
          description: update.description,
          useCase: update.useCase,
          tags: update.tags,
        })
        .where(eq(agents.id, update.id));
      
      console.log(`✅ Обновлен агент: ${update.name}`);
    } catch (error) {
      console.error(`❌ Ошибка при обновлении агента ${update.name}:`, error);
    }
  }
  
  console.log("✅ Обновление агентов завершено!");
}

// Запуск обновления
updateAgents().catch(console.error);
