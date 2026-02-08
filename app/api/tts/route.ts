/**
 * Text-to-Speech API Route
 *
 * Uses OpenAI TTS-1 API for high-quality voice synthesis.
 * Falls back to a 501 response if OPENAI_API_KEY is not configured,
 * which signals the client to use browser-based TTS instead.
 *
 * POST /api/tts
 * Body: { text: string, voice?: string }
 * Returns: audio/mpeg stream
 *
 * @module api/tts
 */

import { NextResponse } from "next/server";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("api/tts");

// Validate and import OpenAI only if API key exists
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface TTSRequest {
  text: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed?: number;
}

export async function POST(request: Request) {
  // Check if OpenAI API key is configured
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "TTS not configured - falling back to browser speech synthesis" },
      { status: 501 }
    );
  }

  try {
    const body = (await request.json()) as TTSRequest;
    const { text, voice = "nova", speed = 1.05 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Limit text length to prevent abuse
    const truncatedText = text.slice(0, 500);

    // Call OpenAI TTS API directly (no SDK needed)
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: truncatedText,
        voice: voice,
        speed: speed,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      log.error("OpenAI TTS API error", undefined, { status: response.status });
      return NextResponse.json({ error: "TTS generation failed" }, { status: response.status });
    }

    // Stream the audio response
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error: unknown) {
    log.error("TTS route error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
