"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import animationData from "@/lib/redirect-animation.js";

export default function HomeDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { role, user, logout } = useAuth();
  const home = menuStructure[0];
  const categories = home.children ?? [];

  useEffect(() => {
    if (role && role !== "Admin") {
      const departmentPath = `/home/${role.toLowerCase().replace(/ /g, "-")}`;
      router.push(departmentPath);
    }
  }, [role, router]);

  if (role && role !== "Admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-8">
        <div className="w-[500px] max-w-[90vw]">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-pink-400" />
          <p className="text-zinc-400 text-base tracking-wide">
            Redirecting to your department...
          </p>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-zinc-100">
      {/* ... rest of your code unchanged ... */}
    </main>
  );
}
