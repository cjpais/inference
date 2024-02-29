import fs from "fs";

export interface ChatCompletionParams {
  model: string;
  prompt: string;
  systemPrompt?: string;
  stream?: boolean;
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  // [key: string]: any;
}

export interface UnderstandImageParams {
  data: string;
  mime: string;
  model: string;
  prompt?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  stream?: boolean;
}

export type ProviderChatCompletionParams = ChatCompletionParams & {
  systemPrompt: string;
};

export type ProviderUnderstandImageParams = UnderstandImageParams & {
  systemPrompt: string;
  prompt: string;
  model: string;
  maxTokens: number;
};

export interface GenerateTranscriptionParams {
  file: fs.ReadStream | string; // todo, accept file path, urls, etc.
  model: string;
  prompt?: string;
}

export interface GenerateEmbeddingsParams {
  texts: string[];
  model: string;
}

export interface ProviderInterface {
  generateCompletion?: <T = any>(
    params: ProviderChatCompletionParams
  ) => Promise<T>;
  generateTranscription?: (
    params: GenerateTranscriptionParams
  ) => Promise<string>;
  generateEmbeddings?: (
    params: GenerateEmbeddingsParams
  ) => Promise<number[][]>;
  understandImage?: <T = any>(
    params: ProviderUnderstandImageParams
  ) => Promise<T>;
}

export interface ChatProviderInterface extends ProviderInterface {
  generateCompletion: <T = any>(
    params: ProviderChatCompletionParams
  ) => Promise<T>;
}

export interface TranscriptionProviderInterface extends ProviderInterface {
  generateTranscription: (
    params: GenerateTranscriptionParams
  ) => Promise<string>;
}

export interface EmbeddingProviderInterface extends ProviderInterface {
  generateEmbeddings: (params: GenerateEmbeddingsParams) => Promise<number[][]>;
}

export interface ImageUnderstandingProviderInterface extends ProviderInterface {
  understandImage: <T = any>(
    params: ProviderUnderstandImageParams
  ) => Promise<T>;
}
