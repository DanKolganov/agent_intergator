import { createClient } from '@supabase/supabase-js';

// Создание клиента Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Полные данные для всех агентов
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
    imageUrl: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    isTeamSolution: true,
  },
];

async function batchUpdateAgents() {
  console.log("🚀 Начинаем пакетное обновление агентов...");
  
  for (const agent of agentsData) {
    try {
      console.log(`📝 Обновляем агент: ${agent.name} (ID: ${agent.id})`);
      
      const { data, error } = await supabase
        .from('agents')
        .upsert({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          industry: agent.industry,
          useCase: agent.useCase,
          tags: agent.tags,
          imageUrl: agent.imageUrl,
          isTeamSolution: agent.isTeamSolution,
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error(`❌ Ошибка при обновлении агента ${agent.name}:`, error);
      } else {
        console.log(`✅ Успешно обновлен агент: ${agent.name}`);
        console.log(`   📊 Данные: ${data ? 'сохранены' : 'проверьте вручную'}`);
      }
    } catch (error) {
      console.error(`❌ Критическая ошибка при обновлении агента ${agent.name}:`, error);
    }
  }
  
  console.log("✅ Пакетное обновление агентов завершено!");
  
  // Проверяем результат
  console.log("\n🔍 Проверяем результат...");
  const { data: finalAgents, error: checkError } = await supabase
    .from('agents')
    .select('*');
    
  if (checkError) {
    console.error("❌ Ошибка при проверке:", checkError);
  } else {
    console.log(`📊 Всего агентов в базе: ${finalAgents?.length || 0}`);
    finalAgents?.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} - ${agent.useCase}`);
    });
  }
}

// Запуск обновления
batchUpdateAgents().catch(console.error);
