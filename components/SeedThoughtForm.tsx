"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useExpandThoughts } from "@/hooks/useExpandThoughts";
import { useInfiniteGeneration, useStopInfiniteGeneration, useContinueInfiniteGeneration } from "@/hooks/useThoughts";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function SeedThoughtForm() {
  const [seedText, setSeedText] = useState("");
  const [nodeCount, setNodeCount] = useState(8);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastThoughtId, setLastThoughtId] = useState<string | null>(null);
  const [previousThoughts, setPreviousThoughts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const expandThoughts = useExpandThoughts();
  const infiniteGeneration = useInfiniteGeneration();
  const stopInfinite = useStopInfiniteGeneration();
  const continueGeneration = useContinueInfiniteGeneration();
  const queryClient = useQueryClient();
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized generation function to avoid dependency issues
  const generateNext = useCallback(async (currentSessionId: string, currentLastThoughtId: string, currentPreviousThoughts: string[]) => {
    try {
      console.log(`[${currentSessionId}] Generating next thought...`);
      const result = await continueGeneration.mutateAsync({
        sessionId: currentSessionId,
        lastThoughtId: currentLastThoughtId,
        previousThoughts: currentPreviousThoughts.length > 0 ? currentPreviousThoughts : [seedText],
      });

      if (result) {
        console.log(`[${currentSessionId}] Generated: ${result.newThought.text.substring(0, 50)}...`);
        setLastThoughtId(result.lastThoughtId);
        setPreviousThoughts(result.previousThoughts);
        queryClient.invalidateQueries({ queryKey: ["thoughts"] });
        return result.lastThoughtId;
      }
    } catch (error) {
      console.error(`[${currentSessionId}] Error continuing generation:`, error);
      // Continue generating even on errors
    }
    return currentLastThoughtId;
  }, [continueGeneration, queryClient, seedText]);

  // Client-side infinite generation loop - FIXED VERSION
  useEffect(() => {
    if (!isInfiniteMode || !sessionId) {
      return;
    }

    console.log(`[${sessionId}] Starting INFINITE client-side loop...`);
    let isStopped = false;
    let currentGenerating = false;
    let currentLastThoughtId = lastThoughtId;
    let generationCount = 0;

    const runGeneration = async () => {
      if (currentGenerating || isStopped) {
        return;
      }
      
      generationCount++;
      console.log(`[${sessionId}] Starting generation ${generationCount}, current ID: ${currentLastThoughtId}`);
      
      currentGenerating = true;
      try {
        const result = await continueGeneration.mutateAsync({
          sessionId,
          lastThoughtId: currentLastThoughtId || lastThoughtId || '',
          previousThoughts: previousThoughts.length > 0 ? previousThoughts : [seedText],
        });

        if (result && !isStopped) {
          currentLastThoughtId = result.lastThoughtId;
          console.log(`[${sessionId}] Generation ${generationCount} SUCCESS: ${result.newThought.text.substring(0, 50)}...`);
          
          // Update state
          setLastThoughtId(result.lastThoughtId);
          setPreviousThoughts(result.previousThoughts);
          queryClient.invalidateQueries({ queryKey: ["thoughts"] });
        } else if (isStopped) {
          console.log(`[${sessionId}] Generation ${generationCount} stopped by user`);
        } else {
          console.log(`[${sessionId}] Generation ${generationCount} returned no result`);
        }
      } catch (error) {
        console.error(`[${sessionId}] Generation ${generationCount} ERROR:`, error);
        // Don't stop on error - keep going!
      } finally {
        currentGenerating = false;
      }
    };

    // Start generating immediately
    if (currentLastThoughtId || lastThoughtId) {
      runGeneration();
    }

    // Continue generating every 1.5 seconds FOREVER
    const interval = setInterval(() => {
      if (!isStopped && (currentLastThoughtId || lastThoughtId)) {
        runGeneration();
      } else if (!currentLastThoughtId && !lastThoughtId) {
        console.log(`[${sessionId}] Waiting for lastThoughtId...`);
      }
    }, 1500);

    return () => {
      console.log(`[${sessionId}] Stopping INFINITE loop after ${generationCount} generations`);
      isStopped = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInfiniteMode, sessionId]); // MINIMAL dependencies to prevent restarts - other deps intentionally excluded

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedText.trim()) return;

    // ALWAYS use infinite generation now
    try {
      console.log("🚀 STARTING INFINITE GENERATION with seed:", seedText.trim());
      const result = await infiniteGeneration.mutateAsync(seedText.trim());
      
      console.log("🌊 INFINITE GENERATION STARTED:", result);
      setSessionId(result.sessionId);
      
      // Set initial state
      const seedTextTrimmed = seedText.trim();
      setPreviousThoughts([seedTextTrimmed]);
      
      // Use the seed thought ID directly from the response
      if (result.seedThoughtId) {
        console.log("✅ Setting seed thought ID:", result.seedThoughtId);
        setLastThoughtId(result.seedThoughtId);
        setIsInfiniteMode(true); // Always enable infinite mode
      } else {
        console.error("❌ No seed thought ID returned from server");
        throw new Error("No seed thought ID returned");
      }
      
      setSeedText("");
      console.log("🎯 Ready to start infinite loop!");
    } catch (error: any) {
      console.error("❌ Failed to start infinite generation:", error);
      alert(error.message || "Failed to start infinite generation");
    }
  };

  const handleStopInfinite = async () => {
    console.log("Stopping infinite generation...");
    
    // Stop client-side generation first
    setIsInfiniteMode(false);
    
    if (sessionId) {
      try {
        await stopInfinite.mutateAsync(sessionId);
        console.log("Server-side generation stopped");
      } catch (error: any) {
        console.error("Failed to stop server-side generation:", error);
      }
    }
    
    // Clean up state
    setSessionId(null);
    setLastThoughtId(null);
    setPreviousThoughts([]);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Plant a Seed Thought
        </h2>
        <p className="text-gray-400 mb-6">
          Enter one thought, and watch as AI generates an endless network of
          connected ideas.
        </p>

        {/* Info about infinite mode */}
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-sm font-medium text-purple-300">
              🌊 Infinite Mind Mode Active
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Every thought you create will automatically spawn infinite connected thoughts. 
            Click any node to start its infinite chain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="seed-thought"
              className="block text-sm font-medium mb-2 text-gray-300"
            >
              Your Seed Thought
            </label>
            <textarea
              id="seed-thought"
              value={seedText}
              onChange={(e) => setSeedText(e.target.value)}
              placeholder="What if time doesn't exist..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              required
            />
          </div>

          {/* Removed node count selector - infinite mode always */}

          {(expandThoughts.isError || infiniteGeneration.isError) && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {(expandThoughts.error || infiniteGeneration.error) instanceof Error
                ? (expandThoughts.error || infiniteGeneration.error)?.message
                : "Failed to generate thoughts. Please try again."}
            </div>
          )}

          <div className="flex gap-3">
            {sessionId && (
              <button
                type="button"
                onClick={handleStopInfinite}
                disabled={stopInfinite.isPending}
                className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {stopInfinite.isPending ? "Stopping..." : "⏹ Stop All Generation"}
              </button>
            )}
            <button
              type="submit"
              disabled={!seedText.trim() || infiniteGeneration.isPending}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-purple-500/50"
            >
              {infiniteGeneration.isPending
                ? "🌊 Starting Infinite Mind..."
                : "🌊 Create Infinite Mind"}
            </button>
          </div>
        </form>

        {sessionId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 text-sm text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full" style={{animationDelay: '0.2s'}}></div>
              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full" style={{animationDelay: '0.4s'}}></div>
            </div>
            🌊 Infinite mind active! Click any node to spawn its infinite chain.
            <br />
            <span className="text-xs opacity-75">Session: {sessionId?.slice(-8)}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

