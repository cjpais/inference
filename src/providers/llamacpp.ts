import {
  ChatProviderInterface,
  ImageUnderstandingProviderInterface,
  ProviderUnderstandImageParams,
} from ".";

export class LlamaCppProvider
  implements ChatProviderInterface, ImageUnderstandingProviderInterface
{
  private url: string;

  constructor({ url }: { url: string }) {
    this.url = url;
  }

  async generateCompletion(params: any): Promise<any> {
    // TODO should we spawn openai provider and then use that as the inferface?
    throw new Error("Method not implemented.");
  }

  async understandImage(params: ProviderUnderstandImageParams): Promise<any> {
    if (!params.temperature) params.temperature = 0.2;

    return await fetch(`${this.url}/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        prompt: `${params.systemPrompt}\nUSER:[img-1]${params.prompt}\nASSISTANT:`,
        image_data: [
          {
            data: params.data,
            id: 1,
          },
        ],
      }),
    })
      .then((r) => r.json())
      .then((r) => r.content);
  }
}
