import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment
function getApiKey(): string {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Google Gemini API key. Please check your .env.local file."
    );
  }
  return apiKey;
}

// Initialize Gemini AI client
export function getGenAI() {
  return new GoogleGenerativeAI(getApiKey());
}

// Get the generative model (using latest model names)
export const getModel = (modelName: string = "gemini-2.5-flash") => {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({ model: modelName });
};

// Thought generation
export async function generateThought(
  context?: string,
  mood?: string
): Promise<string> {
  try {
    const model = getModel("gemini-2.5-flash");
    console.log("Using model: gemini-2.5-flash");
    
    const basePrompt = `Generate a random, intrusive, backchod, or chaotic thought. Make it short (1-2 sentences max), raw, unfiltered, and provocative. It should be the kind of thought that pops into your head unexpectedly - dark, weird, existential, or just completely random. Be creative and don't hold back.`;
    
    let prompt = basePrompt;
    
    if (context) {
      prompt = `Based on this thought: "${context}", generate a related intrusive, backchod, or chaotic thought. Make it short (1-2 sentences max), raw, unfiltered, and provocative. It should be a natural continuation, tangent, or unexpected association.`;
    }
    
    if (mood) {
      prompt += ` The mood should be ${mood}.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from AI");
    }
    
    return text.trim();
  } catch (error: any) {
    console.error("Error generating thought:", error);
    
    // If model not found, try fallback models
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      console.log("Model gemini-2.5-flash not found, trying fallback models...");
      try {
        // Try alternative model names (newer models first)
        const fallbackModels = ["gemini-2.0-flash-exp", "gemini-2.0-flash-thinking-exp", "gemini-pro"];
        for (const fallbackModel of fallbackModels) {
          try {
            const fallbackModelInstance = getModel(fallbackModel);
            const basePrompt = `Generate a random, intrusive, backchod, or chaotic thought. Make it short (1-2 sentences max), raw, unfiltered, and provocative.`;
            let prompt = context 
              ? `Based on: "${context}", generate a related intrusive thought. ${basePrompt}`
              : basePrompt;
            if (mood) prompt += ` The mood should be ${mood}.`;
            
            const result = await fallbackModelInstance.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (text && text.trim().length > 0) {
              console.log(`Successfully used fallback model: ${fallbackModel}`);
              return text.trim();
            }
          } catch (fallbackError) {
            continue; // Try next fallback
          }
        }
        throw new Error("All model fallbacks failed. Please check available Gemini models.");
      } catch (fallbackError: any) {
        throw new Error(fallbackError.message || "Failed to generate thought with fallback models.");
      }
    }
    
    // Provide more specific error messages
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your Gemini API key.");
    }
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }
    
    throw new Error(error.message || "Failed to generate thought. Please try again.");
  }
}

// Generate embeddings (using text-embedding-004 model)
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Note: Gemini doesn't have a direct embedding model in the free tier
    // We'll use a workaround or alternative approach
    // For now, using a simple text-based similarity approach
    // In production, you might want to use a dedicated embedding service
    
    // Alternative: Use OpenAI embeddings or Cohere if needed
    // For MVP, we can use keyword-based similarity
    
    throw new Error(
      "Embedding generation requires additional setup. Using keyword-based similarity for MVP."
    );
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Sentiment/Mood analysis
export async function analyzeMood(text: string): Promise<string> {
  try {
    const model = getModel("gemini-2.5-flash");
    console.log("Using model for mood analysis: gemini-2.5-flash");
    const prompt = `Analyze the mood/sentiment of this thought and return ONLY one word from this list: chaotic, existential, funny, intrusive, sad, weird, wholesome, neutral. Do not include any explanation, just the word. Thought: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let mood = response.text().trim().toLowerCase();
    
    // Clean up the response (remove any extra text)
    mood = mood.split(/\s+/)[0].replace(/[^a-z]/g, "");
    
    const validMoods = [
      "chaotic",
      "existential",
      "funny",
      "intrusive",
      "sad",
      "weird",
      "wholesome",
      "neutral",
    ];
    
    return validMoods.includes(mood) ? mood : "neutral";
  } catch (error) {
    console.error("Error analyzing mood:", error);
    // Return neutral as fallback
    return "neutral";
  }
}

