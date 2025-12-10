"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/useUIStore";
import { useGraphStore } from "@/stores/useGraphStore";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ViewSwitch } from "./ViewSwitch";
import { NewSeedButton } from "./NewSeedButton";

export function Header() {
  const { setSidebarOpen } = useUIStore();
  const { viewMode, setViewMode } = useGraphStore();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);
  
  // Determine if switch should be checked (true = stream, false = map)
  const isStreamView = pathname === "/stream";
  
  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      // Switch to stream view
      router.push("/stream");
      setViewMode("stream");
    } else {
      // Switch to map view
      router.push("/");
      setViewMode("map");
    }
  };

  const handleNewSeed = async () => {
    const confirmed = window.confirm(
      "This will clear ALL thoughts and start fresh. Are you sure?"
    );
    
    if (!confirmed) return;

    setIsResetting(true);
    try {
      const response = await fetch("/api/thoughts/reset", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error("Reset failed:", result);
        alert(
          `Failed to clear thoughts!\n\n${result.hint || result.error}\n\nGo to Supabase Dashboard → SQL Editor and run:\n\nCREATE POLICY "Anyone can delete thoughts" ON thoughts FOR DELETE USING (true);`
        );
        return;
      }

      console.log("✅ All thoughts cleared!", result);
      
      // Invalidate cache to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["thoughts"] });
      
      // Force reload to show seed form
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to reset:", error);
      alert("Failed to clear thoughts. Check console for details.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/50 backdrop-blur-md">
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
          <ViewSwitch checked={isStreamView} onChange={handleSwitchChange} />
          <NewSeedButton
            onClick={handleNewSeed}
            disabled={isResetting}
          >
            {isResetting ? "Clearing..." : "New Seed"}
          </NewSeedButton>
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
