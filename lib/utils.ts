import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate similarity between two texts (simple keyword-based for MVP)
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Extract tags from text
export function extractTags(text: string): string[] {
  const commonTags = [
    "fear",
    "loneliness",
    "love",
    "death",
    "time",
    "reality",
    "memory",
    "dream",
    "future",
    "past",
    "identity",
    "purpose",
  ];
  
  const lowerText = text.toLowerCase();
  return commonTags.filter((tag) => lowerText.includes(tag));
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

