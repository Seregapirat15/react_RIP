/**
 * Lab 6: Конфиг для Tauri и GitHub Pages.
 * В Tauri build прокси не работает — нужно указывать IP бэкенда в локальной сети (не localhost).
 */
const isTauri = !!(
  typeof window !== 'undefined' &&
  (window as Window & { __TAURI__?: unknown }).__TAURI__
);

/** IP бэкенда в локальной сети (из ipconfig). Зафиксирован в коде для Tauri. */
export const BACKEND_IP = '192.168.0.101';

/** Порт бэкенда API */
const API_PORT = 8081;

/** Базовый адрес бэкенда для Tauri */
export const API_BASE_IP = `http://${BACKEND_IP}:${API_PORT}`;

/** Локальный бэкенд (когда открываем GitHub Pages на том же ПК) */
const LOCAL_BACKEND_URL = `http://localhost:${API_PORT}/api`;

/**
 * API_BASE_URL:
 * - Tauri: IP из локальной сети (не localhost)
 * - Браузер на localhost: относительный /api (прокси Vite)
 * - Браузер на GitHub Pages: localhost:8081 (чтобы работало с бэком на том же ПК)
 */
function getApiBaseUrl(): string {
  if (isTauri) return API_BASE_IP + '/api';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '/api';
    return LOCAL_BACKEND_URL; // github.io и др. — пробуем локальный бэк
  }
  return '/api';
}
export const API_BASE_URL = getApiBaseUrl();

/** basename для Router: в Tauri — пусто, в GH Pages — base из vite */
export const ROUTER_BASENAME = isTauri ? '' : import.meta.env.BASE_URL;
