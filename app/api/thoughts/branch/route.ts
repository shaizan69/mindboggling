import { NextRequest, NextResponse } from "next/server";
import { generateThought } from "@/lib/gemini/client";
import { extractTags } from "@/lib/utils";
import { supabase } from "@/lib/supabase/server";

// Helper to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple local mood detection to avoid extra API calls
function detectMoodLocally(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (/dark|death|die|kill|hate|angry|rage|fury/.test(lowerText)) return "dark";
  if (/sad|depress|lonely|empty|lost|hopeless/.test(lowerText)) return "melancholic";
  if (/happy|joy|love|excit|amazing|wonderful/.test(lowerText)) return "joyful";
  if (/weird|strange|odd|bizarre|wtf|crazy/.test(lowerText)) return "chaotic";
  if (/think|wonder|what if|why|how|meaning/.test(lowerText)) return "contemplative";
  if (/fear|scare|terror|anxiety|panic|dread/.test(lowerText)) return "anxious";
  
  return "neutral";
}

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
    const { thoughtId, thoughtText, count = 5 } = body;

    // Limit to max 5 to avoid rate limits
    const actualCount = Math.min(count, 5);

    if (!thoughtText || thoughtText.trim().length === 0) {
      return NextResponse.json(
        { error: "Thought text is required" },
        { status: 400 }
      );
    }

    console.log(`🌱 Generating ${actualCount} branches for: "${thoughtText.substring(0, 50)}..."`);

    // Generate multiple branching thoughts with delays
    const generatedThoughts = [];
    const connectionIds: string[] = [];
    
    const branchVariations = [
      'a natural continuation that goes deeper or darker',
      'a related tangent that explores a weird angle',
      'an associated but unexpected intrusive thought',
      'a provocative take on this idea',
      'a chaotic or existential spin on this thought'
    ];

    for (let i = 0; i < actualCount; i++) {
      try {
        // Add delay between API calls to avoid rate limiting (2 seconds)
        if (i > 0) {
          console.log(`⏳ Waiting 2s before generating thought ${i + 1}...`);
          await delay(2000);
        }

        const branchPrompt = `Based on this thought: "${thoughtText}", generate ${branchVariations[i % branchVariations.length]}. Make it short (1-2 sentences), raw, and unfiltered.`;
        
        console.log(`🔄 Generating thought ${i + 1}/${actualCount}...`);
        const newThoughtText = await generateThought(branchPrompt, undefined);

        // Use local mood detection instead of API call
        const mood = detectMoodLocally(newThoughtText);

        // Extract tags locally
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
          console.log(`✅ Generated ${i + 1}/${actualCount}: "${newThoughtText.substring(0, 40)}..."`);
        }
      } catch (error: any) {
        console.error(`❌ Failed to generate branch ${i + 1}:`, error.message);
        
        // If rate limited, wait longer and retry once
        if (error.message?.includes("429") || error.message?.includes("rate") || error.message?.includes("quota")) {
          console.log(`⏳ Rate limited, waiting 10s before retry...`);
          await delay(10000);
          
          try {
            const retryPrompt = `Based on: "${thoughtText}", generate a related intrusive thought. Keep it short and raw.`;
            const retryText = await generateThought(retryPrompt, undefined);
            const mood = detectMoodLocally(retryText);
            const tags = extractTags(retryText);
            
            const { data } = await supabase
              .from("thoughts")
              .insert([{ text: retryText, tags, mood, connections: thoughtId ? [thoughtId] : [] }])
              .select()
              .single();
            
            if (data) {
              generatedThoughts.push(data);
              connectionIds.push(data.id);
              console.log(`✅ Retry succeeded: "${retryText.substring(0, 40)}..."`);
            }
          } catch (retryError) {
            console.error(`❌ Retry also failed, skipping thought ${i + 1}`);
          }
        }
      }
    }

    // Update parent thought with connections (APPEND to existing)
    if (thoughtId && connectionIds.length > 0) {
      const { data: parentThought } = await supabase
        .from("thoughts")
        .select("connections")
        .eq("id", thoughtId)
        .single();
      
      const existingConnections = parentThought?.connections || [];
      const allConnections = [...existingConnections, ...connectionIds];
      
      await supabase
        .from("thoughts")
        .update({ connections: allConnections })
        .eq("id", thoughtId);
    }

    console.log(`🎉 Done! Generated ${generatedThoughts.length}/${actualCount} branches`);

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
