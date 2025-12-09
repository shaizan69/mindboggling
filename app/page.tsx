"use client";

import { Layout } from "@/components/Layout";
import { ThoughtGraph } from "@/components/ThoughtGraph";
import { SeedThoughtForm } from "@/components/SeedThoughtForm";
import { useThoughts } from "@/hooks/useThoughts";
import { useBranchThoughts } from "@/hooks/useExpandThoughts";
import { useUIStore } from "@/stores/useUIStore";
import { useState, useEffect } from "react";
import { Thought } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

import { Loader } from "@/components/Loader";

export default function Home() {
  const { filters } = useUIStore();
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const branchThoughts = useBranchThoughts();

  const { data: thoughts = [], isLoading, error } = useThoughts({
    mood: filters.mood || undefined,
    search: filters.searchQuery || undefined,
    limit: 200,
  });

  // Auto-refresh to keep UI updated (every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
    }, 2000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const handleNodeClick = async (thought: Thought) => {
    setSelectedThought(thought);
    
    // Check if this node has already been expanded
    if (expandedNodes.has(thought.id)) {
      console.log(`⚠️ Node "${thought.text.substring(0, 30)}..." already expanded.`);
      return;
    }

    // Don't generate if already generating
    if (isGenerating) {
      console.log(`⚠️ Already generating, please wait...`);
      return;
    }

    console.log(`🚀 Generating 5 children for: "${thought.text.substring(0, 50)}..."`);
    setIsGenerating(true);

    try {
      // Generate 5 child nodes using Gemini API (limited to avoid rate limits)
        await branchThoughts.mutateAsync({
          thoughtId: thought.id,
          thoughtText: thought.text,
        count: 5,
        });

      // Mark this node as expanded
      setExpandedNodes(prev => new Set([...prev, thought.id]));
      
      console.log(`✅ Generated children!`);
      
      // Refresh thoughts
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
      } catch (error) {
      console.error("❌ Failed to generate children:", error);
      } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="text-center flex flex-col items-center">
            <Loader />
            <p className="text-gray-400 mt-12">Loading mind network...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error loading thoughts</p>
            <p className="text-gray-500 text-sm">
              Please check your Supabase configuration
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {thoughts.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <SeedThoughtForm />
        </div>
      ) : (
        <div className="relative h-screen w-full">
          <ThoughtGraph
            thoughts={thoughts}
            onNodeClick={handleNodeClick}
          />
          
          {/* Generation status */}
          {isGenerating && (
            <div className="absolute top-4 right-4 bg-purple-500/20 border border-purple-500/50 rounded-lg px-4 py-2 text-purple-300 text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                🌱 Generating 5 child thoughts...
              </div>
            </div>
          )}
          
          {/* Selected thought info */}
          {selectedThought && (
            <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-800 rounded-lg p-4 max-w-md backdrop-blur-sm">
              <p className="text-sm text-gray-300">{selectedThought.text}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedThought.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {expandedNodes.has(selectedThought.id) ? (
                <p className="text-xs text-green-400 mt-2">✓ Already expanded</p>
              ) : (
                <p className="text-xs text-purple-400 mt-2">Click to expand with 5 children</p>
              )}
            </div>
          )}
          
          {/* Stats */}
          <div className="absolute top-4 left-4 bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 backdrop-blur-sm">
            {thoughts.length} thoughts • {expandedNodes.size} expanded nodes
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500 backdrop-blur-sm max-w-xs">
            💡 Click any node to generate 5 related thoughts from it
          </div>
        </div>
      )}
    </Layout>
  );
}
