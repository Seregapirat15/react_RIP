import { Instrument, InstrumentFilter, CartIcon, Order, AddToOrderData, User, LoginData, RegisterData } from '../types';

const API_BASE_URL = '/api';

// Получение токена из localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Сохранение токена
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// Удаление токена
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// Базовая функция для API запросов
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include',
  };

  const response = await fetch(API_BASE_URL + url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    }
  });

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  // Для DELETE запросов без тела ответа
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==================== ИНСТРУМЕНТЫ ====================

// Получение списка инструментов с фильтрацией
export async function fetchInstruments(filters: InstrumentFilter = {}): Promise<Instrument[]> {
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.min_accuracy) params.append('min_accuracy', filters.min_accuracy.toString());
  if (filters.max_accuracy) params.append('max_accuracy', filters.max_accuracy.toString());
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);

  const queryString = params.toString();
  const url = `/services${queryString ? `?${queryString}` : ''}`;

  return apiRequest<Instrument[]>(url);
}

// Получение одного инструмента
export async function fetchInstrumentById(id: number): Promise<Instrument> {
  return apiRequest<Instrument>(`/services/${id}`);
}

// Загрузка изображения инструмента (только для модератора). FormData с полем 'image' (файл)
export async function uploadServiceImage(serviceId: number, file: File): Promise<{ image_url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const token = getAuthToken();
  const response = await fetch(API_BASE_URL + `/services/${serviceId}/image`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const err = new Error(`API Error: ${response.status}`) as Error & { status: number };
    err.status = response.status;
    throw err;
  }
  return response.json();
}

// ==================== КОРЗИНА И ЗАЯВКИ ====================

// Получение иконки корзины
export async function fetchCartIcon(): Promise<CartIcon> {
  return apiRequest<CartIcon>('/orders/cart');
}

// Получение списка заявок пользователя
export async function fetchOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders');
}

// Получение одной заявки
export async function fetchOrderById(id: number): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`);
}

// Добавление инструмента в заявку
export async function addToOrder(data: AddToOrderData): Promise<{ order_id: number; service_id: number; message: string }> {
  return apiRequest('/orders/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Удаление инструмента из заявки
export async function removeFromOrder(orderId: number, serviceId: number): Promise<void> {
  return apiRequest(`/orders/${orderId}/services/${serviceId}`, {
    method: 'DELETE',
  });
}

// Обновление заявки
export async function updateOrder(orderId: number, data: Partial<Order>): Promise<Order> {
  return apiRequest(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Формирование заявки
export async function formOrder(orderId: number): Promise<Order> {
  return apiRequest(`/orders/${orderId}/form`, {
    method: 'PUT',
  });
}

// Удаление заявки
export async function deleteOrder(orderId: number): Promise<void> {
  return apiRequest(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}

// ==================== АВТОРИЗАЦИЯ ====================

// Регистрация (бэкенд возвращает только user, без token — после регистрации нужно войти)
export async function register(data: RegisterData): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Вход
export async function login(data: LoginData): Promise<{ user: User; token: string }> {
  const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
}

// Выход
export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    removeAuthToken();
  }
}

// Получение данных текущего пользователя
export async function fetchCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

// Проверка авторизации
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
