import OpenAI from "openai";
import type { ChatProviderInterface, ProviderChatCompletionParams } from ".";

// TODO provider class can be much better thought out
export class GroqProvider implements ChatProviderInterface {
  private api: OpenAI;

  constructor({ apiKey }: { apiKey: string }) {
    this.api = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async generateCompletion<T = string>(
    params: ProviderChatCompletionParams
  ): Promise<T> {
    if (!params.model) params.model = "mixtral-8x7b-32768";

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
    });

    return result.choices[0].message.content as T;
  }
}
