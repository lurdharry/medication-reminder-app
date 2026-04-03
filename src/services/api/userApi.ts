import api, { ApiResponse } from "./index";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string | null;
}

export const userApi = {
  getProfile: () =>
    api.get<ApiResponse<UserProfile>>("/api/users/me"),
};
