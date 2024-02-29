import { expect, test } from "bun:test";
import { OpenAIProvider } from "../src/providers/openai";
import { TogetherProvider } from "../src/providers/together";
import { MistralProvider } from "../src/providers/mistral";
import { WhisperCppProvider } from "../src/providers/whispercpp";
import { createRateLimiter, type ChatModel, Inference } from "../src";

console.log("API KEY", process.env.OPENAI_API_KEY);

const oai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
});
const oaiLimiter = createRateLimiter(2);

const together = new TogetherProvider({
  apiKey: process.env.TOGETHER_API_KEY!,
});
const mistral = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY!,
});
const mistralLimiter = createRateLimiter(1);
const whisperCpp = new WhisperCppProvider({
  url: process.env.WHISPER_CPP_URL!,
});

const CHAT_MODELS: Record<string, ChatModel> = {
  "gpt-3.5": {
    provider: oai,
    name: "gpt-3.5",
    providerModel: "gpt-3.5-turbo-0125",
    rateLimiter: oaiLimiter,
  },
  "gpt-4": {
    provider: oai,
    name: "gpt-4",
    providerModel: "gpt-4-0125-preview",
    rateLimiter: oaiLimiter,
  },
  "mistral-small": {
    provider: mistral,
    name: "mistral-small",
    providerModel: "mistral-small-latest",
    rateLimiter: mistralLimiter,
  },
  "mistral-large": {
    provider: mistral,
    name: "mistral-large",
    providerModel: "mistral-large-latest",
    rateLimiter: mistralLimiter,
  },
};

const inference = new Inference({ chatModels: CHAT_MODELS });

test(
  "rate limit works for inference",
  async () => {
    const queries = Array.from({ length: 10 }, (_, i) => i).map((i) =>
      inference.chat({ model: "mistral-small", prompt: "hello world" })
    );

    const results = await Promise.all(queries);
    console.log(results);
  },
  { timeout: 100000 }
);
