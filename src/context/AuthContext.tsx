"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  isAuthenticated: boolean;
  user: string | null;
  role: string | null;
  login: (username: string, role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/signup"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("factoryos_auth");
    const storedUser = localStorage.getItem("factoryos_user");
    const storedRole = localStorage.getItem("factoryos_role");
    if (stored === "true") {
      setIsAuthenticated(true);
      setUser(storedUser);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = (username: string, role: string) => {
    localStorage.setItem("factoryos_auth", "true");
    localStorage.setItem("factoryos_user", username);
    localStorage.setItem("factoryos_role", role);
    setIsAuthenticated(true);
    setUser(username);
    setRole(role);
    router.push("/home");
  };

  const logout = () => {
    localStorage.removeItem("factoryos_auth");
    localStorage.removeItem("factoryos_user");
    localStorage.removeItem("factoryos_role");
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
