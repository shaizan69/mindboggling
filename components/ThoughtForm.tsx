"use client";

import { useState } from "react";
import { useCreateThought, useGenerateThought } from "@/hooks/useThoughts";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useUIStore";

export function ThoughtForm() {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const createThought = useCreateThought();
  const generateThought = useGenerateThought();
  const { setModalOpen } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await createThought.mutateAsync({
        text: text.trim(),
      });
      setText("");
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to create thought:", error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateThought.mutateAsync({});
      if (result?.text) {
        setText(result.text);
      } else {
        throw new Error("No text generated");
      }
    } catch (error: any) {
      console.error("Failed to generate thought:", error);
      // Show error to user
      alert(error?.message || "Failed to generate thought. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="thought-text"
          className="block text-sm font-medium mb-2 text-gray-300"
        >
          Your Thought
        </label>
        <textarea
          id="thought-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share a random thought, intrusive idea, or fragment..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          required
        />
      </div>

      {createThought.isError && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {createThought.error instanceof Error
            ? createThought.error.message
            : "Failed to submit thought. Please try again."}
        </div>
      )}

      {generateThought.isError && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {generateThought.error instanceof Error
            ? generateThought.error.message
            : "Failed to generate thought. Please try again."}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || generateThought.isPending}
          className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Generate thought with AI"
        >
          {isGenerating || generateThought.isPending ? "Generating..." : "Generate with AI"}
        </button>
        <button
          type="submit"
          disabled={!text.trim() || createThought.isPending}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Submit thought"
        >
          {createThought.isPending ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

