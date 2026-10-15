import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  type UIMessage,
} from 'ai';
import { getAuthUserId } from '@/lib/auth';
import { MIMI_SYSTEM_PROMPT } from '@/lib/ai/prompts';

// Streaming responses may run longer than the default serverless timeout.
export const maxDuration = 30;

// Models are tried in order; if one is overloaded (503) or unavailable, the next one is used.
// Override with GEMINI_MODELS in .env.local / Vercel, comma-separated (e.g. "gemini-3.8-flash,gemini-3.6-flash").
const MODEL_CHAIN = (process.env.GEMINI_MODELS ?? 'gemini-3.8-flash,gemini-3.6-flash,gemini-3.1-flash-lite')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const MAX_MESSAGES = 20; // only the most recent turns are sent to the model
const MAX_TEXT_LENGTH = 6000; // per docs/4_API_ROUTES.md: Mimi text 1–6,000 characters

// Replies stay short because the system prompt asks for it, not because of this limit. The limit is generous on
// purpose: Gemini models can spend part of it on internal "thinking", and a tight cap cuts replies off mid-sentence.
const MAX_OUTPUT_TOKENS = 1024;

const FRIENDLY_ERROR = 'Mimi is taking a short pause. Please try again in a moment.';
const IS_DEV = process.env.NODE_ENV === 'development';

function textOf(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const extra = error as Error & { statusCode?: number; responseBody?: string };
    const status = extra.statusCode ? ` [HTTP ${extra.statusCode}]` : '';
    const body = extra.responseBody ? ` ${extra.responseBody.slice(0, 300)}` : '';
    return `${error.name}: ${error.message}${status}${body}`;
  }
  return String(error);
}

export async function POST(req: Request) {
  // Tracks which step is running so a failure tells us exactly where it happened.
  let stage = 'start';

  try {
    stage = 'auth (getAuthUserId)';
    const userId = await getAuthUserId();
    if (!userId) {
      console.error('[api/chat] 401: no Supabase session (getAuthUserId returned null).');
      return Response.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    stage = 'env check (GEMINI_API_KEY)';
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[api/chat] 503: GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.');
      return Response.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 503 });
    }

    stage = 'parse request body';
    let messages: UIMessage[];
    try {
      const body = await req.json();
      messages = body?.messages;
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const recent = messages.slice(-MAX_MESSAGES);
    const lastUser = [...recent].reverse().find((m) => m.role === 'user');
    const lastText = lastUser ? textOf(lastUser).trim() : '';
    if (!lastText || lastText.length > MAX_TEXT_LENGTH) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }

    stage = 'convertToModelMessages';
    const modelMessages = await convertToModelMessages(recent);

    // The provider reads GOOGLE_GENERATIVE_AI_API_KEY by default, so we pass GEMINI_API_KEY explicitly.
    const google = createGoogleGenerativeAI({ apiKey });

    // Try each model in turn. A 503 "high demand" or a retired model moves on to the next one.
    let replyText = '';
    const failures: string[] = [];
    for (const modelId of MODEL_CHAIN) {
      stage = `generateText (Gemini model: ${modelId})`;
      try {
        const { text, finishReason } = await generateText({
          model: google(modelId),
          system: MIMI_SYSTEM_PROMPT,
          messages: modelMessages,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          maxRetries: 1, // one quick retry on this model, then fall back to the next
        });
        if (!text.trim()) throw new Error('Empty response from model.');
        if (finishReason === 'length') {
          console.warn(`[api/chat] Reply from ${modelId} hit the output token limit and may be cut off.`);
        }
        replyText = text;
        break;
      } catch (error) {
        console.error(`Gemini API Error (model: ${modelId}):`, error);
        failures.push(`${modelId} -> ${describeError(error)}`);
      }
    }

    if (!replyText) {
      return Response.json(
        { error: IS_DEV ? `${FRIENDLY_ERROR} (${failures.join(' | ')})` : FRIENDLY_ERROR },
        { status: 503 }
      );
    }

    // Send the reply in the UI message stream format that useChat() from @ai-sdk/react (v5+) expects.
    stage = 'createUIMessageStreamResponse';
    const textId = crypto.randomUUID();
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'text-start', id: textId });
        writer.write({ type: 'text-delta', id: textId, delta: replyText });
        writer.write({ type: 'text-end', id: textId });
      },
    });
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error(`Gemini API Error: (failed at stage: ${stage})`, error);
    return Response.json(
      {
        error: IS_DEV ? `${FRIENDLY_ERROR} (failed at "${stage}": ${describeError(error)})` : FRIENDLY_ERROR,
      },
      { status: 500 }
    );
  }
}