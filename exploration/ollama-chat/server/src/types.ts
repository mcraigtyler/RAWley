export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: OllamaMessage[];
}

export interface OllamaChatChunk {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaTagsResponse {
  models: Array<{
    name: string;
    model: string;
    size: number;
    details: {
      parameter_size: string;
      family: string;
      quantization_level: string;
    };
  }>;
}
