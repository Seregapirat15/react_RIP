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


## Объяснение кода: фильтрация, props, хуки, вызовы fetch

Ниже — что можно сказать на защите и что подписать в отчёте.

### Компонент страницы каталога (InstrumentsPage)

- **Хуки (hooks):**
  - `useState` — для списка инструментов (`instruments`), загрузки (`loading`), фильтров (`searchQuery`, `typeFilter`, `minAccuracy`, `maxAccuracy`, `dateFrom`, `dateTo`), корзины (`cart`), сообщений (`message`). Каждый фильтр — отдельный кусок состояния.
  - `useEffect` — при монтировании вызывается `loadInstruments()` и `loadCart()` (запросы к API при открытии страницы).
  - `useNavigate` — программный переход (например на страницу заявки).

- **Вызовы fetch:**
  - Список инструментов: `fetchInstruments(filters)` в `api.ts` — внутри `fetch(API_BASE_URL + url)` с query-параметрами (`search`, `type`, `min_accuracy`, `max_accuracy`, `date_from`, `date_to`). URL вида `/api/services?type=ground&search=...`.
  - Корзина: `fetchCartIcon()` — `GET /api/orders/cart` (с авторизацией).
  - Добавление в заявку: `addToOrder(...)` — `POST /api/orders/services` с телом в JSON.

- **Фильтрация:**
  - Поля ввода (поиск, тип, точность, даты) хранятся в state. При нажатии «Найти» вызывается `handleSearch` → `loadInstruments()` с текущими значениями фильтров.
  - Параметры передаются в `fetchInstruments({ search, type, min_accuracy, max_accuracy, date_from, date_to })` и уходят в URL как query. Фильтрация выполняется на бэкенде; при fallback на mock — фильтрация на клиенте в `loadInstruments()` (filter по `name`, `full_name`, `type`, `accuracy`).

- **Props:**
  - Страница каталога не получает props от родителя (корневой роут). Внутри используются только state и данные из API. Дочерних компонентов с явными props в этом фрагменте нет — данные передаются в разметку напрямую (например `instruments.map(instrument => ...)`).

### Слой api.ts

- `fetchInstruments(filters)` — формирует `URLSearchParams` из объекта фильтров, добавляет их к пути `/services`, вызывает `apiRequest<Instrument[]>(url)`. Там один вызов `fetch(API_BASE_URL + url)` (то есть запрос идёт на тот же origin, proxy перенаправляет на бэкенд).
- В запросы с авторизацией подставляется заголовок `Authorization: Bearer <token>` (токен из `localStorage`).

**Кратко для подписи в отчёте:** *«Фильтрация: состояние фильтров в useState, при отправке формы — вызов fetch с query-параметрами (fetchInstruments). Хуки: useState для данных и фильтров, useEffect для первичной загрузки. Вызовы fetch централизованы в api.ts (GET /api/services с параметрами, GET /api/orders/cart, POST /api/orders/services).»*

