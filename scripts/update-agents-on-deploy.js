// Скрипт для автоматического обновления агентов при деплое
const { createClient } = require('@supabase/supabase-js');

// Данные агентов
const agentsData = [
  {
    id: 1,
    name: "Клиентский сервис 24/7",
    description: `Клиентский сервис 24/7

• Автоматическая обработка обращений клиентов
• Работа 24/7 без перерывов
• Ответы на часто задаваемые вопросы (FAQ)
• Обработка запросов, возвратов и жалоб
• Интеграция с CRM-системами

Идеально для: интернет-магазинов, сервисов, любого бизнеса с клиентской поддержкой`,
    industry: "E-commerce",
    useCase: "Обслуживание клиентов",
    tags: ["поддержка клиентов", "чат-бот", "автоответчик", "FAQ"],
    isTeamSolution: false,
  },
  {
    id: 2,
    name: "Финансовая аналитика",
    description: `Финансовая аналитика

• Подключение к вашей базе данных
• Анализ ключевых метрик и KPI
• Автоматическое построение отчетов
• Финансовые дашборды в реальном времени
• Прогнозирование и тренды

Идеально для: любого бизнеса где важен финансовый контроль и отчетность`,
    industry: "Finance",
    useCase: "Финансовый анализ",
    tags: ["аналитика", "отчеты", "KPI", "дэшборд", "метрики"],
    isTeamSolution: false,
  },
  {
    id: 3,
    name: "Генератор лидов",
    description: `Генератор лидов

• Привлечение посетителей сайта
• Автоматическая квалификация лидов
• Запись встреч в календарь
• Интеграция с CRM-системами
• Отслеживание воронки продаж

Идеально для: B2B услуг, консалтинга, услуг с долгим циклом сделки`,
    industry: "B2B Services",
    useCase: "Продажи",
    tags: ["лиды", "продажи", "CRM", "календарь", "квалификация"],
    isTeamSolution: false,
  },
  {
    id: 4,
    name: "HR-ассистент",
    description: `HR-ассистент

• Помощь новым сотрудникам при онбординге
• Автоматическая адаптация персонала
• Ответы на HR-вопросы
• Сбор необходимых документов
• Обучение и онбординг

Идеально для: компаний с штатом от 5+ человек`,
    industry: "Human Resources",
    useCase: "Кадровый делопроизводство",
    tags: ["онбординг", "кадры", "HR", "адаптация", "обучение"],
    isTeamSolution: false,
  },
  {
    id: 5,
    name: "Розничный помощник",
    description: `Розничный помощник

• Отслеживание остатков товаров
• Автоматическая обработка заказов
• Уведомления клиентам в реальном времени
• Интеграция с учетными системами
• Аналитика продаж и популярности товаров

Идеально для: розничных магазинов, интернет-магазинов, торговых точек`,
    industry: "Retail",
    useCase: "Операционная деятельность",
    tags: ["ритейл", "склад", "заказы", "уведомления", "автоматизация"],
    isTeamSolution: true,
  },
];

async function updateAgentsOnDeploy() {
  console.log("🚀 Автоматическое обновление агентов при деплое...");
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log("⚠️ Переменные Supabase не найдены, пропускаем обновление");
    return;
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  try {
    for (const agent of agentsData) {
      console.log(`📝 Обновляем: ${agent.name}`);
      
      const { error } = await supabase
        .from('agents')
        .upsert({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          industry: agent.industry,
          useCase: agent.useCase,
          tags: agent.tags,
          isTeamSolution: agent.isTeamSolution,
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error(`❌ Ошибка: ${error.message}`);
      } else {
        console.log(`✅ Обновлен: ${agent.name}`);
      }
    }
    
    console.log("✅ Автоматическое обновление завершено!");
  } catch (error) {
    console.error("❌ Критическая ошибка:", error);
  }
}

updateAgentsOnDeploy();
