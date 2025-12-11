"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Thought } from "@/types";
import { cn } from "@/lib/utils";
import styles from "./ThoughtNode.module.css";

interface ThoughtNodeData {
  thought: Thought;
  label: string;
}

function ThoughtNodeComponent({ data, selected }: NodeProps<ThoughtNodeData>) {
  const { thought } = data;
  
  // Create a unique animation delay based on node ID for staggered floating
  const nodeIdHash = thought.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const animationDelay = (nodeIdHash % 3000) / 1000; // Delay between 0-3 seconds

  return (
    <div
      className={cn(
        styles.gradientNode,
        selected && "ring-2 ring-white ring-offset-2 ring-offset-black"
      )}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className={cn("text-sm mb-1 line-clamp-3 relative z-10", styles.gradientText)}>
        {thought.text}
      </div>
      {thought.tags && thought.tags.length > 0 && (
        <div className={styles.tags}>
          {thought.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>
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

