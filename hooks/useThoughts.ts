import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Thought } from "@/types";

// Fetch thoughts
export function useThoughts(filters?: {
  mood?: string;
  tag?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["thoughts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.mood) params.append("mood", filters.mood);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/thoughts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch thoughts");
      const data = await response.json();
      return data.data as Thought[];
    },
  });
}

// Create a new thought
export function useCreateThought() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (thought: {
      text: string;
      tags?: string[];
      mood?: string;
    }) => {
      const response = await fetch("/api/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(thought),
      });
      if (!response.ok) throw new Error("Failed to create thought");
      const data = await response.json();
      return data.data as Thought;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
    },
  });
}

// Generate a thought using AI
export function useGenerateThought() {
  return useMutation({
    mutationFn: async (options?: { context?: string; mood?: string }) => {
      const response = await fetch("/api/thoughts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options || {}),
      });
      if (!response.ok) throw new Error("Failed to generate thought");
      const data = await response.json();
      return data.data;
    },
  });
}

// Start infinite thought generation
export function useInfiniteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seedThought: string) => {
      console.log("🚀 STARTING INFINITE GENERATION with seed:", seedThought);
      const response = await fetch("/api/thoughts/infinite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedThought }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Failed to start infinite generation:", error);
        throw new Error(error.error || "Failed to start infinite generation");
      }
      const data = await response.json();
      console.log("✅ Infinite generation started:", data.data);
      return data.data;
    },
    onSuccess: () => {
      console.log("🌊 Infinite generation hook succeeded - starting UI refresh polling");
      // Just log success, no interval here since we handle it in the component
    },
  });
}

// Continue infinite generation (client-side loop)
export function useContinueInfiniteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sessionId: string;
      lastThoughtId: string;
      previousThoughts: string[];
    }) => {
      console.log(`🔄 Continuing generation - Session: ${params.sessionId}, Last ID: ${params.lastThoughtId}`);
      
      const response = await fetch("/api/thoughts/infinite/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Continue generation failed:`, error);
        throw new Error(error.error || "Failed to continue generation");
      }
      
      const data = await response.json();
      console.log(`✅ Generated new thought: ${data.data.newThought.text.substring(0, 50)}...`);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
      
      return data.data;
    },
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });
}

// Stop infinite thought generation
export function useStopInfiniteGeneration() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/thoughts/infinite?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to stop infinite generation");
      }
      return response.json();
    },
  });
}

