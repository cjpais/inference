import MistralClient from "@mistralai/mistralai";
import type {
  ChatProviderInterface,
  EmbeddingProviderInterface,
  GenerateEmbeddingsParams,
  ProviderChatCompletionParams,
} from ".";

export class MistralProvider
  implements ChatProviderInterface, EmbeddingProviderInterface
{
  private api: MistralClient;

  constructor({ apiKey }: { apiKey: string }) {
    this.api = new MistralClient(apiKey);
  }

  async generateCompletion<T = string>(
    params: ProviderChatCompletionParams
  ): Promise<T> {
    // console.log("MistralProvider.generateCompletion", params);

    const result = await this.api.chat({
      ...params,
      model: params.model,
      // @ts-ignore
      responseFormat: params.json ? { type: "json_object" } : { type: "text" },
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

    return result.choices[0].message.content as T;
  }

  async generateEmbeddings(
    params: GenerateEmbeddingsParams
  ): Promise<number[][]> {
    if (!params.model) params.model = "mistral-embed";

    const embeddings = await this.api.embeddings({
      input: params.texts,
      model: params.model,
    });

    return embeddings.data.map((e) => e.embedding);
  }
}
