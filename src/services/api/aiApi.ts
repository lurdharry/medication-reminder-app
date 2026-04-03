import api, { ApiResponse } from "./index";

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  intent: string;
  data: Record<string, any> | null;
  provider: string;
}

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  intent: string | null;
  createdAt: string;
}

export const aiApi = {
  chat: (body: ChatRequest) =>
    api.post<ApiResponse<ChatResponse>>("/api/ai/chat", body),

  getConversation: () =>
    api.get<ApiResponse<ConversationMessage[]>>("/api/ai/chat"),

  clearConversation: () =>
    api.delete<ApiResponse<null>>("/api/ai/chat"),
};
