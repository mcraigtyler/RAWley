export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  details: {
    parameter_size: string;
    family: string;
    quantization_level: string;
  };
}
