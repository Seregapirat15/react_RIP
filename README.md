# React SPA — Система расчёта массы экзопланет

**Лабораторная работа №5** | Студент: Номоконов Владислав | Группа: ИУ5-53Б

## Запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:3000

## Структура

```
src/
├── components/     # NavigationBar, Breadcrumbs
├── pages/          # HomePage, InstrumentsPage, InstrumentDetailPage, CalculationPage
├── services/       # api.ts (fetch запросы)
├── types/          # TypeScript интерфейсы
└── data/           # Mock данные (fallback)
```

## Технологии

- React 18 + TypeScript
- React Router DOM
- React-Bootstrap
- Vite (сборка + proxy)

## Особенности

- ✅ Фильтрация на бэкенде (поиск, тип, точность, дата)
- ✅ Mock fallback при недоступности сервера
- ✅ Самописные Breadcrumbs
- ✅ CORS через Vite proxy (`/api` → `localhost:8081`)
