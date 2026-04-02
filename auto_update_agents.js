// Автоматическое обновление агентов через браузерную консоль
// Скопируйте этот код и выполните в консоли вашего сайта

(async function autoUpdateAgents() {
  console.log("🚀 Начинаем автоматическое обновление агентов...");
  
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

  let successCount = 0;
  let errorCount = 0;

  for (const agent of agentsData) {
    try {
      console.log(`📝 Обновляем агент: ${agent.name} (ID: ${agent.id})`);
      
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent)
      });
      
      if (response.ok) {
        console.log(`✅ Успешно обновлен: ${agent.name}`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.error(`❌ Ошибка при обновлении ${agent.name}:`, errorText);
        errorCount++;
      }
      
      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Критическая ошибка при обновлении ${agent.name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Обновление завершено!`);
  console.log(`✅ Успешно: ${successCount} агентов`);
  console.log(`❌ Ошибок: ${errorCount} агентов`);
  
  if (successCount === agentsData.length) {
    console.log(`\n🔄 Обновляем страницу...`);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } else {
    console.log(`\n⚠️ Некоторые агенты не обновлены. Проверьте ошибки выше.`);
  }
})();
