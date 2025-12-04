"use client";

import { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { ThoughtNode } from "./ThoughtNode";
import { Thought, ThoughtNode as ThoughtNodeType, ThoughtEdge } from "@/types";
import { useGraphStore } from "@/stores/useGraphStore";
import { calculateSimilarity } from "@/lib/utils";

interface ThoughtGraphProps {
  thoughts: Thought[];
  onNodeClick?: (thought: Thought) => void;
}

const nodeTypes: NodeTypes = {
  thought: ThoughtNode,
};

export function ThoughtGraph({ thoughts, onNodeClick }: ThoughtGraphProps) {
  const { selectedNodeId, setSelectedNodeId } = useGraphStore();

  // Transform thoughts to nodes - CIRCULAR LAYOUT (original design)
  const initialNodes = useMemo(() => {
    const nodes: Node[] = thoughts.map((thought, index) => {
      // Circular layout
      const angle = (index / thoughts.length) * 2 * Math.PI;
      const radius = 300;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return {
        id: thought.id,
        type: "thought",
        position: { x, y },
        data: {
          thought,
          label: thought.text.substring(0, 50),
        },
        selected: selectedNodeId === thought.id,
      };
    });
    return nodes;
  }, [thoughts, selectedNodeId]);

  // Create edges based on connections (original design)
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];
    const connectionMap = new Map<string, Set<string>>();

    thoughts.forEach((thought) => {
      if (thought.connections && thought.connections.length > 0) {
        thought.connections.forEach((connectedId) => {
          if (!connectionMap.has(thought.id)) {
            connectionMap.set(thought.id, new Set());
          }
          connectionMap.get(thought.id)!.add(connectedId);
        });
      } else {
        // Fallback: connect based on similarity
        thoughts.forEach((otherThought) => {
          if (thought.id !== otherThought.id) {
            const similarity = calculateSimilarity(thought.text, otherThought.text);
            if (similarity > 0.3) {
              if (!connectionMap.has(thought.id)) {
                connectionMap.set(thought.id, new Set());
              }
              connectionMap.get(thought.id)!.add(otherThought.id);
            }
          }
        });
      }
    });

    connectionMap.forEach((targets, source) => {
      targets.forEach((target) => {
        edges.push({
          id: `${source}-${target}`,
          source,
          target,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#666", strokeWidth: 1 },
        });
      });
    });

    return edges;
  }, [thoughts]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // UPDATE nodes and edges when thoughts change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      const thought = thoughts.find((t) => t.id === node.id);
      if (thought && onNodeClick) {
        onNodeClick(thought);
      }
    },
    [thoughts, onNodeClick, setSelectedNodeId]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const thought = thoughts.find((t) => t.id === node.id);
      if (thought) {
        if (onNodeClick) {
          onNodeClick(thought);
        }
      }
    },
    [thoughts, onNodeClick]
  );

  return (
    <div className="w-full h-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black"
      >
        <Background color="#333" gap={16} />
        <Controls className="bg-gray-900 border-gray-700" />
        <MiniMap
          className="bg-gray-900 border-gray-700"
          nodeColor="#666"
          maskColor="rgba(0,0,0,0.8)"
        />
      </ReactFlow>
    </div>
  );
}
