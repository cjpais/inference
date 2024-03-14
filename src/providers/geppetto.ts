import { GenerateSpeechParams, TTSProviderInterface } from ".";

// TODO provider class can be much better thought out
export class GeppettoProvider implements TTSProviderInterface {
  apiKey: string;

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }

  async generateSpeech(params: GenerateSpeechParams): Promise<ArrayBuffer> {
    const audio = await fetch("https://prod.geppetto.app/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        ...params,
        model: params.voice,
      }),
    });

    return audio.arrayBuffer();
  }
}
