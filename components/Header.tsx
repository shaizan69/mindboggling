"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useUIStore";
import { useGraphStore } from "@/stores/useGraphStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const { setSidebarOpen, setModalOpen } = useUIStore();
  const { viewMode, setViewMode } = useGraphStore();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            MindMesh
          </motion.h1>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                viewMode === "map"
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Map
            </button>
            <Link href="/stream">
              <button
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  pathname === "/stream"
                    ? "bg-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Stream
              </button>
            </Link>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all font-medium text-sm"
          >
            New Seed
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

