# 🤖 Автоматическое обновление агентов

## 🎯 Что делает автоматизация

Автоматически обновляет всех агентов при каждом деплое:
- ✅ Русские названия
- ✅ Тезисные описания  
- ✅ Правильные теги
- ✅ useCase на русском

## 📋 Способы автоматизации

### Способ 1: GitHub Actions (рекомендуемый)

**Шаг 1: Добавьте секреты в GitHub**
1. Перейдите в ваш репозиторий → Settings → Secrets and variables → Actions
2. Добавьте 2 секрета:
   - `SUPABASE_URL` - URL вашей Supabase базы
   - `SUPABASE_ANON_KEY` - Anon ключ из Supabase

**Шаг 2: Готово!**
Теперь при каждом пуше в main ветку агенты будут обновляться автоматически.

### Способ 2: Встроенный в билд

Скрипт уже добавлен в `package.json`:
```json
{
  "scripts": {
    "update:agents": "node scripts/update-agents-on-deploy.js"
  }
}
```

При запуске `npm run build` агенты обновятся автоматически.

### Способ 3: Cron job

Добавьте в ваш CI/CD:
```bash
# Каждый час проверять и обновлять
0 * * * * curl -X POST https://your-site.com/api/update-agents
```

## 🔧 Настройка переменных окружения

### Для локальной разработки:
```bash
# .env файл
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Для production:
```bash
# В CI/CD системе
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
npm run update:agents
```

## 🚀 Проверка работы

### 1. Локально:
```bash
npm run update:agents
```

### 2. После деплоя:
Проверьте логи в GitHub Actions или в консоли вашего хостинга.

### 3. Вручную (если что-то пошло не так):
```javascript
// В консоли браузера
fetch('/auto_update_agents.js').then(r => r.text()).then(code => eval(code))
```

## 📊 Что будет обновлено

| ID | Старое название | Новое название |
|----|---------------|---------------|
| 1 | Customer Support Hero | Клиентский сервис 24/7 |
| 2 | Data Analyst Pro | Финансовая аналитика |
| 3 | Lead Generation Specialist | Генератор лидов |
| 4 | HR Onboarding Assistant | HR-ассистент |
| 5 | RetailBot v2 | Розничный помощник |

## ⚡ Быстрое решение

Если нужно обновить прямо сейчас:
1. Откройте сайт
2. F12 → Консоль
3. Скопируйте код из `auto_update_agents.js`
4. Вставьте и нажмите Enter

Готово через 30 секунд! 🎉
