/**
 * ExoplanetAuthApi — сгенерированный модуль авторизации.
 * Swagger codegen → axios.
 */
import axiosInstance from '../axiosInstance';
import { User, LoginData, RegisterData } from '../../types';

export class ExoplanetAuthApi {
  static async registerExoplanetUser(payload: RegisterData): Promise<User> {
    const { data } = await axiosInstance.post<User>('/auth/register', payload);
    return data;
  }

  static async loginExoplanetUser(payload: LoginData): Promise<{ user: User; token: string }> {
    const { data } = await axiosInstance.post<{ user: User; token: string }>('/auth/login', payload);
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  static async logoutExoplanetUser(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  static async getExoplanetCurrentUser(): Promise<User> {
    const { data } = await axiosInstance.get<User>('/auth/me');
    return data;
  }

  static async updateExoplanetUser(fields: Partial<User & { password?: string }>): Promise<User> {
    const { data } = await axiosInstance.put<User>('/auth/me', fields);
    return data;
  }
}
