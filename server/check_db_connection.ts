import { db } from "./db";
import { agents } from "../shared/schema";

async function checkConnection() {
  console.log("Проверка подключения к базе данных...");
  
  try {
    // Проверяем подключение
    const result = await db.select().from(agents).limit(1);
    console.log("✅ Подключение к базе данных успешно!");
    
    // Показываем текущих агентов
    const allAgents = await db.select().from(agents);
    console.log(`📊 Найдено агентов: ${allAgents.length}`);
    
    allAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.industry})`);
      console.log(`   Описание: ${agent.description.substring(0, 100)}...`);
      console.log(`   Теги: ${agent.tags?.join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:", error);
  }
}

// Запуск проверки
checkConnection().catch(console.error);
