"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Thought } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ThoughtStreamProps {
  thoughts: Thought[];
}

const moodColors: Record<string, string> = {
  chaotic: "from-red-500/20 to-red-600/20",
  existential: "from-purple-500/20 to-purple-600/20",
  funny: "from-yellow-500/20 to-yellow-600/20",
  intrusive: "from-orange-500/20 to-orange-600/20",
  sad: "from-blue-500/20 to-blue-600/20",
  weird: "from-green-500/20 to-green-600/20",
  wholesome: "from-pink-500/20 to-pink-600/20",
  neutral: "from-gray-500/20 to-gray-600/20",
};

export function ThoughtStream({ thoughts }: ThoughtStreamProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentThought = thoughts[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % thoughts.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + thoughts.length) % thoughts.length);
  };

  if (!currentThought) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No thoughts available</p>
      </div>
    );
  }

  const moodColor = moodColors[currentThought.mood || "neutral"] || moodColors.neutral;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentThought.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center p-8"
        >
          <div
            className={cn(
              "max-w-2xl w-full p-8 rounded-2xl border-2 bg-gradient-to-br",
              moodColor,
              "border-white/10"
            )}
          >
            <p className="text-2xl md:text-3xl font-medium leading-relaxed mb-6">
              {currentThought.text}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex gap-2">
                {currentThought.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-black/30 text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span>{formatDate(currentThought.created_at)}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700 rounded-lg backdrop-blur-sm transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all font-medium"
        >
          Next
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          {thoughts.slice(0, 10).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-purple-500 w-8"
                  : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

