/**
 * ExoplanetInstrumentsApi — сгенерированный модуль для работы с инструментами (услугами).
 * Swagger codegen → axios.
 */
import axiosInstance from '../axiosInstance';
import { Instrument, InstrumentFilter } from '../../types';

export class ExoplanetInstrumentsApi {
  static async getExoplanetInstruments(filters: InstrumentFilter = {}): Promise<Instrument[]> {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.min_accuracy) params.append('min_accuracy', filters.min_accuracy.toString());
    if (filters.max_accuracy) params.append('max_accuracy', filters.max_accuracy.toString());
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const qs = params.toString();
    const { data } = await axiosInstance.get<Instrument[]>(`/services${qs ? `?${qs}` : ''}`);
    return data;
  }

  static async getExoplanetInstrumentById(id: number): Promise<Instrument> {
    const { data } = await axiosInstance.get<Instrument>(`/services/${id}`);
    return data;
  }

  static async uploadExoplanetInstrumentImage(serviceId: number, file: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await axiosInstance.post<{ image_url: string }>(
      `/services/${serviceId}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  }
}
