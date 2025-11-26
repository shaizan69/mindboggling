import { NextRequest, NextResponse } from "next/server";
import { generateThought, analyzeMood } from "@/lib/gemini/client";
import { extractTags } from "@/lib/utils";

// POST - Generate a new thought using AI
export async function POST(request: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please add GOOGLE_GEMINI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { context, mood } = body;

    // Generate thought using Gemini
    const thoughtText = await generateThought(context, mood);

    if (!thoughtText || thoughtText.trim().length === 0) {
      return NextResponse.json(
        { error: "Generated thought is empty. Please try again." },
        { status: 500 }
      );
    }

    // Analyze mood (with timeout to prevent hanging)
    let analyzedMood = "neutral";
    try {
      analyzedMood = await Promise.race([
        analyzeMood(thoughtText),
        new Promise<string>((resolve) => setTimeout(() => resolve("neutral"), 5000))
      ]);
    } catch (moodError) {
      console.error("Mood analysis failed, using neutral:", moodError);
    }

    // Extract tags
    const tags = extractTags(thoughtText);

    return NextResponse.json({
      data: {
        text: thoughtText,
        mood: analyzedMood,
        tags,
      },
    });
  } catch (error: any) {
    console.error("Error generating thought:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate thought";
    let statusCode = 500;

    if (error.message?.includes("API key")) {
      errorMessage = "Invalid or missing Gemini API key";
      statusCode = 500;
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      errorMessage = "API rate limit exceeded. Please try again later.";
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

