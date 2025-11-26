import { NextRequest, NextResponse } from "next/server";
import { generateThought, analyzeMood } from "@/lib/gemini/client";
import { extractTags } from "@/lib/utils";
import { supabase } from "@/lib/supabase/server";

// POST - Generate multiple connected thoughts from a seed thought
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { seedThought, count = 5 } = body;

    if (!seedThought || seedThought.trim().length === 0) {
      return NextResponse.json(
        { error: "Seed thought is required" },
        { status: 400 }
      );
    }

    // Generate multiple related thoughts
    const generatedThoughts = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Generate a thought related to the seed
        const thoughtText = await generateThought(
          `Based on this thought: "${seedThought}", generate a related but different thought. Make it a natural continuation, tangent, or associated idea.`,
          undefined
        );

        // Analyze mood
        let mood = "neutral";
        try {
          mood = await analyzeMood(thoughtText);
        } catch (error) {
          console.error("Mood analysis failed:", error);
        }

        // Extract tags
        const tags = extractTags(thoughtText);

        // Store in database
        const { data, error } = await supabase
          .from("thoughts")
          .insert([{
            text: thoughtText,
            tags,
            mood,
            connections: []
          }])
          .select()
          .single();

        if (data) {
          generatedThoughts.push(data);
        }
      } catch (error) {
        console.error(`Failed to generate thought ${i + 1}:`, error);
      }
    }

    return NextResponse.json({
      data: generatedThoughts,
      message: `Generated ${generatedThoughts.length} thoughts`,
    });
  } catch (error: any) {
    console.error("Error expanding thoughts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to expand thoughts" },
      { status: 500 }
    );
  }
}

