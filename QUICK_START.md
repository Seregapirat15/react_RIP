# 🚀 Быстрый старт

## Запуск приложения

```bash
# 1. Установить зависимости (если еще не установлены)
npm install

# 2. Запустить dev сервер
npm run dev

# 3. Открыть в браузере
# http://localhost:3000
```

## Переключение режимов

### Режим с mock данными

Откройте `src/services/api.ts`:

```typescript
const USE_MOCK = true; // ← Измените на true
```

### Режим с бэкендом

1. Запустите бэкенд на порту 8081
2. Откройте `src/services/api.ts`:

```typescript
const USE_MOCK = false; // ← Измените на false
```

## Структура страниц

| URL | Описание |
|-----|----------|
| `/` | Главная страница |
| `/services` | Список услуг с фильтрами |
| `/services/1` | Детали услуги (ID=1) |

## Файлы для показа преподавателю

### 1. Главный компонент

`src/App.tsx` - роутинг без Context

### 2. API с fetch

`src/services/api.ts` - fetch запросы, fallback на mock

### 3. Mock данные

`src/data/mockServices.ts` - тестовые данные

### 4. Компоненты навигации

- `src/components/NavigationBar.tsx` - Navbar (React-Bootstrap)
- `src/components/Breadcrumbs.tsx` - самописный breadcrumbs

### 5. Страницы

- `src/pages/HomePage.tsx` - главная страница
- `src/pages/ServicesListPage.tsx` - список с фильтрами ⭐
- `src/pages/ServiceDetailPage.tsx` - детали услуги

### 6. Конфигурация

- `vite.config.ts` - проксирование для CORS
- `tsconfig.json` - TypeScript

## Демонстрация фильтров

На странице `/services`:

1. **Название**: введите "экзо"
2. **Мин. цена**: 10000
3. **Макс. цена**: 20000
4. **Дата от**: 2024-02-01
5. **Дата до**: 2024-04-30
6. Нажмите **"Применить"**

В DevTools → Network увидите:
```
/api/services?name=экзо&min_price=10000&max_price=20000&start_date=2024-02-01&end_date=2024-04-30
```

## Ключевые моменты для защиты

### ✅ Выполнено

- [x] 3 страницы (главная, список, детали)
- [x] Navbar с React-Bootstrap
- [x] Самописный breadcrumbs
- [x] Фильтры (название, цена, даты)
- [x] Фильтрация на бэкенде (query params)
- [x] Fetch API (не axios)
- [x] Mock данные как fallback
- [x] Проксирование для CORS (vite.config.ts)
- [x] Изображения по умолчанию (SVG заглушка)
- [x] БЕЗ Context API
- [x] БЕЗ Redux
- [x] TypeScript
- [x] React-Bootstrap

### 🎯 Хуки в проекте

| Хук | Где используется | Для чего |
|-----|------------------|----------|
| `useState` | ServicesListPage | Фильтры, список услуг, loading |
| `useEffect` | ServicesListPage, ServiceDetailPage | Загрузка данных при монтировании |
| `useParams` | ServiceDetailPage | Получение ID из URL |
| `useLocation` | Breadcrumbs | Получение текущего пути |

### 📦 Props в проекте

```typescript
// Передача через Link
<Link to="/services/1">Подробнее</Link>

// Получение через useParams
const { id } = useParams<{ id: string }>();
```

### 🔄 Жизненный цикл

```typescript
useEffect(() => {
  // Монтирование: загружаем данные
  loadServices();
  
  // Размонтирование: cleanup (если нужно)
  return () => {
    console.log('Компонент размонтирован');
  };
}, []); // Пустой массив = один раз при монтировании
```

## Объяснение кода

### ServicesListPage (самый важный файл)

```typescript
// СОСТОЯНИЕ (useState)
const [services, setServices] = useState<Service[]>([]);
const [loading, setLoading] = useState(true);
const [nameFilter, setNameFilter] = useState('');
const [minPrice, setMinPrice] = useState('');
// ... другие фильтры

// ЭФФЕКТ (useEffect) - загрузка при монтировании
useEffect(() => {
  loadServices();
}, []);

// ФУНКЦИЯ ЗАГРУЗКИ
const loadServices = async () => {
  setLoading(true);
  
  // Формируем фильтры
  const filters: ServiceFilters = {};
  if (nameFilter) filters.name = nameFilter;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  // ...
  
  // Вызываем API (fetch)
  const data = await fetchServices(filters);
  setServices(data);
  
  setLoading(false);
};

// ОБРАБОТЧИК ПРИМЕНЕНИЯ ФИЛЬТРОВ
const handleApplyFilters = (e: React.FormEvent) => {
  e.preventDefault();
  loadServices(); // Перезагружаем с новыми фильтрами
};
```

### Fetch API (src/services/api.ts)

```typescript
export async function fetchServices(filters: ServiceFilters = {}): Promise<Service[]> {
  if (USE_MOCK) {
    // Используем mock данные
    return filterMockServices(filters);
  }

  try {
    // Формируем URL с query параметрами
    const queryString = buildQueryString(filters);
    const url = `/api/services${queryString ? `?${queryString}` : ''}`;
    
    // Fetch запрос
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка, используем mock:', error);
    // FALLBACK на mock при ошибке
    return filterMockServices(filters);
  }
}
```

### Breadcrumbs (самописный)

```typescript
const Breadcrumbs = () => {
  // Получаем текущий путь
  const location = useLocation();
  
  // Разбиваем на части: /services/1 → ['services', '1']
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Формируем breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { path: '/', label: 'Главная' }
  ];
  
  pathnames.forEach((segment, index) => {
    // Пропускаем числа (ID)
    if (!isNaN(Number(segment))) return;
    
    const path = '/' + pathnames.slice(0, index + 1).join('/');
    const label = pathLabels[segment] || segment;
    breadcrumbs.push({ path, label });
  });

  // Рендерим как список ссылок
  return (
    <nav>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return isLast ? (
          <span>{crumb.label}</span> // Последний - не ссылка
        ) : (
          <Link to={crumb.path}>{crumb.label}</Link>
        );
      })}
    </nav>
  );
};
```

## Проверка перед защитой

### Чеклист

- [ ] `npm install` выполнен
- [ ] `npm run dev` запускается без ошибок
- [ ] Открывается http://localhost:3000
- [ ] Главная страница отображается
- [ ] Страница /services показывает карточки
- [ ] Фильтры работают
- [ ] Клик "Подробнее" переходит на детали
- [ ] Breadcrumbs отображаются правильно
- [ ] Navbar работает
- [ ] DevTools → Network показывает запросы (если с бэкендом)

### Если что-то не работает

1. **Страница не открывается**
   ```bash
   # Проверьте что порт 3000 свободен
   netstat -ano | findstr :3000
   # Если занят, измените в vite.config.ts
   ```

2. **Ошибки TypeScript**
   ```bash
   # Переустановите зависимости
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Стили не загружаются**
   - Проверьте что в `src/App.tsx` есть:
   ```typescript
   import 'bootstrap/dist/css/bootstrap.min.css';
   ```

4. **CORS ошибки**
   - Включите USE_MOCK = true в `src/services/api.ts`
   - ИЛИ проверьте что бэкенд на порту 8081

## Полезные команды

```bash
# Установка
npm install

# Запуск dev сервера
npm run dev

# Сборка
npm run build

# Просмотр сборки
npm run preview

# Линтер
npm run lint
```

## Горячие клавиши

- `Ctrl + C` - остановить dev сервер
- `F12` - открыть DevTools
- `Ctrl + Shift + R` - жёсткая перезагрузка страницы

---

**Готово к защите! 🎉**

Открой `CONTROL_QUESTIONS.md` для подготовки к вопросам.


