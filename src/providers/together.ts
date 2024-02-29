import OpenAI from "openai";
import type { ChatProviderInterface, ProviderChatCompletionParams } from ".";

// TODO provider class can be much better thought out
export class TogetherProvider implements ChatProviderInterface {
  private api: OpenAI;

  constructor({ apiKey }: { apiKey: string }) {
    this.api = new OpenAI({ apiKey, baseURL: "https://api.together.xyz/v1" });
  }

  async generateCompletion<T = string>(
    params: ProviderChatCompletionParams
  ): Promise<T> {
    if (!params.model) params.model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
    if (!params.temperature) params.temperature = 0.3;

    const result = await this.api.chat.completions.create({
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
      response_format: {
        type: params.json ? "json_object" : "text",
      },
      temperature: params.temperature,
      top_p: 0.7,
    });

    return result.choices[0].message.content as T;
  }
}
