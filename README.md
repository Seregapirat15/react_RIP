# React SPA — Система расчёта массы экзопланет

**Лабораторные 1–7** | Студент: Номоконов Владислав | Группа: ИУ5-53Б

## Запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:3000

## Что сделано

- **Каталог инструментов** — список, фильтры (Redux), детальная страница (fetch без codegen, состояние в Redux).
- **Авторизация** — вход, регистрация, профиль, выход (fetch без codegen, состояние в Redux).
- **Заявки и расчёты** — 9 запросов по заявкам и м-м: codegen (Axios) + Redux Thunk (cart, orders, orderDetail).
- **Адаптивность** — медиазапросы, сетка карточек (1–2 колонки).
- **PWA** — manifest, Service Worker, установка на главный экран.
- **GitHub Pages** — https://seregapi15.github.io/react_RIP/
- **Tauri** — нативное приложение, подключение к бэкенду по IP в `src/config/target.ts`.

## Что показывать

1. **GitHub Pages + PWA на телефоне** — открыть сайт, сохранить как приложение, фильтрация, возврат — фильтры в Redux сохраняются.
2. **Адаптивность** — DevTools → режим устройства, изменение ширины, показать настройки в CSS.
3. **Локально с бэкендом** — бэкенд (8081) + `npm run dev` → localhost:3000 → каталог с API, Network — запросы к `/api` 200.
4. **Tauri build** — `npm run tauri build` → запуск .exe → каталог с данными, IP в `target.ts`, Wireshark — порт.
5. **Изменение в БД** — правка услуги в Adminer → обновить Tauri/браузер → новые данные.

## Структура

```
src/
├── config/         # target.ts (API URL)
├── store/          # Redux: filterSlice, instrumentsSlice, authSlice, cartSlice, ordersSlice, orderDetailSlice
├── components/     # NavigationBar, Breadcrumbs
├── pages/          # HomePage, InstrumentsPage, InstrumentDetailPage, LoginPage, RegisterPage, ProfilePage, OrdersPage, CalculationPage
├── services/       # instrumentService, userService (fetch), generated/ (codegen для заявок)
├── types/          # TypeScript интерфейсы
└── data/           # Mock (fallback без бэкенда)
```

## Технологии

- React 18 + TypeScript
- Redux Toolkit
- React Router DOM
- React-Bootstrap
- Vite + vite-plugin-pwa
- Tauri 2
