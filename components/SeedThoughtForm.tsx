"use client";

import { useState } from "react";
import { useBranchThoughts } from "@/hooks/useExpandThoughts";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function SeedThoughtForm() {
  const [seedText, setSeedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const branchThoughts = useBranchThoughts();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedText.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      console.log("🌱 Creating seed thought and generating 10 children...");
      
      // First, create the seed thought
      const seedResponse = await fetch("/api/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: seedText.trim(),
          tags: [],
          mood: "neutral",
          connections: [],
        }),
      });

      if (!seedResponse.ok) {
        throw new Error("Failed to create seed thought");
      }

      const seedData = await seedResponse.json();
      const seedThoughtId = seedData.data.id;
      console.log("✅ Seed thought created:", seedThoughtId);

      // Now generate 5 children connected to the seed (limited to avoid rate limits)
      console.log("🚀 Generating 5 child thoughts...");
      await branchThoughts.mutateAsync({
        thoughtId: seedThoughtId,
        thoughtText: seedText.trim(),
        count: 5,
      });

      console.log("✅ Generated children for seed thought!");
      
      // Refresh thoughts
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
      
      setSeedText("");
    } catch (error: any) {
      console.error("❌ Failed:", error);
      alert(error.message || "Failed to generate thoughts");
    } finally {
      setIsGenerating(false);
    }
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
          Enter one thought → AI generates 5 connected thoughts → Click any to expand with 5 more
        </p>

        {/* How it works */}
        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-gray-400">
            <span className="text-purple-300 font-medium">How it works:</span><br />
            1️⃣ Enter your seed thought<br />
            2️⃣ AI generates 5 related thoughts<br />
            3️⃣ Click any thought → 5 more spawn from it<br />
            4️⃣ Keep clicking to grow the network!
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
              disabled={isGenerating}
            />
          </div>

          {branchThoughts.isError && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {branchThoughts.error instanceof Error
                ? branchThoughts.error.message
                : "Failed to generate thoughts. Please try again."}
            </div>
          )}

          <button
            type="submit"
            disabled={!seedText.trim() || isGenerating}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg hover:shadow-purple-500/50"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating 5 thoughts...
              </span>
            ) : (
              "🌱 Plant Seed & Generate 5 Thoughts"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
