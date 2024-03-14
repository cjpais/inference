import { expect, test } from "bun:test";
import { OpenAIProvider } from "../src/providers/openai";
import { TogetherProvider } from "../src/providers/together";
import { MistralProvider } from "../src/providers/mistral";
import { WhisperCppProvider } from "../src/providers/whispercpp";
import { LlamaCppProvider } from "../src/providers/llamacpp";
import {
  createRateLimiter,
  type ChatModel,
  Inference,
  EmbeddingModel,
  TranscriptionModel,
  VisionModel,
  GroqProvider,
  TTSModel,
  GeppettoProvider,
} from "../src";
import fs from "fs";

const oai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
});
const oaiLimiter = createRateLimiter(2);

const together = new TogetherProvider({
  apiKey: process.env.TOGETHER_API_KEY!,
});
const togetherLimiter = createRateLimiter(1);
const mistral = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY!,
});
const mistralLimiter = createRateLimiter(1);
const whisperCpp = new WhisperCppProvider({
  url: process.env.WHISPER_CPP_URL!,
});
const llamaCpp = new LlamaCppProvider({
  url: process.env.LLAMA_CPP_URL!,
});

const groq = new GroqProvider({
  apiKey: process.env.GROQ_API_KEY!,
});
const groqLimiter = createRateLimiter(0.1);

const geppetoProvider = new GeppettoProvider({
  apiKey: process.env.GEPPETTO_API_KEY!,
});

const CHAT_MODELS: Record<string, ChatModel> = {
  "gpt3.5": {
    provider: oai,
    name: "gpt-3.5",
    providerModel: "gpt-3.5-turbo-0125",
    rateLimiter: oaiLimiter,
  },
  gpt4: {
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
  mixtral: {
    provider: together,
    name: "mixtral",
    providerModel: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    rateLimiter: togetherLimiter,
  },
  "mistral-mixtral": {
    provider: mistral,
    name: "mistral-mixtral",
    providerModel: "open-mixtral-8x7b",
    rateLimiter: mistralLimiter,
  },
  "together-mistral-7b": {
    provider: together,
    name: "together-mistral-7b",
    providerModel: "mistralai/Mistral-7B-Instruct-v0.2",
    rateLimiter: togetherLimiter,
  },
  "mistral-7b": {
    provider: mistral,
    name: "mistral-7b",
    providerModel: "open-mistral-7b",
    rateLimiter: mistralLimiter,
  },
  "groq-mixtral": {
    provider: groq,
    name: "groq-mixtral",
    providerModel: "mixtral-8x7b-32768",
    rateLimiter: groqLimiter,
  },
};

const EMBEDDING_MODELS: Record<string, EmbeddingModel> = {
  ada: {
    name: "ada",
    providerModel: "text-embedding-ada-002",
    provider: oai,
    rateLimiter: oaiLimiter,
  },
};

const IMAGE_MODELS: Record<string, VisionModel> = {
  llava: {
    name: "llava",
    providerModel: "llava",
    provider: llamaCpp,
    rateLimiter: createRateLimiter(1),
  },
};

const AUDIO_MODELS: Record<string, TranscriptionModel> = {
  "local-whisper": {
    name: "local-whisper",
    providerModel: "whisper-large-v3", // this is ignored
    provider: whisperCpp,
    rateLimiter: createRateLimiter(1),
  },
};

const SPEAK_MODELS: Record<string, TTSModel> = {
  "oai-tts": {
    name: "alloy",
    providerModel: "tts-1",
    provider: oai,
    rateLimiter: oaiLimiter,
  },
  geppetto: {
    name: "geppetto",
    providerModel: "geppetto",
    provider: geppetoProvider,
    rateLimiter: createRateLimiter(1),
  },
};
// TODO test each provider and all of what it implements

const inference = new Inference({
  chatModels: CHAT_MODELS,
  embeddingModels: EMBEDDING_MODELS,
  audioModels: AUDIO_MODELS,
  visionModels: IMAGE_MODELS,
  speakingModels: SPEAK_MODELS,
});

// test("audio to file", async () => {
//   const audio = await inference.speak({
//     model: "geppetto",
//     // model: "oai-tts",
//     // voice: "alloy",
//     text: "what is your favorite kind of ice cream?",
//     format: "wav",
//   });

//   // console.log(Buffer.from(audio as ArrayBuffer).toString());
//   fs.writeFileSync("audio.wav", Buffer.from(audio as ArrayBuffer));
// });

test(
  "rate limit works for inference",
  async () => {
    const start = Date.now();
    const queries = Array.from({ length: 5 }, (_, i) => i).map(async (i) => {
      const result = await inference.chat({
        model: "mistral-small",
        prompt: "hello world",
      });
      console.log(`${i} took ${Date.now() - start}ms`);
      return result;
    });

    const results = await Promise.all(queries);
    console.log(results);
  },
  { timeout: 100000 }
);

// test("code completion with json mode", async () => {
//   const result = await inference.chat({
//     model: "gpt3.5",
//     systemPrompt: CODE_SYS_PROMPT,
//     prompt: "get the 10 latest entries of type image",
//     json: true,
//   });

//   console.log(result);
// });

// test("embeddings", async () => {
//   const result = await inference.embed({
//     model: "ada",
//     texts: ["cat"],
//   });

//   console.log(result);
// });

// test("audio transcription", async () => {
//   const result = await inference.transcribe({
//     model: "local-whisper",
//     file: Buffer.from(
//       await Bun.file("/Users/cj/Downloads/clean.m4a").arrayBuffer()
//     ),
//   });

//   console.log(result);
// });

// test("image understanding", async () => {
//   // const result = await inference.see({
//   //   model: "llava",
//   //   data: "",
//   // });
//   const img = "/Users/cj/Downloads/img1.jpeg";
//   const buffer = fs.readFileSync(img);

//   const result = await inference.see({
//     model: "llava",
//     data: buffer.toString("base64"),
//     mime: "image/jpeg",
//     prompt:
//       "can you help me navigate this environment? i am blind. just two sentences please. i will ask you questions if i need more.",
//   });

//   console.log(result);
// });

// test(
//   "provider speed",
//   async () => {
//     const systemPrompt =
//       "you are an assitant who is helping Darren a blind person with a speech impediment. Darren is a wonderful and kind person, who runs the SCBBA (Southern California Beep Baseball Association). Since he cannot speak easily, can you come up with 3 potential responses he may say to this person? Your responses will used to generate speech with a text to speech engine. Speak in the first person as if you are Darren. please respond in json, specifically a json array of the responses.";
//     const prompt = "what is your favorite color?";

//     const start = Date.now();
//     const result = await inference.chat({
//       model: "mistral-small",
//       systemPrompt,
//       prompt,
//       json: true,
//     });
//     const end = Date.now();
//     console.log("mistral-small", end - start, result);

//     const start2 = Date.now();
//     const result2 = await inference.chat({
//       model: "gpt3.5",
//       systemPrompt,
//       prompt,
//       json: true,
//     });
//     const end2 = Date.now();
//     console.log("gpt3.5", end2 - start2, result2);

//     // const start3 = Date.now();
//     // const result3 = await inference.chat({
//     //   model: "gpt4",
//     //   systemPrompt,
//     //   prompt,
//     //   json: true,
//     // });
//     // const end3 = Date.now();
//     // console.log("gpt4", end3 - start3, result3);

//     // const start4 = Date.now();
//     // const result4 = await inference.chat({
//     //   model: "together-mistral-7b",
//     //   systemPrompt,
//     //   prompt,
//     //   json: false,
//     // });
//     // const end4 = Date.now();
//     // console.log("together-mistral-7b", end4 - start4, result4);

//     // const start5 = Date.now();
//     // const result5 = await inference.chat({
//     //   model: "mistral-7b",
//     //   systemPrompt,
//     //   prompt,
//     //   json: true,
//     // });
//     // const end5 = Date.now();
//     // console.log("mistral-7b", end5 - start5, result5);

//     const start6 = Date.now();
//     const result6 = await inference.chat({
//       model: "mixtral",
//       systemPrompt,
//       prompt,
//       json: true,
//     });
//     const end6 = Date.now();
//     console.log("mixtral", end6 - start6, result6);

//     const start7 = Date.now();
//     const result7 = await inference.chat({
//       model: "groq-mixtral",
//       systemPrompt,
//       prompt,
//       json: false,
//     });
//     const end7 = Date.now();
//     console.log("groq mixtral", end7 - start7, result7);

//     // const start7 = Date.now();
//     // const result7 = await inference.chat({
//     //   model: "mistral-mixtral",
//     //   systemPrompt,
//     //   prompt,
//     //   json: true,
//     // });
//     // const end7 = Date.now();
//   },
//   { timeout: 100000 }
// );
