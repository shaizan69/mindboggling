import { NextRequest, NextResponse } from "next/server";
import { generateThought, analyzeMood } from "@/lib/gemini/client";
import { extractTags } from "@/lib/utils";
import { supabase } from "@/lib/supabase/server";

// POST - Generate branches from an existing thought node
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { thoughtId, thoughtText, count = 3 } = body;

    if (!thoughtText || thoughtText.trim().length === 0) {
      return NextResponse.json(
        { error: "Thought text is required" },
        { status: 400 }
      );
    }

    // Generate multiple branching thoughts
    const generatedThoughts = [];
    const connectionIds: string[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Generate a branching thought with more explicit prompts for intrusive thoughts
        const branchVariations = [
          'a natural continuation that goes deeper or darker',
          'a related tangent that explores a weird angle',
          'an associated but unexpected intrusive thought',
          'a backchod or provocative take on this idea',
          'a chaotic or existential spin on this thought'
        ];
        const branchPrompt = `Based on this thought: "${thoughtText}", generate ${branchVariations[i % branchVariations.length]}. Make it short (1-2 sentences), raw, and unfiltered.`;
        
        const newThoughtText = await generateThought(branchPrompt, undefined);

        // Analyze mood
        let mood = "neutral";
        try {
          mood = await analyzeMood(newThoughtText);
        } catch (error) {
          console.error("Mood analysis failed:", error);
        }

        // Extract tags
        const tags = extractTags(newThoughtText);

        // Store in database
        const { data, error } = await supabase
          .from("thoughts")
          .insert([{
            text: newThoughtText,
            tags,
            mood,
            connections: thoughtId ? [thoughtId] : []
          }])
          .select()
          .single();

        if (data) {
          generatedThoughts.push(data);
          connectionIds.push(data.id);
        }
      } catch (error) {
        console.error(`Failed to generate branch ${i + 1}:`, error);
      }
    }

    // Update parent thought with connections
    if (thoughtId && connectionIds.length > 0) {
      await supabase
        .from("thoughts")
        .update({ connections: connectionIds })
        .eq("id", thoughtId);
    }

    return NextResponse.json({
      data: generatedThoughts,
      message: `Generated ${generatedThoughts.length} branches`,
    });
  } catch (error: any) {
    console.error("Error branching thoughts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to branch thoughts" },
      { status: 500 }
    );
  }
}

