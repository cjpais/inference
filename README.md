# inference

Trying to wrap a bunch of different inference providers models and rate limit them. As well as getting them to support typescript more natively.

My specific application may send many parallel requests to inference models and I need to rate limit these requests across the application per provider. This effectively solves that problem

This is a major WIP so a bunch of things are left unimplmented for the time being. However the basic functionality should be there

Supported providers:
* OpenAI (for chat, audio, image, embedding)
* Together (for chat)
* Mistral (for chat)
* Whisper.cpp (for audio)

WIP Stuff:
* consistent JSON mode
* error handling
* more rate limiting options
* more providers (llama.cpp for chat, image and embedding)

## Usage

Check out `test/index.test.ts` for usage examples.

Generally speaking

1. Instantiate a provider

```typescript
const oai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
});
```

2. Create a rate limiter based on your own usage (this is in requests per second)

```typescript
const oaiLimiter = createRateLimiter(2);
```

3. Define what models you want to use and their alias

```typescript
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
  }
}
```

4. Create inference with the models you want

```typescript
const inference = new Inference(CHAT_MODELS);
```

5. Call the inference with the model you want to use

```typescript
const result = await inference.chat("gpt-3.5", "Hello, world!");
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
