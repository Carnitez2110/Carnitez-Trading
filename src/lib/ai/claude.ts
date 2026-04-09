import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type {
  RiskLevel,
  Sentiment,
  SignalAction,
} from "@/lib/supabase/types";
import type { MarketSnapshot } from "@/lib/market-data/types";
import { SIGNAL_SYSTEM_PROMPT, buildSignalUserMessage } from "./prompts";

/** Shape parsed from Claude's response. Matches the JSON schema in the prompt. */
export interface GeneratedSignal {
  action: SignalAction;
  sentiment: Sentiment;
  confidence: number;
  reasoning: string;
  risk_level: RiskLevel;
  suggested_entry: number | null;
  suggested_stop_loss: number | null;
  suggested_take_profit: number | null;
}

export class SignalGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "SignalGenerationError";
  }
}

let cachedClient: Anthropic | null = null;

function anthropicClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new SignalGenerationError("ANTHROPIC_API_KEY missing in environment");
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

/**
 * Call Claude Sonnet 4.6 with the signal system prompt and a rendered market
 * snapshot. Expects a single JSON object in the response. Throws
 * SignalGenerationError on any failure (API error, bad JSON, schema mismatch).
 */
export async function generateSignal(
  snapshot: MarketSnapshot
): Promise<GeneratedSignal> {
  const client = anthropicClient();

  let response;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      temperature: 0.2,
      system: SIGNAL_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildSignalUserMessage(snapshot),
        },
      ],
    });
  } catch (err) {
    throw new SignalGenerationError(
      `Anthropic API error: ${(err as Error).message}`,
      err
    );
  }

  // Response content is an array of blocks; we only expect a single text block.
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new SignalGenerationError("Claude returned no text content");
  }

  const rawText = textBlock.text.trim();
  // In case Claude ever wraps output in code fences despite the instructions.
  const stripped = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    throw new SignalGenerationError(
      `Claude response was not valid JSON: ${stripped.slice(0, 200)}`,
      err
    );
  }

  return validateSignal(parsed);
}

function validateSignal(raw: unknown): GeneratedSignal {
  if (!raw || typeof raw !== "object") {
    throw new SignalGenerationError("Parsed signal is not an object");
  }
  const obj = raw as Record<string, unknown>;

  const action = obj.action;
  if (action !== "buy" && action !== "sell" && action !== "hold") {
    throw new SignalGenerationError(`Invalid action: ${String(action)}`);
  }

  const sentiment = obj.sentiment;
  if (
    sentiment !== "bullish" &&
    sentiment !== "bearish" &&
    sentiment !== "neutral"
  ) {
    throw new SignalGenerationError(`Invalid sentiment: ${String(sentiment)}`);
  }

  const confidence = Number(obj.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    throw new SignalGenerationError(
      `Invalid confidence: ${String(obj.confidence)}`
    );
  }

  if (typeof obj.reasoning !== "string" || obj.reasoning.length === 0) {
    throw new SignalGenerationError("Missing or empty reasoning");
  }

  const risk = obj.risk_level;
  if (risk !== "low" && risk !== "medium" && risk !== "high") {
    throw new SignalGenerationError(`Invalid risk_level: ${String(risk)}`);
  }

  const entry = obj.suggested_entry;
  const stop = obj.suggested_stop_loss;
  const take = obj.suggested_take_profit;
  const toNumOrNull = (v: unknown): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Enforce the confidence/action rule even if Claude forgets.
  const finalAction: SignalAction = confidence < 55 ? "hold" : action;

  return {
    action: finalAction,
    sentiment,
    confidence: Math.round(confidence),
    reasoning: obj.reasoning,
    risk_level: risk,
    suggested_entry: finalAction === "hold" ? null : toNumOrNull(entry),
    suggested_stop_loss: finalAction === "hold" ? null : toNumOrNull(stop),
    suggested_take_profit: finalAction === "hold" ? null : toNumOrNull(take),
  };
}
