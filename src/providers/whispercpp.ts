import fs from "fs";
import type { TranscriptionProviderInterface } from ".";

type WhisperCPPResponse = {
  text: string;
};

export class WhisperCppProvider implements TranscriptionProviderInterface {
  private url: string;

  constructor({ url }: { url: string }) {
    this.url = url;
  }

  async generateTranscription(params: any): Promise<string> {
    if (typeof params.file !== "string")
      throw new Error("File must be a string");

    const formData = new FormData();
    formData.append("file", fs.readFileSync(params.file));
    formData.append("temperature", params.temperature || 0.0);
    formData.append("temperature_inc", params.temperature_inc || 0.2);
    formData.append("response_format", "json");
    params.prompt && formData.append("prompt", params.prompt);

    return await fetch(`${this.url}/inference`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to transcribe");
        return res.json() as Promise<WhisperCPPResponse>;
      })
      .then((res) => res.text.replaceAll("\n", ""))
      .catch((err) => {
        console.error(err);
        return "";
      });
  }
}
