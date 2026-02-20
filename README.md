# React SPA — Система расчёта массы экзопланет

**Лабораторные 1-6** | Студент: Номоконов Владислав | Группа: ИУ5-53Б

## Запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:3000

## Lab 6: Redux, PWA, GitHub Pages, Tauri

### Redux Toolkit
Фильтры услуг хранятся в Redux (`src/store/filterSlice.ts`). При переходе Главная → Инструменты → Главная → Инструменты значения фильтров сохраняются.

### PWA
PWA настроен через `vite-plugin-pwa`. В DevTools → Application можно проверить manifest и Service Worker, а также установить приложение (Install Application).

### GitHub Pages
```bash
npm install -D cross-env gh-pages
npm run deploy
```
Репо: `https://<user>.github.io/RIP_2025/`. При другом имени репо измените `BASE` в `vite.config.js` (переменная `GITHUB_PAGES`).

### Tauri
```bash
npm install -D @tauri-apps/api @tauri-apps/cli
npm run tauri dev   # режим разработки
npm run tauri build # сборка .exe
```
Для Tauri build: в `src/config/target.ts` укажите IP бэкенда в локальной сети (не localhost). Бэкенд и фронт должны быть в одной сети.

## Структура

```
src/
├── config/         # target.ts (API URL для Tauri/GH Pages)
├── store/          # Redux: filterSlice, hooks
├── components/     # NavigationBar, Breadcrumbs
├── pages/          # HomePage, InstrumentsPage, InstrumentDetailPage, ...
├── services/       # api.ts (fetch запросы)
├── types/          # TypeScript интерфейсы
└── data/           # Mock данные (fallback)
```

## Технологии

- React 18 + TypeScript
- Redux Toolkit (Lab 6)
- React Router DOM
- React-Bootstrap
- Vite + vite-plugin-pwa
- Tauri 2 (нативное приложение гостя)

