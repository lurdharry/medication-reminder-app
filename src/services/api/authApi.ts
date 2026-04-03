import api, { ApiResponse } from "./index";

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
}

export const authApi = {
  register: (body: RegisterRequest) =>
    api.post<ApiResponse<RegisterResponse>>("/api/auth/register", body),

  login: (body: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>("/api/auth/login", body),
};
