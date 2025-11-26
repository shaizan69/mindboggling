import { NextRequest, NextResponse } from "next/server";
import { generateThought, analyzeMood } from "@/lib/gemini/client";
import { extractTags } from "@/lib/utils";
import { supabase } from "@/lib/supabase/server";

// POST - Continue infinite generation (called by client to keep it going)
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sessionId, lastThoughtId, previousThoughts } = body;

    if (!sessionId || !lastThoughtId) {
      return NextResponse.json(
        { error: "Session ID and last thought ID are required" },
        { status: 400 }
      );
    }

    // Get the last thought from database
    const { data: lastThought, error: fetchError } = await supabase
      .from("thoughts")
      .select("*")
      .eq("id", lastThoughtId)
      .single();

    if (!lastThought) {
      return NextResponse.json(
        { error: "Last thought not found" },
        { status: 404 }
      );
    }

    // Build context from previous thoughts
    const contextThoughts = previousThoughts || [lastThought.text];
    const contextText = contextThoughts.length > 1 
      ? `Previous thoughts in sequence: ${contextThoughts.slice(-3).map((t: string, i: number) => `${i + 1}. "${t}"`).join(' ')}`
      : `Starting from: "${contextThoughts[0]}"`;

    // Generate next thought
    const contextPrompt = `You are generating an infinite loop of connected intrusive, backchod thoughts. ${contextText}. 

Generate the NEXT thought in this continuous chain. It should:
- Be directly related to the previous thought(s) but take it deeper/darker/weirder
- Feel like a natural continuation or unexpected tangent
- Be short (1-2 sentences max), raw, unfiltered, and provocative
- Create a sense of endless, looping consciousness

The thought should flow naturally from what came before, like thoughts connecting in an infinite loop.`;

    const newThoughtText = await generateThought(contextPrompt, undefined);

    if (!newThoughtText || newThoughtText.trim().length === 0) {
      return NextResponse.json(
        { error: "Failed to generate thought" },
        { status: 500 }
      );
    }

    // Analyze mood
    let newMood = "neutral";
    try {
      newMood = await analyzeMood(newThoughtText);
    } catch (error) {
      console.error("Mood analysis failed:", error);
    }

    // Extract tags
    const newTags = extractTags(newThoughtText);

    // Insert new thought with connection to previous
    const { data: newThoughtData, error: insertError } = await supabase
      .from("thoughts")
      .insert([{
        text: newThoughtText,
        tags: newTags,
        mood: newMood,
        connections: [lastThoughtId],
      }])
      .select()
      .single();

    if (!newThoughtData) {
      return NextResponse.json(
        { error: insertError?.message || "Failed to insert thought" },
        { status: 500 }
      );
    }

    // Update previous thought to connect to this one
    const { data: prevThought } = await supabase
      .from("thoughts")
      .select("connections")
      .eq("id", lastThoughtId)
      .single();

    const existingConnections = prevThought?.connections || [];
    const updatedConnections = [...new Set([...existingConnections, newThoughtData.id])];

    await supabase
      .from("thoughts")
      .update({ 
        connections: updatedConnections
      })
      .eq("id", lastThoughtId);

    // Update context thoughts
    const updatedPreviousThoughts = [...contextThoughts, newThoughtText].slice(-3);

    return NextResponse.json({
      data: {
        newThought: newThoughtData,
        lastThoughtId: newThoughtData.id,
        previousThoughts: updatedPreviousThoughts,
      },
    });
  } catch (error: any) {
    console.error("Error continuing infinite generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to continue infinite generation" },
      { status: 500 }
    );
  }
}

