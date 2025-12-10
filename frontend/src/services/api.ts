import axios from 'axios';
import {
  DashboardKPIs,
  ComparisonData,
  OutstandingComparison,
  MonthlyOutstanding,
  AuthStatus,
  SyncStatus,
  Settings,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  getStatus: async (): Promise<AuthStatus> => {
    const response = await api.get('/auth/status');
    return response.data;
  },

  connect: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/connect');
    return response.data;
  },
};

export const syncService = {
  sync: async (): Promise<SyncStatus> => {
    const response = await api.post('/sync');
    return response.data;
  },

  getStatus: async (): Promise<{ last_sync: string | null; authenticated: boolean }> => {
    const response = await api.get('/sync/status');
    return response.data;
  },
};

export const dashboardService = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export const comparisonService = {
  getBanks: async (): Promise<ComparisonData> => {
    const response = await api.get('/comparison/banks');
    return response.data;
  },

  getAdvances: async (): Promise<ComparisonData> => {
    const response = await api.get('/comparison/advances');
    return response.data;
  },

  getSuspense: async (): Promise<ComparisonData> => {
    const response = await api.get('/comparison/suspense');
    return response.data;
  },

  getOutstanding: async (): Promise<OutstandingComparison> => {
    const response = await api.get('/comparison/outstanding');
    return response.data;
  },
};

export const outstandingService = {
  getMonthly: async (month: string): Promise<MonthlyOutstanding> => {
    const response = await api.get(`/outstanding/${month}`);
    return response.data;
  },

  getSalesmanReport: async (salesman: string): Promise<{
    salesman: string;
    months: string[];
    values: number[];
    total: number;
    average: number;
    trend: string;
  }> => {
    const response = await api.get(`/reports/salesman/${encodeURIComponent(salesman)}`);
    return response.data;
  },
};

export const settingsService = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data;
  },
};

export default api;
