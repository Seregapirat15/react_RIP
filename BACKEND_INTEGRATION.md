# 🔗 Интеграция фронтенда и бэкенда

## Архитектура системы

```
┌─────────────────┐      Proxy       ┌──────────────────┐
│  React Frontend │  /api → :8081    │   Go Backend     │
│   (Vite)        │ ────────────────► │   (Gin)          │
│   Port: 3000    │                   │   Port: 8081     │
└─────────────────┘                   └──────────────────┘
                                              │
                                              ├─► PostgreSQL (5432)
                                              ├─► Redis (6379)
                                              └─► MinIO (9000)
```

## Шаг 1: Клонирование и запуск бэкенда

### 1.1 Перейти в родительскую директорию

```bash
cd C:\Users\exxor\RIP_2025
```

### 1.2 Клонировать бэкенд (если ещё не клонирован)

```bash
# Если репозиторий уже есть - пропустите этот шаг
git clone https://github.com/Seregapirat15/RIP_2025.git backend_RIP
cd backend_RIP
git checkout authentication-implementation
```

**ИЛИ** если уже клонирован:

```bash
cd backend_RIP  # или как у тебя называется директория
git pull
git checkout authentication-implementation
```

### 1.3 Запустить бэкенд через Docker Compose

```bash
# Запуск всех сервисов (PostgreSQL, Redis, MinIO, Backend)
docker-compose up --build
```

Должны запуститься:
- ✅ PostgreSQL на порту **5432**
- ✅ Redis на порту **6379**
- ✅ Backend API на порту **8081**
- ✅ Adminer на порту **8080**

### 1.4 Проверить что бэкенд работает

Откройте в браузере:
- **API Health**: http://localhost:8081/health
- **Swagger**: http://localhost:8081/swagger/
- **Adminer** (БД): http://localhost:8080

## Шаг 2: Настройка фронтенда

### 2.1 Проверить настройки прокси

В `vite.config.ts` уже настроено:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
  },
}
```

✅ Готово, ничего менять не нужно!

### 2.2 Проверить USE_MOCK в api.ts

В `src/services/api.ts` должно быть:

```typescript
const USE_MOCK = false; // Работа с бэкендом
```

✅ Уже настроено!

### 2.3 Запустить фронтенд

```bash
# В директории react_RIP
cd C:\Users\exxor\RIP_2025\react_RIP
npm run dev
```

Фронтенд запустится на http://localhost:3000

## Шаг 3: Проверка интеграции

### 3.1 Открыть приложение

Откройте в браузере: **http://localhost:3000**

### 3.2 Открыть DevTools (F12)

Перейдите на вкладку **Network**

### 3.3 Перейти на страницу услуг

Нажмите на **"Услуги"** в навигации или перейдите на http://localhost:3000/services

### 3.4 Проверить запрос

В Network вы должны увидеть:

```
GET http://localhost:3000/api/services
```

**Status**: 200 OK (если бэкенд запущен)

**Response**: JSON с услугами из вашей БД

### 3.5 Если видите mock данные

Это означает что:
- Либо бэкенд не запущен на порту 8081
- Либо бэкенд не отвечает
- **Fallback** сработал и загрузились mock данные

**Решение**: убедитесь что `docker-compose up` запущен и работает

## Структура БД (из вашего бэкенда)

### Таблица services

```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Добавление тестовых услуг

```sql
-- Подключитесь к БД через Adminer (localhost:8080)
-- Или через psql

INSERT INTO services (name, description, price, image_url) VALUES
('Расчёт массы экзопланеты методом радиальных скоростей', 
 'Определение массы экзопланеты по изменению скорости звезды', 
 15000, 
 'http://localhost:9000/exoplanets/radial-velocity.jpg'),
 
('Транзитная фотометрия экзопланет', 
 'Измерение массы по изменению яркости звезды при прохождении планеты', 
 12000, 
 'http://localhost:9000/exoplanets/transit.jpg'),
 
('Астрометрический анализ', 
 'Определение массы по гравитационному влиянию на положение звезды', 
 18000, 
 NULL),
 
('Микролинзирование', 
 'Расчёт массы методом гравитационного микролинзирования', 
 20000, 
 'http://localhost:9000/exoplanets/microlensing.jpg'),
 
('Прямое наблюдение экзопланет', 
 'Определение параметров планеты методом прямой визуализации', 
 25000, 
 'http://localhost:9000/exoplanets/direct-imaging.jpg'),
 
('Комплексный анализ системы', 
 'Полный анализ экзопланетной системы с использованием нескольких методов', 
 35000, 
 NULL);
```

## Работа с фильтрами

Ваш бэкенд уже поддерживает фильтрацию! 

### API Endpoint

```
GET /api/services?name=экзо&min_price=10000&max_price=20000&start_date=2024-01-01&end_date=2024-12-31
```

### Код бэкенда (Go)

Из вашего репозитория видно что фильтрация реализована.

Фронтенд уже отправляет правильные параметры:

```typescript
// src/services/api.ts
function buildQueryString(filters: ServiceFilters): string {
  const params = new URLSearchParams();
  
  if (filters.name) params.append('name', filters.name);
  if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
  if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  
  return params.toString();
}
```

✅ **Готово!** Фильтры работают автоматически.

## Демонстрация для лабы

### Сценарий 1: Работа с mock данными (без бэкенда)

1. **Остановите Docker** (если запущен):
   ```bash
   docker-compose down
   ```

2. В `src/services/api.ts` установите:
   ```typescript
   const USE_MOCK = true;
   ```

3. Запустите фронтенд:
   ```bash
   npm run dev
   ```

4. Покажите преподавателю:
   - Главную страницу
   - Список услуг (6 mock услуг)
   - Детали услуги
   - Работу фильтров (фильтрация на клиенте)

### Сценарий 2: Работа с бэкендом

1. **Запустите Docker**:
   ```bash
   cd C:\Users\exxor\RIP_2025\backend_RIP
   docker-compose up
   ```

2. В `src/services/api.ts` установите:
   ```typescript
   const USE_MOCK = false;
   ```

3. Запустите фронтенд:
   ```bash
   cd C:\Users\exxor\RIP_2025\react_RIP
   npm run dev
   ```

4. Откройте DevTools → Network

5. Покажите преподавателю:
   - Запросы к `/api/services`
   - Proxy работает (localhost:3000 → localhost:8081)
   - Параметры фильтрации в URL
   - Данные приходят из PostgreSQL

### Сценарий 3: Изменения в БД отражаются во фронтенде

1. Откройте **Adminer**: http://localhost:8080
   - Server: `postgres`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `exoplanet_db`

2. Добавьте новую услугу:
   ```sql
   INSERT INTO services (name, description, price) 
   VALUES ('Тестовая услуга', 'Описание тестовой услуги', 9999);
   ```

3. Обновите страницу фронтенда (F5)

4. Покажите что новая услуга появилась

5. Измените цену:
   ```sql
   UPDATE services SET price = 5000 WHERE name = 'Тестовая услуга';
   ```

6. Обновите страницу - цена изменилась

7. Удалите услугу:
   ```sql
   DELETE FROM services WHERE name = 'Тестовая услуга';
   ```

8. Обновите страницу - услуга исчезла

## Изображения из MinIO

Если у вас настроен MinIO, изображения будут отображаться по URL:

```
http://localhost:9000/exoplanets/image.jpg
```

В DevTools → Network покажите запросы к MinIO.

## Troubleshooting

### Проблема 1: Бэкенд не запускается

```bash
# Проверьте что Docker запущен
docker ps

# Пересоздайте контейнеры
docker-compose down
docker-compose up --build
```

### Проблема 2: CORS ошибка

Убедитесь что в бэкенде настроен CORS для localhost:3000.

В вашем бэкенде должно быть (проверьте файл с настройками CORS):

```go
config := cors.DefaultConfig()
config.AllowOrigins = []string{"http://localhost:3000"}
config.AllowCredentials = true
router.Use(cors.New(config))
```

### Проблема 3: Фронтенд показывает mock данные

1. Проверьте что `USE_MOCK = false`
2. Проверьте что бэкенд отвечает: http://localhost:8081/api/services
3. Проверьте консоль браузера на ошибки

### Проблема 4: Порт 8081 занят

```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Или измените порт в docker-compose.yml
```

## Полезные команды

### Docker

```bash
# Запуск
docker-compose up

# Запуск в фоне
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Пересоздание контейнеров
docker-compose up --build --force-recreate
```

### Проверка сервисов

```bash
# Проверка бэкенда
curl http://localhost:8081/api/services

# Проверка PostgreSQL
docker exec -it <postgres_container_name> psql -U postgres -d exoplanet_db

# Проверка Redis
docker exec -it <redis_container_name> redis-cli
KEYS *
```

## Структура проектов

```
C:\Users\exxor\RIP_2025\
├── react_RIP\              # Фронтенд (React + TypeScript)
│   ├── src\
│   ├── public\
│   ├── package.json
│   └── vite.config.ts      # Proxy настройки
│
└── backend_RIP\            # Бэкенд (Go + Gin)
    ├── cmd\
    ├── internal\
    ├── docker-compose.yml  # Docker конфигурация
    └── database_schema.sql # SQL схема
```

## Запуск обоих сервисов

### Терминал 1: Бэкенд

```bash
cd C:\Users\exxor\RIP_2025\backend_RIP
docker-compose up
```

### Терминал 2: Фронтенд

```bash
cd C:\Users\exxor\RIP_2025\react_RIP
npm run dev
```

### Браузер

- **Фронтенд**: http://localhost:3000
- **Swagger**: http://localhost:8081/swagger/
- **Adminer**: http://localhost:8080

---

**Готово! 🎉**

Теперь у вас полностью работающее приложение с фронтендом и бэкендом!


