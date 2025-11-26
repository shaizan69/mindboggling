"use client";

import { Layout } from "@/components/Layout";
import { ThoughtGraph } from "@/components/ThoughtGraph";
import { SeedThoughtForm } from "@/components/SeedThoughtForm";
import { useThoughts, useContinueInfiniteGeneration } from "@/hooks/useThoughts";
import { useBranchThoughts } from "@/hooks/useExpandThoughts";
import { useUIStore } from "@/stores/useUIStore";
import { useState, useEffect, useRef } from "react";
import { Thought } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const { filters } = useUIStore();
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [activeInfiniteNodes, setActiveInfiniteNodes] = useState<Set<string>>(new Set());
  const branchThoughts = useBranchThoughts();
  const continueGeneration = useContinueInfiniteGeneration();
  const queryClient = useQueryClient();
  const infiniteIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { data: thoughts = [], isLoading, error } = useThoughts({
    mood: filters.mood || undefined,
    search: filters.searchQuery || undefined,
    limit: 200, // Increased limit for infinite mode
  });

  // Auto-refresh when infinite mode is active
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
    }, 2000); // Faster refresh for infinite mode

    return () => clearInterval(interval);
  }, [queryClient]);

  // Cleanup infinite intervals on unmount
  useEffect(() => {
    return () => {
      infiniteIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      infiniteIntervalsRef.current.clear();
    };
  }, []);

  const handleNodeClick = async (thought: Thought) => {
    setSelectedThought(thought);
    
    // Check if this node is already generating infinitely
    if (activeInfiniteNodes.has(thought.id)) {
      console.log(`🛑 Node ${thought.id} already generating infinitely, skipping...`);
      return;
    }

    console.log(`🚀 Starting INFINITE generation from node: ${thought.id}`);
    
    // Add to active infinite nodes
    setActiveInfiniteNodes(prev => new Set([...prev, thought.id]));
    
    // Start infinite generation for this node
    startInfiniteGenerationForNode(thought);
  };

  const startInfiniteGenerationForNode = (thought: Thought) => {
    const sessionId = `node_${thought.id}_${Date.now()}`;
    let generationCount = 0;
    let currentLastThoughtId = thought.id;
    let currentPreviousThoughts = [thought.text];

    const generateNext = async () => {
      generationCount++;
      console.log(`🔄 Node ${thought.id} - Generation ${generationCount}`);
      
      try {
        const result = await continueGeneration.mutateAsync({
          sessionId,
          lastThoughtId: currentLastThoughtId,
          previousThoughts: currentPreviousThoughts,
        });

        if (result) {
          currentLastThoughtId = result.lastThoughtId;
          currentPreviousThoughts = result.previousThoughts;
          console.log(`✅ Node ${thought.id} - Generated: ${result.newThought.text.substring(0, 50)}...`);
          queryClient.invalidateQueries({ queryKey: ["thoughts"] });
        }
      } catch (error) {
        console.error(`❌ Node ${thought.id} - Generation ${generationCount} error:`, error);
        // Continue generating even on errors
      }
    };

    // Generate immediately
    generateNext();

    // Start infinite loop - every 2 seconds
    const interval = setInterval(generateNext, 2000);
    infiniteIntervalsRef.current.set(thought.id, interval);

    console.log(`🌊 Node ${thought.id} infinite generation started`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading mind network...</p>
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
          {activeInfiniteNodes.size > 0 && (
            <div className="absolute top-4 right-4 bg-purple-500/20 border border-purple-500/50 rounded-lg px-4 py-2 text-purple-300 text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full" style={{animationDelay: '0.2s'}}></div>
                <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full" style={{animationDelay: '0.4s'}}></div>
              </div>
              🌊 {activeInfiniteNodes.size} nodes generating infinitely...
            </div>
          )}
          {selectedThought && (
            <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-800 rounded-lg p-4 max-w-md backdrop-blur-sm">
              <p className="text-sm text-gray-300">{selectedThought.text}</p>
              <div className="flex gap-2 mt-2">
                {selectedThought.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
