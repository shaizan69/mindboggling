import { NextRequest, NextResponse } from "next/server";
import { generateThought, analyzeMood } from "@/lib/gemini/client";
import { extractTags } from "@/lib/utils";
import { supabase } from "@/lib/supabase/server";

// Store for active infinite generation processes
const activeGenerations = new Map<string, { isRunning: boolean; lastThoughtId: string | null }>();

// POST - Start infinite thought generation loop
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { seedThought, sessionId } = body;

    if (!seedThought || seedThought.trim().length === 0) {
      return NextResponse.json(
        { error: "Seed thought is required" },
        { status: 400 }
      );
    }

    // Generate unique session ID if not provided
    const genSessionId = sessionId || `inf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if generation is already running for this session
    if (activeGenerations.has(genSessionId) && activeGenerations.get(genSessionId)!.isRunning) {
      return NextResponse.json(
        { error: "Infinite generation already running for this session" },
        { status: 400 }
      );
    }

    // Start the infinite generation process and get seed thought ID
    let seedThoughtId: string;
    try {
      const seedResult = await createSeedThought(seedThought);
      seedThoughtId = seedResult.id;
      
      // Start the infinite generation process (non-blocking)
      startInfiniteGeneration(genSessionId, seedThought, seedThoughtId).catch((error) => {
        console.error("Error in infinite generation:", error);
        activeGenerations.delete(genSessionId);
      });
    } catch (error) {
      console.error("Failed to create seed thought:", error);
      return NextResponse.json(
        { error: "Failed to create seed thought" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        sessionId: genSessionId,
        seedThoughtId,
        message: "Infinite thought generation started",
      },
    });
  } catch (error: any) {
    console.error("Error starting infinite generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start infinite generation" },
      { status: 500 }
    );
  }
}

// DELETE - Stop infinite thought generation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (activeGenerations.has(sessionId)) {
      activeGenerations.get(sessionId)!.isRunning = false;
      activeGenerations.delete(sessionId);
      return NextResponse.json({
        message: "Infinite generation stopped",
      });
    }

    return NextResponse.json(
      { error: "No active generation found for this session" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Error stopping infinite generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stop infinite generation" },
      { status: 500 }
    );
  }
}

// Helper function to create seed thought
async function createSeedThought(seedThought: string) {
  // Analyze seed thought mood and tags
  let mood = "neutral";
  try {
    mood = await analyzeMood(seedThought);
  } catch (error) {
    console.error("Mood analysis failed for seed:", error);
  }

  const tags = extractTags(seedThought);

  // Insert seed thought
  const { data: seedData, error: seedError } = await supabase
    .from("thoughts")
    .insert([{
      text: seedThought,
      tags,
      mood,
      connections: [],
    }])
    .select()
    .single();

  if (seedData) {
    return seedData;
  } else {
    throw new Error(seedError?.message || "Failed to create seed thought");
  }
}

// Infinite generation function
async function startInfiniteGeneration(sessionId: string, seedThought: string, seedThoughtId: string) {
  activeGenerations.set(sessionId, { isRunning: true, lastThoughtId: seedThoughtId });

  try {
    let lastThoughtId = seedThoughtId;
    let lastThoughtText = seedThought;
    let previousThoughts: string[] = [seedThought]; // Keep last 3 thoughts for context

    console.log(`[${sessionId}] Seed thought created: ${seedThoughtId}`);

    // Server-side backup loop (less frequent, mainly as backup)
    let iteration = 0;
    const maxIterations = 10000; // Much higher limit
    const delayBetweenThoughts = 10000; // 10 seconds between thoughts (slower backup)

    console.log(`[${sessionId}] Starting server-side backup generation loop...`);
    
    while (activeGenerations.get(sessionId)?.isRunning && iteration < maxIterations) {
      iteration++;
      
      // Check if still running before each iteration
      const generationState = activeGenerations.get(sessionId);
      if (!generationState || !generationState.isRunning) {
        console.log(`[${sessionId}] Server generation stopped at iteration ${iteration}`);
        break;
      }
      
      try {
        // Build context from last 2-3 thoughts for better continuity
        const contextThoughts = previousThoughts.slice(-3);
        const contextText = contextThoughts.length > 1 
          ? `Previous thoughts in sequence: ${contextThoughts.map((t, i) => `${i + 1}. "${t}"`).join(' ')}`
          : `Starting from: "${contextThoughts[0]}"`;
        
        // Generate next thought based on the chain - make it feel like a continuous stream
        const contextPrompt = `You are generating an infinite loop of connected intrusive, backchod thoughts. ${contextText}. 

Generate the NEXT thought in this continuous chain. It should:
- Be directly related to the previous thought(s) but take it deeper/darker/weirder
- Feel like a natural continuation or unexpected tangent
- Be short (1-2 sentences max), raw, unfiltered, and provocative
- Create a sense of endless, looping consciousness

The thought should flow naturally from what came before, like thoughts connecting in an infinite loop.`;
        
        const newThoughtText = await generateThought(contextPrompt, undefined);

        if (!newThoughtText || newThoughtText.trim().length === 0) {
          console.error(`[${sessionId}] Empty thought generated, skipping...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenThoughts));
          continue;
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
            connections: lastThoughtId ? [lastThoughtId] : [],
          }])
          .select()
          .single();

        if (newThoughtData) {
          // Update previous thought to connect to this one (create chain)
          if (lastThoughtId) {
            // Get current connections of previous thought
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
          }

          // Update state
          lastThoughtId = newThoughtData.id;
          lastThoughtText = newThoughtText;
          previousThoughts.push(newThoughtText);
          
          // Keep only last 3 thoughts for context (prevent context from growing too large)
          if (previousThoughts.length > 3) {
            previousThoughts.shift();
          }

          activeGenerations.get(sessionId)!.lastThoughtId = lastThoughtId;
          
          console.log(`[${sessionId}] Generated thought ${iteration}: ${newThoughtData.id} - "${newThoughtText.substring(0, 50)}..."`);
        } else {
          console.error(`[${sessionId}] Failed to insert thought:`, insertError);
        }

        // Wait before generating next thought
        await new Promise(resolve => setTimeout(resolve, delayBetweenThoughts));

      } catch (error: any) {
        console.error(`[${sessionId}] Error generating thought ${iteration}:`, error);
        
        // Check if still running
        const generationState = activeGenerations.get(sessionId);
        if (!generationState || !generationState.isRunning) {
          console.log(`[${sessionId}] Generation stopped during error handling`);
          break;
        }
        
        // If rate limited, wait longer but keep going
        if (error.message?.includes("rate limit") || error.message?.includes("quota")) {
          console.log(`[${sessionId}] Rate limited, waiting 15 seconds then continuing...`);
          await new Promise(resolve => setTimeout(resolve, 15000));
        } else if (error.message?.includes("API key") || error.message?.includes("401") || error.message?.includes("403")) {
          // Fatal error - stop generation
          console.error(`[${sessionId}] Fatal API error, stopping generation`);
          activeGenerations.get(sessionId)!.isRunning = false;
          break;
        } else {
          // Other errors - wait a bit and retry (don't stop)
          console.log(`[${sessionId}] Retrying after error...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenThoughts * 2));
        }
      }
    }

    console.log(`[${sessionId}] Infinite generation completed after ${iteration} iterations`);
    
  } catch (error) {
    console.error(`[${sessionId}] Fatal error in infinite generation:`, error);
  } finally {
    activeGenerations.delete(sessionId);
  }
}

