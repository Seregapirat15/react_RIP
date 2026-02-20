# План скриншотов для демонстрации Lab 7

## Подготовка

1. Запустить бэкенд: `docker-compose up --build` в `backend_RIP`
2. Запустить фронт: `npm run dev` в `react_RIP`
3. Открыть http://localhost:3000
4. Установить расширение Redux DevTools в браузере

---

## 1. Авторизация

**Скриншот 1.1 — Страница входа**
- Открыть `/login`
- Заполнить логин и пароль (можно оставить видимым для демонстрации)
- **Скрин:** форма входа

**Скриншот 1.2 — Успешный вход**
- Нажать «Войти»
- **Скрин:** главная или каталог с отображением имени пользователя в навигации (не «Вход», а имя/логин)

**Скриншот 1.3 — Регистрация (опционально)**
- Открыть `/register`
- **Скрин:** форма регистрации

---

## 2. Добавление в заявку и просмотр

**Скриншот 2.1 — URL по теме**
- Открыть в браузере адрес: `http://localhost:3000/instruments`
- Перейти в каталог, нажать «Добавить» у любого инструмента
- В адресной строке должно появиться: `http://localhost:3000/calculation` или `http://localhost:3000/calculation/1` (id заявки)
- **Скрин:** адресная строка с `/calculation` или `/calculation/:id` — URL назван по теме (расчёт/заявка)

**Скриншот 2.2 — Черновик по id**
- Открыть напрямую в адресной строке: `http://localhost:3000/calculation/1` (подставить реальный id вашей заявки)
- **Скрин:** страница заявки открывается по id (черновик)

**Скриншот 2.3 — Список инструментов + добавление**
- Каталог `/instruments`
- **Скрин:** карточки инструментов с кнопкой «Добавить»

---

## 3. Пять кнопок методов изменения заявки и м-м

Открыть страницу черновика `/calculation/:id` (черновик с хотя бы одним инструментом).

**Скриншот 3.1 — Кнопки управления заявкой**
- **Скрин:** блок с кнопками:
  1. **Сохранить заявку** (PUT order — изменение заявки)
  2. **Сформировать** (PUT order/form — формирование)
  3. **Удалить заявку** (DELETE order)
  4. **К списку заявок** / **К инструментам** (навигация)

**Скриншот 3.2 — Кнопки для м-м в таблице**
- В таблице «Инструменты в заявке» для каждой строки есть:
  5. **Изменить** (PUT order/:id/services/:sid — обновление параметров м-м)
  6. **Удалить** (DELETE order/:id/services/:sid — удаление из м-м)
- **Скрин:** таблица с кнопками «Изменить» и «Удалить» у инструмента

*Итого 5 методов: 3 для заявки (обновить, сформировать, удалить) + 2 для м-м (изменить параметры, удалить из заявки).*

---

## 4. Формирование заявки в режиме разработчика

**Скриншот 4.1 — До формирования**
- Черновик открыт, статус «Черновик»
- **Скрин:** статус «Черновик»

**Скриншот 4.2 — Нажатие «Сформировать»**
- Нажать «Сформировать»
- **Скрин:** сообщение «Заявка сформирована», статус «Сформирована»

**Скриншот 4.3 — DevTools**
- F12 → вкладка Network
- Повторить формирование (или другую операцию) — **Скрин:** запрос `PUT .../orders/1/form` со статусом 200

---

## 5. Список заявок с диапазоном даты формирования на сегодня

**Скриншот 5.1 — Страница заявок**
- Открыть `/orders`
- **Скрин:** форма фильтров с полями:
  - «Дата формирования от» — сегодняшняя дата
  - «Дата формирования до» — сегодняшняя дата
- По умолчанию в `ordersSlice.ts` задано: `filterDateFrom: today`, `filterDateTo: today`

**Скриншот 5.2 — Таблица заявок**
- Нажать «Найти»
- **Скрин:** таблица с заявками (колонки: Статус, Создана, Сформирована, Завершена, Инструменты, Итог. масса)

---

## 6. F5 → guest в Redux, JWT/сессия остались в Application

**Скриншот 6.1 — Перед F5**
- Быть авторизованным, находиться на любой странице

**Скриншот 6.2 — Redux DevTools (гостевой вид)**
- Нажать F5 (обновить страницу)
- Сразу после загрузки (до fetch текущего пользователя) открыть Redux DevTools
- Либо: нажать «Выход» → Redux переходит в guest (user: null, isAuthenticated: false)
- **Скрин:** Redux DevTools → state → auth: `{ user: null, isAuthenticated: false }` (или начальное состояние)

**Скриншот 6.3 — Application: JWT и сессия**
- F12 → вкладка Application
- **Local Storage** → `http://localhost:3000` → ключ `auth_token` — **Скрин:** значение JWT присутствует
- **Cookies** → `http://localhost:3000` → `session_id` — **Скрин:** кука есть (если бэкенд использует сессии)

*Примечание:* Если вы нажали «Выход», `auth_token` будет удалён. Для скриншота «JWT остался» нужно делать F5 без выхода — тогда после перезагрузки токен в localStorage остаётся.

---

## 7. Insomnia/Postman: заявки пользователя по JWT из Application

**Скриншот 7.1 — Копирование токена**
- F12 → Application → Local Storage → `auth_token`
- Скопировать значение (длинная строка JWT)

**Скриншот 7.2 — Запрос в Insomnia/Postman**
- Создать запрос: `GET http://localhost:8081/api/orders`
- Заголовки: `Authorization: Bearer <вставленный_токен>`, `Content-Type: application/json`
- Отправить запрос
- **Скрин:** ответ 200 с массивом заявок пользователя

**Скриншот 7.3 — Альтернатива: через Cookie**
- Если бэкенд отдаёт заявки по session_id из Cookie: скопировать `session_id` из Application → Cookies
- В Insomnia/Postman включить отправку Cookie и добавить `session_id`
- **Скрин:** запрос с Cookie и успешный ответ

---

## 8. Все состояния Redux в коде

**Скриншот 8.1 — Store**
- Файл: `src/store/index.ts`
- **Скрин:** reducer'ы: `instrumentFilters`, `instruments`, `auth`, `orders`, `orderDetail`, `cart`

**Скриншот 8.2 — Slice'ы**
- `src/store/filterSlice.ts` — фильтры
- `src/store/instrumentsSlice.ts` — инструменты
- `src/store/authSlice.ts` — авторизация
- `src/store/ordersSlice.ts` — список заявок
- `src/store/orderDetailSlice.ts` — детали заявки
- `src/store/cartSlice.ts` — корзина/иконка
- **Скрин:** можно сделать 1 общий или по 1 на слайс (первые строки с `initialState`)

---

## 9. Axios в кодогенерации

**Скриншот 9.1 — axiosInstance**
- Файл: `src/services/axiosInstance.ts`
- **Скрин:** `import axios from 'axios'`, `axios.create`, interceptors

**Скриншот 9.2 — ExoplanetCalculationsApi**
- Файл: `src/services/generated/ExoplanetCalculationsApi.ts`
- **Скрин:** импорт `axiosInstance`, вызовы `axiosInstance.get`, `axiosInstance.post`, `axiosInstance.put`, `axiosInstance.delete`

---

## 10. Сгенерированный код из Swagger в Thunk, названия по теме

**Скриншот 10.1 — orderDetailSlice**
- Файл: `src/store/orderDetailSlice.ts`
- **Скрин:** импорт `ExoplanetCalculationsApi`, thunk'и: `fetchExoplanetCalculationById`, `updateExoplanetCalculation`, `formExoplanetCalculation`, `deleteExoplanetCalculation`, `removeInstrumentFromCalculation`, `updateCalculationInstrumentParams`

**Скриншот 10.2 — ordersSlice**
- Файл: `src/store/ordersSlice.ts`
- **Скрин:** `ExoplanetCalculationsApi.getExoplanetCalculations` в thunk `fetchExoplanetCalculations`

**Скриншот 10.3 — cartSlice**
- Файл: `src/store/cartSlice.ts`
- **Скрин:** `ExoplanetCalculationsApi.getExoplanetCalculationCartIcon`, `ExoplanetCalculationsApi.addInstrumentToCalculation`

**Названия по теме:** Exoplanet*, Calculation*, Instrument* — тема «расчёт массы экзопланет».

---

## Доп. (Lab 7 доп): без codegen/thunk для услуг и пользователя

**Скриншот Доп.1 — Услуги: fetch без codegen**
- Файл: `src/services/instrumentService.ts`
- **Скрин:** `fetch()` вместо axios, без `ExoplanetInstrumentsApi`

**Скриншот Доп.2 — Услуги: Redux без thunk**
- Файл: `src/store/instrumentsSlice.ts`
- **Скрин:** только `reducers` (setInstruments, setInstrumentsLoading и т.д.), нет `createAsyncThunk`

**Скриншот Доп.3 — Пользователь: fetch без codegen**
- Файл: `src/services/userService.ts`
- **Скрин:** `fetch()` для login, register, logout, profile

**Скриншот Доп.4 — Пользователь: Redux без thunk**
- Файл: `src/store/authSlice.ts`
- **Скрин:** только `reducers` (loginSuccess, logoutSuccess, setUser), нет `createAsyncThunk`

---

## Краткий чек-лист

| № | Что показать | Файл / Действие |
|---|--------------|-----------------|
| 1 | Авторизация | /login, форма, успешный вход |
| 2 | URL по теме, черновик по id | /calculation, /calculation/:id |
| 3 | 5 кнопок методов | CalculationPage: Сохранить, Сформировать, Удалить заявку, Изменить, Удалить (м-м) |
| 4 | Формирование в dev | Кнопка «Сформировать», Network |
| 5 | Список заявок, даты сегодня | /orders, filterDateFrom/To |
| 6 | F5, Redux guest, JWT в Application | Redux DevTools, Application → Local Storage |
| 7 | Insomnia/Postman с JWT | GET /api/orders + Bearer token |
| 8 | Redux состояния в коде | store/index.ts, slice'ы |
| 9 | Axios в codegen | axiosInstance.ts, ExoplanetCalculationsApi.ts |
| 10 | Thunk + сгенерированный код | orderDetailSlice, ordersSlice, cartSlice |
| Доп | Услуги/пользователь без codegen и thunk | instrumentService, userService, instrumentsSlice, authSlice |
