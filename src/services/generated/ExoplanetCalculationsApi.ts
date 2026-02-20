/**
 * ExoplanetCalculationsApi — сгенерированный модуль для работы с заявками на расчёт.
 * Swagger codegen → axios.
 */
import axiosInstance from '../axiosInstance';
import { Order, CartIcon, AddToOrderData } from '../../types';

export interface ExoplanetOrdersFilter {
  status?: string;
  date_from?: string;
  date_to?: string;
}

export class ExoplanetCalculationsApi {
  static async getExoplanetCalculationCartIcon(): Promise<CartIcon> {
    const { data } = await axiosInstance.get<CartIcon>('/orders/cart');
    return data;
  }

  static async getExoplanetCalculations(filters: ExoplanetOrdersFilter = {}): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.date_from) params.append('formation_from', filters.date_from);
    if (filters.date_to) params.append('formation_to', filters.date_to);
    const qs = params.toString();
    const { data } = await axiosInstance.get<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
    return data;
  }

  static async getExoplanetCalculationById(id: number): Promise<Order> {
    const { data } = await axiosInstance.get<Order>(`/orders/${id}`);
    return data;
  }

  static async addInstrumentToCalculation(payload: AddToOrderData): Promise<{ order_id: number; service_id: number; message: string }> {
    const { data } = await axiosInstance.post('/orders/services', payload);
    return data;
  }

  static async removeInstrumentFromCalculation(orderId: number, serviceId: number): Promise<void> {
    await axiosInstance.delete(`/orders/${orderId}/services/${serviceId}`);
  }

  static async updateExoplanetCalculation(orderId: number, fields: Partial<Order>): Promise<Order> {
    const { data } = await axiosInstance.put<Order>(`/orders/${orderId}`, fields);
    return data;
  }

  static async updateCalculationInstrumentParams(
    orderId: number,
    serviceId: number,
    params: {
      exoplanet_name: string;
      star_mass: number;
      orbital_period: number;
      velocity_amplitude: number;
      inclination: number;
      eccentricity: number;
      comment?: string;
      other_info?: string;
    },
  ): Promise<void> {
    await axiosInstance.put(`/orders/${orderId}/services/${serviceId}`, {
      order_id: orderId,
      service_id: serviceId,
      ...params,
    });
  }

  static async formExoplanetCalculation(orderId: number): Promise<Order> {
    const { data } = await axiosInstance.put<Order>(`/orders/${orderId}/form`);
    return data;
  }

  static async deleteExoplanetCalculation(orderId: number): Promise<void> {
    await axiosInstance.delete(`/orders/${orderId}`);
  }
}
