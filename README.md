# React SPA — Система расчёта массы экзопланет

**Лабораторные 1–7** | Студент: Номоконов Владислав | Группа: ИУ5-53Б

## Запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:3000

---

## Лабораторная 7 — подготовка к защите

### Термины и определения

**Redux** — библиотека управления состоянием. Хранит данные в одном глобальном store, обновление только через actions и reducers.

**Redux Toolkit** — современная обёртка над Redux: `createSlice`, `createAsyncThunk`, Immer.

**Redux Thunk** — middleware для асинхронных действий: thunk-функция вызывает API и диспатчит действия по результату.

**Codegen (кодогенерация)** — автоматическая генерация API-клиента из OpenAPI/Swagger. В проекте — классы в `services/generated/`.

**М-м (многие-ко-многим)** — связь заявки с услугами: одна заявка содержит несколько услуг, одна услуга может быть в нескольких заявках. Таблица `calculation_instruments`.

**JWT** — JSON Web Token, хранится в `localStorage` как `auth_token`, отправляется в заголовке `Authorization: Bearer <token>`.

---

### Архитектура по требованию

| Область | Метод API | Redux | Примечание |
|--------|-----------|-------|------------|
| **Услуги (инструменты)** | `fetch()` без codegen | Обычные reducers в `instrumentsSlice` | Lab 6 / Лекция 10 |
| **Пользователь (auth)** | `fetch()` без codegen | Обычные reducers в `authSlice` | Lab 6 / Лекция 10 |
| **Заявки и м-м (9 запросов)** | Axios + codegen | Thunk в `cartSlice`, `ordersSlice`, `orderDetailSlice` | Лаб. 7 |

---

### 9 запросов по заявкам и м-м (codegen + thunk)

1. `GET /orders/cart` — иконка корзины (order_id, services_count)
2. `GET /orders` — список заявок с фильтрами
3. `GET /orders/:id` — одна заявка с услугами
4. `POST /orders/services` — добавить услугу в заявку
5. `DELETE /orders/:id/services/:sid` — удалить услугу из заявки
6. `PUT /orders/:id` — изменить заявку (примечания и т.п.)
7. `PUT /orders/:id/services/:sid` — изменить параметры м-м (название экзопланеты, звезда, период и т.д.)
8. `PUT /orders/:id/form` — сформировать заявку
9. `DELETE /orders/:id` — удалить заявку

---

### Redux Store — структура

```
store/
├── index.ts          — configureStore, все reducers
├── hooks.ts          — useAppDispatch, useAppSelector (типизированные)
├── filterSlice.ts    — фильтры каталога (search, type, min/max accuracy, dates)
├── instrumentsSlice.ts — список инструментов, текущий инструмент (без thunk)
├── authSlice.ts      — user, isAuthenticated (без thunk)
├── cartSlice.ts      — cart (order_id, services_count), thunk: fetchCart, addInstrument
├── ordersSlice.ts    — список заявок, thunk: fetchOrders
└── orderDetailSlice.ts — одна заявка, thunk: fetch, update, form, delete, removeService, updateParams
```

---

### Redux Slice — кратко

| Slice | Назначение | Thunk? |
|-------|------------|--------|
| **filterSlice** | Сохраняет фильтры при навигации (Главная → Каталог — значения остаются) | Нет |
| **instrumentsSlice** | `items`, `current`, `loading`, `error` для инструментов | Нет |
| **authSlice** | `user`, `isAuthenticated`, `loading`, `error` | Нет |
| **cartSlice** | `cart`, `addLoading`, thunk для корзины и добавления в заявку | Да |
| **ordersSlice** | `items`, `filterStatus`, `filterDateFrom/To`, thunk для списка | Да |
| **orderDetailSlice** | `order`, `actionLoading`, thunk для CRUD заявки и м-м | Да |

---

### Компоненты и страницы

| Компонент | Файл | Назначение |
|-----------|------|------------|
| **NavigationBar** | `components/NavigationBar.tsx` | Шапка: ссылки, имя пользователя, корзина, выход. При выходе диспатчит `logoutSuccess`, `resetFilters`, `resetCartState`, `resetOrdersState`, `clearOrderDetail`. |
| **Breadcrumbs** | `components/Breadcrumbs.tsx` | Хлебные крошки по текущему пути |
| **HomePage** | `pages/HomePage.tsx` | Главная |
| **InstrumentsPage** | `pages/InstrumentsPage.tsx` | Каталог: фильтры (Redux filterSlice), карточки, добавление в заявку (cartSlice thunk) |
| **InstrumentDetailPage** | `pages/InstrumentDetailPage.tsx` | Детальная страница инструмента (instrumentsSlice) |
| **LoginPage** | `pages/LoginPage.tsx` | Вход: `userService.loginUser()` + `dispatch(loginSuccess)` |
| **RegisterPage** | `pages/RegisterPage.tsx` | Регистрация: `userService.registerUser()` |
| **ProfilePage** | `pages/ProfilePage.tsx` | Профиль: `userService.updateUserProfile()` + `dispatch(setUser)` |
| **OrdersPage** | `pages/OrdersPage.tsx` | Список заявок: фильтр по статусу и дате формирования, thunk `fetchExoplanetCalculations` |
| **CalculationPage** | `pages/CalculationPage.tsx` | Заявка: 5 кнопок (Сохранить, Сформировать, Удалить заявку, Изменить/Удалить м-м) |

---

### URL по теме (расчёт экзопланет)

- `/calculation` — текущая заявка (черновик)
- `/calculation/:id` — заявка по id (черновик или сформированная)

---

### 5 кнопок на странице заявки (черновик)

1. **Сохранить заявку** — `PUT /orders/:id` (примечания)
2. **Сформировать** — `PUT /orders/:id/form`
3. **Удалить заявку** — `DELETE /orders/:id`
4. **Изменить** (в строке м-м) — `PUT /orders/:id/services/:sid` (параметры расчёта)
5. **Удалить** (в строке м-м) — `DELETE /orders/:id/services/:sid`

---

### Сервисы (без codegen) — Lab 6

| Сервис | Файл | Методы |
|--------|------|--------|
| **instrumentService** | `services/instrumentService.ts` | `fetchInstruments`, `fetchInstrumentById` — обычный `fetch()` |
| **userService** | `services/userService.ts` | `loginUser`, `registerUser`, `logoutUser`, `fetchCurrentUser`, `updateUserProfile` — обычный `fetch()` |

---

### Codegen (Axios)

| Модуль | Файл | Использование |
|--------|------|---------------|
| **axiosInstance** | `services/axiosInstance.ts` | База, JWT в interceptors |
| **ExoplanetCalculationsApi** | `services/generated/ExoplanetCalculationsApi.ts` | Заявки и м-м, названия по теме (Exoplanet, Calculation, Instrument) |

---

### Статусы заявки

| Статус | Описание |
|--------|----------|
| черновик | Редактируется, можно добавлять/удалять услуги |
| сформирован | Отправлена на рассмотрение |
| завершён | Модератор завершил, масса рассчитана |
| отклонён | Модератор отклонил |
| удалён | Помечена удалённой |

---

### Конфиг (target.ts)

- **Tauri**: `API_BASE_URL = http://<BACKEND_IP>:8081/api`
- **Localhost**: `API_BASE_URL = /api` (прокси Vite → 8081)
- **GitHub Pages**: `API_BASE_URL = http://127.0.0.1:8081/api` (если бэк на том же ПК)

---

### Что показывать на защите

1. **Авторизация** — вход, регистрация, профиль, выход.
2. **URL по теме** — `/calculation`, `/calculation/:id`.
3. **5 кнопок** — на странице черновика.
4. **Формирование** — кнопка «Сформировать», Network — PUT form.
5. **Список заявок** — фильтр по дате формирования, статусу, кнопка «Сброс».
6. **F5** — Redux DevTools: guest-состояние; Application: JWT в localStorage.
7. **Insomnia/Postman** — `GET /api/orders` с Bearer token из Application.
8. **Redux в коде** — `store/index.ts`, слайсы.
9. **Axios в codegen** — `axiosInstance.ts`, `ExoplanetCalculationsApi.ts`.
10. **Thunk + codegen** — `orderDetailSlice`, `ordersSlice`, `cartSlice` импортируют `ExoplanetCalculationsApi`.
11. **Доп**: услуги и пользователь — `fetch` + обычные reducers (без thunk).

---

## Структура

```
src/
├── config/         # target.ts (API URL, Tauri)
├── store/          # Redux slices и index
├── components/     # NavigationBar, Breadcrumbs
├── pages/          # Все страницы
├── services/       # instrumentService, userService, generated/, axiosInstance
├── types/          # Instrument, Order, OrderService, User, CartIcon и др.
└── data/           # mockData (fallback без бэкенда)
```

---

## Технологии

- React 18 + TypeScript
- Redux Toolkit
- React Router v6
- React-Bootstrap
- Vite + vite-plugin-pwa
- Tauri 2
- Axios (для codegen)
