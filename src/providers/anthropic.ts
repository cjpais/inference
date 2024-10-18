import Anthropic from "@anthropic-ai/sdk";
import {
  ChatProviderInterface,
  ImageUnderstandingProviderInterface,
  ProviderChatCompletionParams,
  ProviderUnderstandImageParams,
} from ".";

export class AnthropicProvider
  implements ChatProviderInterface, ImageUnderstandingProviderInterface
{
  private anthropic: Anthropic;

  constructor({ apiKey }: { apiKey: string }) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateCompletion<T = string>(
    params: ProviderChatCompletionParams
  ): Promise<T> {
    const result = await this.anthropic.messages.create({
      model: params.model,
      messages: [
        {
          role: "assistant",
          content: params.systemPrompt,
        },
        {
          role: "user",
          content: params.prompt,
        },
      ],
      stream: false,
      max_tokens: params.maxTokens ? params.maxTokens : 8192,
    });

    // @ts-ignore
    return result.content[0].text as T;
  }

  async understandImage<T = string>(
    params: ProviderUnderstandImageParams
  ): Promise<T> {
    const result = await this.anthropic.messages.create({
      model: params.model,
      messages: [
        {
          role: "assistant",
          content: params.systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                // @ts-ignore
                media_type: params.mime,
                data: `${params.data}`,
              },
            },
            { type: "text", text: params.prompt },
          ],
        },
      ],
      stream: false,
      max_tokens: params.maxTokens ? params.maxTokens : 128000,
    });

    // @ts-ignore
    return result.content[0].text as T;
  }
}
