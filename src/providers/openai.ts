import OpenAI from "openai";
import type {
  ChatCompletionParams,
  ChatProviderInterface,
  EmbeddingProviderInterface,
  GenerateEmbeddingsParams,
  GenerateTranscriptionParams,
  ImageUnderstandingProviderInterface,
  ProviderChatCompletionParams,
  ProviderUnderstandImageParams,
  TranscriptionProviderInterface,
  UnderstandImageParams,
} from ".";

// TODO use this instead to get models
type OpenAIEmbeddingParams = Omit<GenerateEmbeddingsParams, "model"> & {
  model: OpenAI.EmbeddingCreateParams["model"];
};

export class OpenAIProvider
  implements
    ChatProviderInterface,
    TranscriptionProviderInterface,
    EmbeddingProviderInterface,
    ImageUnderstandingProviderInterface
{
  private openai: OpenAI;

  constructor({ apiKey }: { apiKey: string }) {
    // TODO set default model
    this.openai = new OpenAI({ apiKey });
  }

  async generateTranscription(
    params: GenerateTranscriptionParams
  ): Promise<string> {
    if (typeof params.file === "string")
      throw new Error("File must be a stream");

    if (!params.model) params.model = "whisper-1";

    return (
      await this.openai.audio.transcriptions.create({
        file: params.file,
        model: params.model,
        prompt: params.prompt,
      })
    ).text;
  }

  async generateEmbeddings(
    params: GenerateEmbeddingsParams
  ): Promise<number[][]> {
    if (!params.model) params.model = "text-embedding-ada-002";

    const embeddings = await this.openai.embeddings.create({
      input: params.texts,
      model: params.model,
    });

    return embeddings.data.map((e) => e.embedding);
  }

  async generateCompletion<T = string>(
    params: ProviderChatCompletionParams
  ): Promise<T> {
    // TODO support JSON, Streaming, etc.
    if (!params.model) params.model = "gpt-3.5-turbo-1106";
    const result = await this.openai.chat.completions.create({
      model: params.model,
      messages: [
        {
          role: "system",
          content: params.systemPrompt,
        },
        {
          role: "user",
          content: params.prompt,
        },
      ],
    });

    // TODO this is going to return string
    return result.choices[0].message.content as T;
  }

  async understandImage<T = string>(
    params: ProviderUnderstandImageParams
  ): Promise<T> {
    const result = await this.openai.chat.completions.create({
      model: params.model,
      messages: [
        {
          role: "system",
          content: params.systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${params.mime};base64,${params.data}`,
              },
            },
            { type: "text", text: params.prompt },
          ],
        },
      ],
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    });

    return result.choices[0].message.content as T;
  }
}
