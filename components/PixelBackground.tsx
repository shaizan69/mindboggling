"use client";

import React, { useEffect, useRef } from "react";

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let blocks: Block[] = [];
    
    const blockSize = 16; // Smaller "Minecraft-like" pixels
    const gap = 0; // No gap for solid pixel look
    
    // Colors
    const baseColor = { r: 10, g: 10, b: 10 }; // Very dark background
    
    class Block {
      x: number;
      y: number;
      size: number;
      phase: number;
      speed: number;
      
      constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.02 + Math.random() * 0.02;
      }
      
      update() {
        // Breathing effect
        this.phase += this.speed;
        
        // Breathing adds slight lightness variation
        const breathingIntensity = (Math.sin(this.phase) + 1) * 0.5;
        const breathingOffset = breathingIntensity * 3;
        
        const r = Math.min(255, baseColor.r + breathingOffset);
        const g = Math.min(255, baseColor.g + breathingOffset);
        const b = Math.min(255, baseColor.b + breathingOffset);
        
        return {
          r: Math.floor(r),
          g: Math.floor(g),
          b: Math.floor(b),
        };
      }
      
      draw(ctx: CanvasRenderingContext2D, color: { r: number, g: number, b: number }) {
        const { r, g, b } = color;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        // Using fillRect with slight overlap to prevent subpixel rendering gaps
        ctx.fillRect(this.x, this.y, this.size + 0.5, this.size + 0.5);
      }
    }
    
    const initBlocks = () => {
      blocks = [];
      const cols = Math.ceil(canvas.width / (blockSize + gap));
      const rows = Math.ceil(canvas.height / (blockSize + gap));
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          blocks.push(new Block(i * (blockSize + gap), j * (blockSize + gap), blockSize));
        }
      }
    };
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBlocks();
    };
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      blocks.forEach(block => {
        const color = block.update();
        block.draw(ctx, color);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ touchAction: "none" }}
    />
  );
}
