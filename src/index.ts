import Bottleneck from "bottleneck";
import type {
  ChatCompletionParams,
  ChatProviderInterface,
  EmbeddingProviderInterface,
  GenerateEmbeddingsParams,
  GenerateSpeechParams,
  GenerateTranscriptionParams,
  ImageUnderstandingProviderInterface,
  ProviderInterface,
  TTSProviderInterface,
  TranscriptionProviderInterface,
  UnderstandImageParams,
} from "./providers";

const DEFAULT_SYS_PROMPT = "You are a helpful assistant.";
const DEFAULT_JSON_SYS_PROMPT =
  "You are a helpful assistant. You only respond in JSON.";
const DEFAULT_IMAGE_PROMPT = "Caption this image";

export interface Model {
  provider: ProviderInterface;
  name: string;
  providerModel: string;
  rateLimiter: Bottleneck;
}

// TODO: rename all of these so they are consistent and make sense.
// TextModel, ImageModel, AudioModel, EmbeddingModel???
// How to handle multimodal
export interface ChatModel extends Model {
  provider: ChatProviderInterface;
}

export interface TranscriptionModel extends Model {
  provider: TranscriptionProviderInterface;
}

export interface VisionModel extends Model {
  provider: ImageUnderstandingProviderInterface;
}

export interface EmbeddingModel extends Model {
  provider: EmbeddingProviderInterface;
}

export interface TTSModel extends Model {
  provider: TTSProviderInterface;
}

export const createRateLimiter = (
  rps: number,
  options?: Bottleneck.ConstructorOptions
) => new Bottleneck({ ...options, zminTime: 1000 / rps });

export class Inference {
  private chatModels: Record<string, ChatModel>;
  private visionModels: Record<string, VisionModel>;
  private audioModels: Record<string, TranscriptionModel>;
  private embeddingModels: Record<string, EmbeddingModel>;
  private speakingModels: Record<string, TTSModel>;

  constructor(models: {
    chatModels?: Record<string, ChatModel>;
    visionModels?: Record<string, VisionModel>;
    audioModels?: Record<string, TranscriptionModel>;
    embeddingModels?: Record<string, EmbeddingModel>;
    speakingModels?: Record<string, TTSModel>;
  }) {
    this.chatModels = models.chatModels || {};
    this.visionModels = models.visionModels || {};
    this.audioModels = models.audioModels || {};
    this.embeddingModels = models.embeddingModels || {};
    this.speakingModels = models.speakingModels || {};
  }

  async chat(params: ChatCompletionParams) {
    const model = this.chatModels[params.model];

    if (!model) {
      throw new Error("Model not found");
    }

    // set default system prompt appropriately.
    if (!params.systemPrompt) {
      if (params.json) {
        params.systemPrompt = DEFAULT_JSON_SYS_PROMPT;
      } else {
        params.systemPrompt = DEFAULT_SYS_PROMPT;
      }
    }

    const req = {
      ...params,
      model: model.providerModel,
      systemPrompt: params.systemPrompt,
    };

    return await model.rateLimiter.schedule(() =>
      model.provider.generateCompletion(req)
    );
  }

  async see(params: UnderstandImageParams) {
    const model = this.visionModels[params.model];

    if (!model) {
      throw new Error("Model not found");
    }

    const req = {
      ...params,
      model: model.providerModel,
      systemPrompt: params.systemPrompt || DEFAULT_SYS_PROMPT,
      prompt: params.prompt || DEFAULT_IMAGE_PROMPT,
      maxTokens: params.maxTokens || 1500,
    };

    return await model.rateLimiter.schedule(() =>
      model.provider.understandImage(req)
    );
  }

  async transcribe(params: GenerateTranscriptionParams) {
    const model = this.audioModels[params.model];

    if (!model) {
      throw new Error("Model not found");
    }

    const req: GenerateTranscriptionParams = {
      ...params,
      model: model.providerModel,
    };

    return await model.rateLimiter.schedule(() =>
      model.provider.generateTranscription(req)
    );
  }

  async embed(params: GenerateEmbeddingsParams) {
    const model = this.embeddingModels[params.model];

    if (!model) {
      throw new Error("Model not found");
    }

    const req = {
      ...params,
      model: model.providerModel,
    };

    return await model.rateLimiter.schedule(() =>
      model.provider.generateEmbeddings(req)
    );
  }

  async speak(params: GenerateSpeechParams) {
    const model = this.speakingModels[params.model];

    if (!model) {
      throw new Error("Model not found");
    }

    const req = {
      ...params,
      model: model.providerModel,
    };

    return await model.rateLimiter.schedule(() =>
      model.provider.generateSpeech(req)
    );
  }
}

import { OpenAIProvider } from "./providers/openai";
import { TogetherProvider } from "./providers/together";
import { MistralProvider } from "./providers/mistral";
import { WhisperCppProvider } from "./providers/whispercpp";
import { GroqProvider } from "./providers/groq";
import { GeppettoProvider } from "./providers/geppetto";

import * as Providers from "./providers";

export {
  OpenAIProvider,
  TogetherProvider,
  MistralProvider,
  WhisperCppProvider,
  GroqProvider,
  GeppettoProvider,
  Providers,
};
