# Agent Integrator

Каталог готовых ИИ-решений для малого и среднего бизнеса. Пользователь выбирает
решение под свою задачу — генератор лидов, поддержка клиентов 24/7, аналитика
продаж и т.д. — или описывает потребность в свободной форме, и LLM подбирает /
генерирует черновик карточки.

Каталог наполняется двумя способами:

1. **Свои решения** (`is_team_solution=true`) — добавляются вручную через UI на
   странице `/agents` (требуется авторизация).
2. **Бесплатные решения** (`is_team_solution=false`) — автоматический импорт
   из awesome-листов GitHub командой `npm run agents:import`.

## Стек

- **Frontend:** React 18 + Wouter + TanStack Query + Tailwind + Shadcn UI
- **Backend:** Express 5 + Drizzle ORM
- **БД:** PostgreSQL (Supabase)
- **LLM:** любой OpenAI-совместимый провайдер (рекомендуется Groq — бесплатный)
- **Auth:** опциональный Replit OIDC
- **Деплой:** Render

## Быстрый старт

```bash
# 1. Зависимости
npm ci

# 2. Конфиг — скопировать и заполнить
cp .env.example .env
#   обязательные: DATABASE_URL, SESSION_SECRET, AI_INTEGRATIONS_OPENAI_API_KEY

# 3. Применить миграции к БД
npm run db:push

# 4. Дев-сервер (Vite + Express на одном порту)
npm run dev
# → http://localhost:5000
```

## Импорт решений из GitHub

Скрипт парсит README awesome-листа, тянет метаданные и README каждого
найденного репозитория через GitHub API, нормализует их в человеческие
описания через LLM, подбирает тематическую фото из Unsplash и пишет в БД.
Дедуп по `source_url` — повторный запуск не плодит дубликаты.

```bash
npm run agents:import
```

Тюнинг через переменные окружения (см. [.env.example](.env.example)):

| Переменная | Значение по умолчанию | Описание |
|---|---|---|
| `AWESOME_LIST_REPO` | `e2b-dev/awesome-ai-agents` | Источник в формате `owner/repo` |
| `GITHUB_TOKEN` | — | PAT, поднимает лимит с 60 до 5000 req/h |
| `IMPORT_LIMIT` | `20` | Сколько решений импортировать за один запуск |
| `MIN_STARS` | `500` | Порог звёзд репо для фильтра шума |
| `IMPORT_CONCURRENCY` | `2` | Параллельные воркеры |

Для регулярного автоматического пополнения каталога — поставь команду на
cron в Render (раз в сутки), скрипт идемпотентен.

## Структура проекта

```
client/         React-приложение
server/         Express API + Drizzle ORM
shared/         Общая схема БД, типы, контракты API, контакты
migrations/     SQL-миграции для Postgres
script/         CLI-утилиты (build, kb:import, agents:import)
```

## Команды

| Команда | Назначение |
|---|---|
| `npm run dev` | Дев-сервер с HMR |
| `npm run build` | Прод-сборка (Vite + esbuild) |
| `npm run start` | Запуск собранной версии |
| `npm run check` | TypeScript typecheck |
| `npm run db:push` | Применить изменения схемы к БД |
| `npm run agents:import` | Импорт решений из GitHub awesome-листа |
| `npm run kb:import -- ./kb.json` | Залить документы в knowledge_base |

## Развёртывание

См. [DEPLOYMENT.md](DEPLOYMENT.md). В двух словах: Render как web-service,
DATABASE_URL и остальные секреты — в Environment, миграции применяются
вручную через `npm run db:push` или SQL в Supabase Dashboard.
