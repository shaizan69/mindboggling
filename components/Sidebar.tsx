"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/useUIStore";
import { Mood } from "@/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

const moods: Mood[] = [
  "chaotic",
  "existential",
  "funny",
  "intrusive",
  "sad",
  "weird",
  "wholesome",
  "neutral",
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, filters, setFilters, resetFilters } =
    useUIStore();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Mood Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-400">
                    Mood
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() =>
                          setFilters({
                            mood: filters.mood === mood ? null : mood,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.mood === mood
                            ? "bg-purple-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-400">
                    Search
                  </h3>
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ searchQuery: e.target.value })
                    }
                    placeholder="Search thoughts..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

