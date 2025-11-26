"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Thought } from "@/types";
import { cn } from "@/lib/utils";

interface ThoughtNodeData {
  thought: Thought;
  label: string;
}

const moodColors: Record<string, string> = {
  chaotic: "bg-red-500/20 border-red-500/50 text-red-300",
  existential: "bg-purple-500/20 border-purple-500/50 text-purple-300",
  funny: "bg-yellow-500/20 border-yellow-500/50 text-yellow-300",
  intrusive: "bg-orange-500/20 border-orange-500/50 text-orange-300",
  sad: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  weird: "bg-green-500/20 border-green-500/50 text-green-300",
  wholesome: "bg-pink-500/20 border-pink-500/50 text-pink-300",
  neutral: "bg-gray-500/20 border-gray-500/50 text-gray-300",
};

function ThoughtNodeComponent({ data, selected }: NodeProps<ThoughtNodeData>) {
  const { thought } = data;
  const moodColor = moodColors[thought.mood || "neutral"] || moodColors.neutral;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[300px] transition-all",
        moodColor,
        selected && "ring-2 ring-white ring-offset-2 ring-offset-black"
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="text-sm font-medium mb-1 line-clamp-2">
        {thought.text}
      </div>
      {thought.tags && thought.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {thought.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-black/30 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

export const ThoughtNode = memo(ThoughtNodeComponent);

