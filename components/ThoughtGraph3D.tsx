"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Thought } from "@/types";
import styles from "./ThoughtNode.module.css";

// Simple pseudo-random generator seeded by string (deterministic)
function seededRandom(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) / 4294967296);
}

// Controls camera movement based on mouse position (Parallax)
function CameraRig() {
  const { camera, pointer } = useThree();
  const vec = new THREE.Vector3();

  useFrame(() => {
    // Interpolate camera position towards mouse offset
    vec.set(pointer.x * 10, pointer.y * 10, camera.position.z);
    camera.position.lerp(vec, 0.05);
    
    // Always look at center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Individual 3D Node - FLOATING animation with circular motion
interface Node3DProps {
  thought: Thought;
  initialPosition: THREE.Vector3;
  onClick?: (thought: Thought) => void;
  setNodePosition: (id: string, pos: THREE.Vector3) => void;
  index: number; // Index for unique animation offset
}

const Node3D = ({ thought, initialPosition, onClick, setNodePosition, index }: Node3DProps) => {
  const ref = useRef<THREE.Group>(null);
  const basePositionRef = useRef<THREE.Vector3>(initialPosition.clone());
  const startTimeRef = useRef<number>(Date.now());

  // Update base position when initialPosition changes
  React.useEffect(() => {
    if (initialPosition) {
      basePositionRef.current.copy(initialPosition);
    }
  }, [initialPosition]);

  // Animate floating motion using useFrame
  useFrame((state) => {
    if (!ref.current) return;

    // Use state.clock for smooth animation (better than Date.now())
    const timer = state.clock.getElapsedTime();
    
    // Circular floating motion (similar to the Three.js example)
    // Each node has a unique offset based on its index
    const radius = 3; // Floating radius - increased for more visible movement
    const speed = 0.5; // Animation speed multiplier
    
    // Create circular motion pattern like the example
    const offsetX = radius * Math.cos(timer * speed + index);
    const offsetY = radius * Math.sin(timer * speed + index * 1.1);
    const offsetZ = radius * 0.5 * Math.sin(timer * speed * 0.7 + index * 0.8);
    
    // Calculate new position based on base position + floating offset
    const newPosition = new THREE.Vector3(
      basePositionRef.current.x + offsetX,
      basePositionRef.current.y + offsetY,
      basePositionRef.current.z + offsetZ
    );
    
    ref.current.position.copy(newPosition);
    setNodePosition(thought.id, newPosition.clone());
  });

  return (
    <group ref={ref}>
      <Html
        center
        transform
        distanceFactor={20}
        style={{ 
          pointerEvents: "auto",
          userSelect: "none" 
        }}
        zIndexRange={[100, 0]}
      >
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick(thought);
          }}
          style={{ 
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          {/* Use the same styling as ThoughtNode with floating animation */}
          <div className={styles.floatingWrapper}>
            <div className={styles.gradientNode}>
              <div className={`text-sm mb-1 line-clamp-3 relative z-10 ${styles.gradientText}`}>
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
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// Edges connecting the 3D nodes
interface Edges3DProps {
  edges: [string, string][];
  nodePositionsRef: React.MutableRefObject<Map<string, THREE.Vector3>>;
}

const Edges3D = ({ edges, nodePositionsRef }: Edges3DProps) => {
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useFrame(() => {
    if (!geometryRef.current) return;
    
    const points: number[] = [];
    
    edges.forEach(([sourceId, targetId]: [string, string]) => {
      const sourcePos = nodePositionsRef.current.get(sourceId);
      const targetPos = nodePositionsRef.current.get(targetId);
      
      if (sourcePos && targetPos) {
        points.push(sourcePos.x, sourcePos.y, sourcePos.z);
        points.push(targetPos.x, targetPos.y, targetPos.z);
      }
    });
    
    if (points.length > 0) {
      geometryRef.current.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(points, 3)
      );
      geometryRef.current.attributes.position.needsUpdate = true;
      geometryRef.current.setDrawRange(0, points.length / 3);
    }
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial 
        color="#888" 
        transparent 
        opacity={0.4} 
        linewidth={2} 
      />
    </lineSegments>
  );
};

interface ThoughtGraph3DProps {
  thoughts: Thought[];
  onNodeClick?: (thought: Thought) => void;
}

export function ThoughtGraph3D({ thoughts, onNodeClick }: ThoughtGraph3DProps) {
  // Store live positions of nodes for edge drawing
  const nodePositionsRef = useRef(new Map<string, THREE.Vector3>());

  // Generate random static positions for each thought (deterministic based on ID)
  const nodePositions = useMemo(() => {
    const positions = new Map<string, THREE.Vector3>();
    
    thoughts.forEach((thought) => {
      // Generate random 3D position based on thought ID
      const r1 = seededRandom(thought.id + "x");
      const r2 = seededRandom(thought.id + "y");
      const r3 = seededRandom(thought.id + "z");
      
      // Scatter in a cube: -30 to +30 units in each axis
      const spread = 60;
      const x = (r1 * spread) - (spread / 2);
      const y = (r2 * spread) - (spread / 2);
      const z = (r3 * spread) - (spread / 2);
      
      positions.set(thought.id, new THREE.Vector3(x, y, z));
    });
    
    return positions;
  }, [thoughts]);

  // Calculate edges only when thoughts change
  const edges = useMemo(() => {
    const edgeList: [string, string][] = [];

    thoughts.forEach((thought) => {
      if (thought.connections) {
        thought.connections.forEach((targetId) => {
          edgeList.push([thought.id, targetId]);
        });
      }
    });
    return edgeList;
  }, [thoughts]);

  const setNodePosition = (id: string, pos: THREE.Vector3) => {
    nodePositionsRef.current.set(id, pos);
  };

  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 50]} fov={60} />
        
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        {/* Camera Control */}
        <CameraRig />
        
        {/* Nodes - Floating animation with circular motion */}
        {thoughts.map((thought, index) => {
          const position = nodePositions.get(thought.id);
          if (!position) return null;
          
          return (
            <Node3D
              key={thought.id}
              thought={thought}
              initialPosition={position}
              onClick={onNodeClick}
              setNodePosition={setNodePosition}
              index={index}
            />
          );
        })}
        
        {/* Edges - Visible connection lines */}
        <Edges3D edges={edges} nodePositionsRef={nodePositionsRef} />
        
      </Canvas>
    </div>
  );
}
