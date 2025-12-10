"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Modal } from "./Modal";
import { ThoughtForm } from "./ThoughtForm";
import { useUIStore } from "@/stores/useUIStore";
import { LiquidBackground } from "./LiquidBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { modalOpen, currentModal, setModalOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-black text-white relative isolate">
      <LiquidBackground />
      <Header />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
      {modalOpen && currentModal === "add-thought" && (
        <Modal title="Add a New Thought">
          <ThoughtForm />
        </Modal>
      )}
    </div>
  );
}

