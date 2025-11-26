import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Thought } from "@/types";

// Expand thoughts from a seed thought
export function useExpandThoughts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: { seedThought: string; count?: number }) => {
      const response = await fetch("/api/thoughts/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to expand thoughts");
      }
      const data = await response.json();
      return data.data as Thought[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
    },
  });
}

// Branch thoughts from an existing thought
export function useBranchThoughts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: {
      thoughtId?: string;
      thoughtText: string;
      count?: number;
    }) => {
      const response = await fetch("/api/thoughts/branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to branch thoughts");
      }
      const data = await response.json();
      return data.data as Thought[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
    },
  });
}

