import MistralClient from "@mistralai/mistralai";
import type { ChatProviderInterface, ProviderChatCompletionParams } from ".";

export class MistralProvider implements ChatProviderInterface {
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
}
