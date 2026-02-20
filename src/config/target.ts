/**
 * Lab 6: Конфиг для Tauri и GitHub Pages.
 * В Tauri build прокси не работает — нужно указывать IP бэкенда напрямую.
 * Замените на ваш IP в локальной сети (не localhost).
 */
const isTauri = !!(
  typeof window !== 'undefined' &&
  (window as Window & { __TAURI__?: unknown }).__TAURI__
);

/** IP:порт бэкенда в локальной сети. Пример: 192.168.1.100:8081 */
export const API_BASE_IP = 'http://192.168.1.100:8081';

/** Базовый URL для API: в Tauri — IP, в вебе — относительный (прокси) */
export const API_BASE_URL = isTauri ? API_BASE_IP + '/api' : '/api';

/** basename для Router: в Tauri — пусто, в GH Pages — base из vite */
export const ROUTER_BASENAME = isTauri ? '' : import.meta.env.BASE_URL;
