import axios from "axios";
import { Storage } from "../storage";

const BASE_URL = "https://medication-reminder-api-production.up.railway.app";
const TOKEN_KEY = "@auth_token";

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Storage.getString(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API response type matching backend ResponseDTO
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Token management
export const TokenManager = {
  getToken: (): string | null => {
    return Storage.getString(TOKEN_KEY) || null;
  },
  setToken: (token: string): void => {
    Storage.setString(TOKEN_KEY, token);
  },
  clearToken: (): void => {
    Storage.remove(TOKEN_KEY);
  },
};

export default api;
