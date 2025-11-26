import { create } from "zustand";
import { GraphState } from "@/types";

interface GraphStore extends GraphState {
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setViewMode: (mode: "map" | "stream") => void;
  reset: () => void;
}

const initialState: GraphState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodeId: null,
  viewMode: "map",
};

export const useGraphStore = create<GraphStore>((set) => ({
  ...initialState,
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setViewMode: (viewMode) => set({ viewMode }),
  reset: () => set(initialState),
}));

