import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { LiquidBackground } from "@/components/LiquidBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultra Aluminum Pvt Ltd - Production Control System",
  description: "Professional aluminum manufacturing and processing control system.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-zinc-100 antialiased">
        <LiquidBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
