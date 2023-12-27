import { message } from 'antd';
import axios from 'axios';

import { clearAuthCache, getToken } from '@/utils/auth';

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const service = axios.create({
  // 获取环境变量
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10 * 1000,
});

// Handle Error
const handleError = (error: AxiosError): Promise<AxiosError> => {
  if (error.response?.status === 401 || error.response?.status === 504) {
    clearAuthCache();
    location.href = '/login';
  }
  message.error(error.message || 'error');
  return Promise.reject(error);
};

// Request interceptors configuration
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    (config as Recordable).headers.Authorization = `${token}`;
  }
  (config as Recordable).headers['Content-Type'] = 'application/json';
  return config;
}, handleError);

// Respose interceptors configuration
service.interceptors.response.use((response: AxiosResponse) => {
  const { data } = response;

  if (data.code === 0) {
    return data.data;
  }
  message.error(data.message);

  return Promise.reject('error');
}, handleError);

export { service };
