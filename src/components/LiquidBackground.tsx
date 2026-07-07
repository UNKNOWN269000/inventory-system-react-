"use client";

import { useEffect, useRef } from "react";

export function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Liquid blobs configuration
    const blobs = [
      { x: 0.2, y: 0.3, radius: 0.4, speedX: 0.0003, speedY: 0.0002, color: "147, 51, 234" }, // purple
      { x: 0.7, y: 0.6, radius: 0.35, speedX: -0.0002, speedY: 0.0003, color: "236, 72, 153" }, // pink
      { x: 0.5, y: 0.2, radius: 0.3, speedX: 0.0001, speedY: -0.0002, color: "168, 85, 247" }, // violet
      { x: 0.3, y: 0.7, radius: 0.25, speedX: -0.0003, speedY: 0.0001, color: "219, 39, 119" }, // deep pink
      { x: 0.8, y: 0.3, radius: 0.2, speedX: 0.0002, speedY: -0.0001, color: "147, 51, 234" }, // purple
    ];

    const render = () => {
      time += 1;
      ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      blobs.forEach((blob, index) => {
        const x = (blob.x + Math.sin(time * blob.speedX + index) * 0.1) * width;
        const y = (blob.y + Math.cos(time * blob.speedY + index) * 0.1) * height;
        const radius = blob.radius * Math.min(width, height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${blob.color}, 0.15)`);
        gradient.addColorStop(0.5, `rgba(${blob.color}, 0.08)`);
        gradient.addColorStop(1, `rgba(${blob.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add subtle noise/texture overlay
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20"
      style={{ filter: "blur(80px)" }}
    />
  );
}
