# Ответы на контрольные вопросы

Подробные ответы на вопросы для защиты лабораторной работы №5.

---

## 1. React

**Вопрос:** Что такое React?

**Ответ:**
React - это JavaScript библиотека с открытым исходным кодом для создания пользовательских интерфейсов. Разработана Facebook (Meta).

**Основные особенности:**
- **Компонентный подход** - UI разбивается на независимые переиспользуемые компоненты
- **Виртуальный DOM** - React создает виртуальное представление DOM и эффективно обновляет только измененные части
- **Однонаправленный поток данных** - данные передаются от родителя к ребенку через props
- **Декларативность** - описываем "что" должно быть отображено, а не "как"

**В нашем проекте:**
- Используем функциональные компоненты
- Три основных компонента страниц: HomePage, ServicesListPage, ServiceDetailPage
- Два вспомогательных компонента: NavigationBar, Breadcrumbs

---

## 2. Props и состояние

**Вопрос:** В чём разница между props и state?

**Ответ:**

| Аспект | Props | State |
|--------|-------|-------|
| **Изменяемость** | Неизменяемы (read-only) | Изменяемы через setState/useState |
| **Откуда берутся** | Передаются от родительского компонента | Создаются внутри компонента |
| **Кто может изменить** | Только родительский компонент | Сам компонент |
| **Назначение** | Конфигурация компонента | Внутреннее состояние компонента |

**Props в нашем проекте:**
```typescript
// В Link передаем props через to
<Link to="/services/1">Подробнее</Link>

// В ServiceDetailPage получаем через useParams
const { id } = useParams<{ id: string }>();
```

**State в нашем проекте:**
```typescript
// В ServicesListPage
const [services, setServices] = useState<Service[]>([]);
const [loading, setLoading] = useState(true);
const [nameFilter, setNameFilter] = useState('');
```

---

## 3. Компонент и элемент

**Вопрос:** Что такое компонент и элемент в React?

**Ответ:**

**Компонент:**
- Функция или класс, который возвращает React элементы
- Принимает props как аргументы
- Может иметь собственное состояние
- Переиспользуемый блок UI

```typescript
// Компонент
const NavigationBar = () => {
  return <Navbar>...</Navbar>;
};
```

**Элемент:**
- Простой объект, описывающий DOM узел или компонент
- Неизменяемый (immutable)
- Дешевый в создании
- То, что возвращает компонент

```typescript
// Элемент компонента
<NavigationBar />

// Элемент DOM
<div className="container">Текст</div>
```

**В нашем проекте:**
- `NavigationBar` - это **компонент**
- `<NavigationBar />` - это **элемент** компонента NavigationBar
- `<div>` - это **элемент** DOM

---

## 4. useState и useEffect

**Вопрос:** Для чего используются хуки useState и useEffect?

**Ответ:**

### useState

Добавляет локальное состояние в функциональный компонент.

**Синтаксис:**
```typescript
const [state, setState] = useState(initialValue);
```

**В нашем проекте:**
```typescript
// ServicesListPage.tsx
const [services, setServices] = useState<Service[]>([]);
const [loading, setLoading] = useState(true);
const [nameFilter, setNameFilter] = useState('');

// Изменение состояния
setLoading(false);
setServices(data);
setNameFilter(e.target.value);
```

### useEffect

Выполняет побочные эффекты в функциональных компонентах (запросы к API, подписки, таймеры).

**Синтаксис:**
```typescript
useEffect(() => {
  // Код эффекта
  
  return () => {
    // Cleanup функция (опционально)
  };
}, [dependencies]); // Массив зависимостей
```

**В нашем проекте:**
```typescript
// ServicesListPage.tsx
useEffect(() => {
  loadServices(); // Загружаем услуги при монтировании
}, []); // Пустой массив = выполнится один раз

// ServiceDetailPage.tsx
useEffect(() => {
  loadService();
}, [id]); // Выполнится при изменении id
```

---

## 5. Жизненный цикл компонента

**Вопрос:** Что такое жизненный цикл компонента?

**Ответ:**

Жизненный цикл - это последовательность фаз, через которые проходит компонент от создания до удаления.

### Три основные фазы:

#### 1. Монтирование (Mounting)
Компонент создается и вставляется в DOM

**В функциональных компонентах:**
```typescript
useEffect(() => {
  console.log('Компонент смонтирован');
  loadServices(); // Загрузка данных
}, []); // Пустой массив зависимостей
```

#### 2. Обновление (Updating)
Компонент перерисовывается при изменении props или state

```typescript
useEffect(() => {
  console.log('ID изменился, перезагружаем данные');
  loadService();
}, [id]); // Выполнится при изменении id
```

#### 3. Размонтирование (Unmounting)
Компонент удаляется из DOM

```typescript
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  
  // Cleanup функция вызывается при размонтировании
  return () => {
    clearInterval(timer);
    console.log('Компонент размонтирован');
  };
}, []);
```

**В нашем проекте:**
- При переходе на `/services` - ServicesListPage монтируется, загружаются услуги
- При изменении фильтров - компонент обновляется, перерисовываются карточки
- При переходе на другую страницу - компонент размонтируется

---

## 6. CORS и обратный прокси

**Вопрос:** Что такое CORS и как решается через обратный прокси?

**Ответ:**

### CORS (Cross-Origin Resource Sharing)

**Что это:**
Механизм безопасности браузера, ограничивающий запросы между разными доменами.

**Проблема:**
```
Frontend: http://localhost:3000
Backend:  http://localhost:8081

❌ Браузер блокирует запрос из-за разных портов (разные origin)
```

**Ошибка в консоли:**
```
Access to fetch at 'http://localhost:8081/api/services' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

### Обратный прокси (Reverse Proxy)

**Решение через Vite:**

В `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
```

**Как работает:**
```
1. Frontend делает запрос: fetch('/api/services')
2. Vite перехватывает запрос к /api
3. Vite перенаправляет на http://localhost:8081/api/services
4. Бэкенд отвечает Vite
5. Vite отдает ответ Frontend

✅ Браузер видит: запрос на тот же origin (localhost:3000)
✅ CORS не срабатывает, т.к. для браузера это "свой" домен
```

**Важно:**
- Работает только в dev режиме
- В production нужно настраивать CORS на бэкенде или использовать nginx/apache

---

## 7. Vite и Babel

**Вопрос:** Что такое Vite и Babel, в чём их различия?

**Ответ:**

### Babel

**Что это:**
Транспилятор JavaScript - преобразует современный JS/JSX в старый JS для поддержки старых браузеров.

**Что делает:**
```javascript
// Современный код
const arrow = () => {};
const [a, b] = array;

// Babel транспилирует в:
var arrow = function() {};
var a = array[0];
var b = array[1];
```

**Используется в:**
- Create React App
- Webpack + babel-loader
- Next.js

### Vite

**Что это:**
Современный сборщик и dev-сервер для фронтенд приложений.

**Особенности:**
- **ESM (ES Modules)** - использует нативные модули браузера в dev режиме
- **esbuild** - использует esbuild (написан на Go) вместо Babel для транспиляции
- **Instant HMR** - мгновенная горячая замена модулей
- **Быстрый старт** - не собирает весь проект при запуске

**Сравнение:**

| Аспект | Webpack + Babel | Vite |
|--------|-----------------|------|
| Язык | JavaScript | JavaScript + Go (esbuild) |
| Скорость dev старта | Медленная (5-30 сек) | Мгновенная (< 1 сек) |
| HMR | Медленный | Мгновенный |
| Сборка prod | Babel | Rollup + esbuild |
| Конфигурация | Сложная | Простая |

**В нашем проекте:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Использует esbuild

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: { /* ... */ }
  },
});
```

---

## 8. BFF и GraphQL

**Вопрос:** Что такое BFF и GraphQL?

**Ответ:**

### BFF (Backend for Frontend)

**Что это:**
Паттерн архитектуры, где для каждого типа клиента создается отдельный бэкенд.

**Проблема:**
```
                  ┌─ Auth Service
Mobile App        ├─ User Service  
Web App      ────►├─ Order Service
Desktop App       ├─ Payment Service
                  └─ Notification Service

❌ Каждый клиент делает много запросов
❌ Разные клиенты нужны разные данные
❌ Логика агрегации данных дублируется
```

**Решение BFF:**
```
Mobile App  ────► Mobile BFF  ────┐
Web App     ────► Web BFF     ────┤
Desktop App ────► Desktop BFF ────┤
                                  │
                                  ├─ Auth Service
                                  ├─ User Service
                                  ├─ Order Service
                                  └─ Payment Service

✅ Один запрос от клиента
✅ BFF агрегирует данные из микросервисов
✅ Каждый BFF оптимизирован под свой клиент
```

**Преимущества:**
- Оптимизация под конкретный клиент
- Уменьшение количества запросов
- Независимое развитие frontend и backend команд

### GraphQL

**Что это:**
Язык запросов для API, разработанный Facebook. Альтернатива REST.

**REST проблемы:**
```javascript
// REST: нужно 3 запроса
GET /users/1           → { id: 1, name: "John" }
GET /users/1/posts     → [{ id: 1, title: "Post" }]
GET /posts/1/comments  → [{ id: 1, text: "Comment" }]
```

**GraphQL решение:**
```graphql
# GraphQL: один запрос, только нужные поля
query {
  user(id: 1) {
    name
    posts {
      title
      comments {
        text
      }
    }
  }
}
```

**Преимущества GraphQL:**
- **Один endpoint** - вместо множества REST endpoint'ов
- **Запрос только нужных данных** - нет overfetching/underfetching
- **Строгая типизация** - схема описывает все типы
- **Интроспекция** - API самодокументируемое

**Недостатки:**
- Сложность на бэкенде
- Кэширование сложнее чем в REST
- Нет стандартной обработки ошибок HTTP кодами

**Когда использовать:**
- Сложные взаимосвязанные данные
- Разные клиенты с разными потребностями
- Нужна гибкость в запросах

---

## 9. Next.js и SSG

**Вопрос:** Что такое Next.js и SSG?

**Ответ:**

### Next.js

**Что это:**
React-фреймворк для production, разработанный Vercel.

**Что добавляет к React:**
- **SSR** (Server-Side Rendering) - рендеринг на сервере
- **SSG** (Static Site Generation) - генерация статики
- **File-based routing** - роутинг через файловую систему
- **API Routes** - встроенный бэкенд
- **Image optimization** - оптимизация изображений
- **Automatic code splitting** - автоматическое разделение кода

**Сравнение с обычным React:**

| Аспект | React (Vite/CRA) | Next.js |
|--------|------------------|---------|
| Рендеринг | CSR (Client-Side) | SSR/SSG/CSR |
| SEO | Плохое | Отличное |
| Первая загрузка | Медленная | Быстрая |
| Роутинг | React Router (вручную) | Файловая система |
| Backend | Отдельно | API Routes встроены |

### SSG (Static Site Generation)

**Что это:**
Генерация HTML страниц на этапе сборки (build time), а не во время запроса.

**Как работает:**

**CSR (Client-Side Rendering) - наш проект:**
```
1. Браузер запрашивает страницу
2. Сервер отдает пустой HTML + JS bundle
3. Браузер скачивает и выполняет JS
4. React монтируется
5. Выполняется fetch('/api/services')
6. Отображаются данные

❌ SEO: поисковики видят пустую страницу
❌ Первая загрузка медленная
✅ Быстрая навигация после загрузки
```

**SSG (Static Site Generation):**
```
На этапе сборки:
1. Next.js выполняет fetch('/api/services')
2. Генерирует готовый HTML с данными
3. Сохраняет статические файлы

При запросе:
1. Браузер запрашивает страницу
2. Сервер отдает готовый HTML
3. Страница отображается мгновенно
4. React "гидратирует" страницу (делает интерактивной)

✅ SEO: поисковики видят полный контент
✅ Первая загрузка быстрая
✅ Можно хостить на CDN
❌ Данные могут устареть между билдами
```

**Пример Next.js с SSG:**
```typescript
// pages/services.tsx
export async function getStaticProps() {
  // Выполняется на этапе сборки
  const res = await fetch('http://api.example.com/services');
  const services = await res.json();

  return {
    props: { services },
    revalidate: 60, // ISR: обновлять каждые 60 сек
  };
}

export default function ServicesPage({ services }) {
  // HTML уже содержит список services
  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} {...service} />
      ))}
    </div>
  );
}
```

**Когда использовать SSG:**
- Блоги, документация
- Маркетинговые сайты
- E-commerce (каталог товаров)
- Любой контент, который редко меняется

---

## 10. FSD (Feature-Sliced Design)

**Вопрос:** Что такое FSD?

**Ответ:**

### Feature-Sliced Design

**Что это:**
Архитектурная методология для организации frontend проектов. Решает проблемы масштабирования и поддержки кода.

**Проблемы традиционного подхода:**
```
src/
  components/         ❌ Все компоненты в одной папке
  utils/             ❌ Все утилиты вместе
  pages/             ❌ Сложно найти связанный код
  hooks/             ❌ Сложно удалить фичу
```

**FSD структура:**
```
src/
  app/              # Инициализация приложения
    providers/
    styles/
  
  pages/            # Страницы (роуты)
    home/
    services-list/
    service-detail/
  
  widgets/          # Сложные UI блоки
    header/
    footer/
    filters-panel/
  
  features/         # Бизнес-фичи (действия пользователя)
    filter-services/
    add-to-order/
  
  entities/         # Бизнес-сущности
    service/
      model/        # Типы, стор
      api/          # API запросы
      ui/           # UI компоненты
  
  shared/           # Переиспользуемый код
    ui/             # UI-kit
    api/            # Базовая настройка API
    lib/            # Утилиты
    config/         # Конфигурация
```

### Слои FSD (снизу вверх):

1. **shared** - базовые переиспользуемые вещи
   - Не зависит ни от чего
   - Примеры: Button, Input, formatDate()

2. **entities** - бизнес-сущности
   - Может использовать: shared
   - Примеры: Service, User, Order

3. **features** - действия пользователя
   - Может использовать: shared, entities
   - Примеры: FilterServices, AddToCart, Login

4. **widgets** - композиции из features
   - Может использовать: shared, entities, features
   - Примеры: Header, Sidebar, FiltersPanel

5. **pages** - страницы приложения
   - Может использовать: shared, entities, features, widgets
   - Примеры: HomePage, ServiceListPage

6. **app** - инициализация
   - Использует все слои
   - Providers, Router, глобальные стили

### Правила FSD:

1. **Слой может импортировать только из нижележащих слоев**
   ```typescript
   // ✅ Правильно
   import { Button } from 'shared/ui';
   import { Service } from 'entities/service';
   
   // ❌ Неправильно
   import { Header } from 'widgets/header'; // в entities
   ```

2. **Слайсы одного слоя не знают друг о друге**
   ```typescript
   // В entities/service
   
   // ❌ Неправильно
   import { User } from 'entities/user';
   
   // ✅ Правильно (через верхний слой)
   // В features/service-owner
   import { Service } from 'entities/service';
   import { User } from 'entities/user';
   ```

3. **Public API** - каждый слайс экспортирует только нужное
   ```typescript
   // entities/service/index.ts
   export { ServiceCard } from './ui/ServiceCard';
   export { fetchServices } from './api/fetchServices';
   export type { Service } from './model/types';
   
   // Внутренние детали скрыты
   // ❌ Нельзя: import from 'entities/service/ui/ServiceCard/helpers'
   // ✅ Можно: import from 'entities/service'
   ```

### Преимущества FSD:

- ✅ **Масштабируемость** - легко добавлять фичи
- ✅ **Предсказуемость** - всегда знаешь где что лежит
- ✅ **Изоляция** - фичи не зависят друг от друга
- ✅ **Удаление кода** - удалил папку = удалил фичу
- ✅ **Onboarding** - новички быстро разбираются

### Наш проект vs FSD:

**Текущая структура** (простая):
```
src/
  components/
  pages/
  services/
  types/
  data/
```

**С FSD было бы:**
```
src/
  app/
    providers/
    App.tsx
  
  pages/
    home/
    services-list/
    service-detail/
  
  widgets/
    navigation-bar/
    breadcrumbs/
  
  features/
    filter-services/
      ui/FilterForm.tsx
      model/useFilters.ts
  
  entities/
    service/
      model/types.ts
      api/fetchServices.ts
      ui/ServiceCard.tsx
  
  shared/
    ui/
      Button/
      Card/
    lib/
      formatDate.ts
```

**Когда использовать FSD:**
- Проект больше 10-15 компонентов
- Команда > 2-3 разработчиков
- Долгосрочная поддержка
- Много бизнес-логики

**Когда НЕ использовать:**
- Маленькие проекты (< 10 компонентов)
- Прототипы и MVP
- Лендинги и простые сайты

---

## Дополнительные вопросы

### Чем хуки отличаются от классовых компонентов?

**Классовый компонент:**
```typescript
class ServicesList extends React.Component {
  state = { services: [] };
  
  componentDidMount() {
    this.loadServices();
  }
  
  render() {
    return <div>{this.state.services}</div>;
  }
}
```

**Функциональный с хуками:**
```typescript
const ServicesList = () => {
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    loadServices();
  }, []);
  
  return <div>{services}</div>;
};
```

**Преимущества хуков:**
- Проще и короче код
- Легче переиспользовать логику (custom hooks)
- Нет проблем с `this`
- Лучше минифицируется

### Что такое Virtual DOM?

**Virtual DOM** - легковесная копия реального DOM в памяти.

**Как работает:**
1. При изменении state React создает новое Virtual DOM дерево
2. Сравнивает с предыдущим (diffing)
3. Вычисляет минимальные изменения
4. Обновляет только измененные части реального DOM

**Преимущества:**
- Быстрее прямых манипуляций с DOM
- Batch обновления
- Простота использования

### Что такое reconciliation?

**Reconciliation** - процесс сравнения Virtual DOM деревьев и обновления реального DOM.

**Алгоритм:**
1. Если тип элемента изменился - полная перерисовка
2. Если props изменились - обновление атрибутов
3. Если children изменились - рекурсивная проверка

**Key prop:**
```typescript
// ❌ Без key - React не знает какой элемент изменился
services.map(s => <Card>{s.name}</Card>)

// ✅ С key - React знает и оптимизирует
services.map(s => <Card key={s.id}>{s.name}</Card>)
```

---

## Резюме по нашему проекту

**Используемые технологии:**
- React 18 (функциональные компоненты)
- TypeScript (типизация)
- React Router DOM (клиентский роутинг)
- React-Bootstrap (UI компоненты)
- Vite (сборщик, dev-сервер, прокси)

**Хуки:**
- `useState` - локальное состояние (фильтры, данные, loading)
- `useEffect` - загрузка данных при монтировании
- `useParams` - получение параметров из URL
- `useLocation` - получение текущего пути

**Паттерны:**
- Компонентный подход
- Однонаправленный поток данных
- Разделение на презентационные компоненты
- Mock данные как fallback
- Обработка ошибок

**Фичи:**
- Три страницы (Home, ServicesList, ServiceDetail)
- Navbar (React-Bootstrap)
- Breadcrumbs (самописный)
- Фильтрация на бэкенде
- Fetch API с fallback
- Изображения с заглушками
- Responsive дизайн

Удачи на защите! 🚀


