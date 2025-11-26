// Thought types
export interface Thought {
  id: string;
  text: string;
  embedding?: number[];
  tags: string[];
  mood?: Mood;
  created_at: string;
  connections: string[];
}

export type Mood =
  | "chaotic"
  | "existential"
  | "funny"
  | "intrusive"
  | "sad"
  | "weird"
  | "wholesome"
  | "neutral";

// React Flow types
export interface ThoughtNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    thought: Thought;
    label: string;
  };
}

export interface ThoughtEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// State Management types
export interface GraphState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodeId: string | null;
  viewMode: "map" | "stream";
}

export interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  currentModal: string | null;
  filters: {
    mood: Mood | null;
    tags: string[];
    searchQuery: string;
  };
}

// User Submission types
export interface UserSubmission {
  id: string;
  thought_id: string;
  ip_hash: string;
  created_at: string;
}

