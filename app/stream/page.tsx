"use client";

import { Layout } from "@/components/Layout";
import { ThoughtStream } from "@/components/ThoughtStream";
import { useThoughts } from "@/hooks/useThoughts";
import { useUIStore } from "@/stores/useUIStore";

export default function StreamPage() {
  const { filters } = useUIStore();

  const { data: thoughts = [], isLoading, error } = useThoughts({
    mood: filters.mood || undefined,
    search: filters.searchQuery || undefined,
    limit: 100,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading thoughts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || thoughts.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              {error ? "Error loading thoughts" : "No thoughts available"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ThoughtStream thoughts={thoughts} />
    </Layout>
  );
}

