// Астрономический инструмент (спектроскоп)
export interface Instrument {
  id: number;
  name: string;
  full_name: string;
  type: string; // 'ground' или 'space'
  description: string;
  accuracy: number;
  accuracy_unit: string;
  velocity_precision: number;
  wavelength_range_min: number;
  wavelength_range_max: number;
  resolution_power: number;
  spectral_resolution: number;
  location: string;
  status: string;
  launch_date: string;
  measurement_range: string;
  resolution: string;
  calibration: string;
  stability: string;
  instrument_type: string;
  image_url?: string;
  video_url?: string;
  is_deleted: boolean;
  created_at: string;
}

// Заявка на расчёт
export interface Order {
  id: number;
  status: string; // черновик, сформирован, завершён, отклонён, удалён
  created_at: string;
  creator_id: number;
  creator_login: string;
  formation_date?: string;
  completion_date?: string;
  moderator_id?: number;
  moderator_login?: string;
  result?: string;
  total_mass?: number;
  notes?: string;
  calculated_count?: number; // Lab8: число м-м с рассчитанной массой
  mm_total?: number; // всего записей м-м
  services?: OrderService[];
}

// Связь заявки с услугой
export interface OrderService {
  order_id: number;
  service_id: number;
  exoplanet_name: string;
  star_mass: number;
  orbital_period: number;
  velocity_amplitude: number;
  inclination: number;
  eccentricity: number;
  comment?: string;
  other_info?: string;
  calculated_mass?: number;
  service?: Instrument;
}

// Иконка корзины
export interface CartIcon {
  order_id: number;
  calculation_id: number;
  services_count: number;
}

// Фильтры для инструментов
export interface InstrumentFilter {
  type?: string;
  status?: string;
  search?: string;
  min_accuracy?: number;
  max_accuracy?: number;
  date_from?: string;
  date_to?: string;
}

// Данные для добавления в заявку
export interface AddToOrderData {
  service_id: number;
  exoplanet_name: string;
  star_mass: number;
  orbital_period: number;
  velocity_amplitude: number;
  inclination: number;
  eccentricity: number;
  comment?: string;
  other_info?: string;
}

// Результат расчёта
export interface CalculationResult {
  total_mass: number;
  instrument_count: number;
  average_accuracy: number;
}

// Пользователь
export interface User {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Данные для авторизации
export interface LoginData {
  login: string;
  password: string;
}

export interface RegisterData {
  login: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
