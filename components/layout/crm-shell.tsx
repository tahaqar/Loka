"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; displayName: string };
  branch?: { id: string; name: string; code: string; city: string } | null;
  permissions: string[];
}

const defaultUser: UserProfile = {
  id: "admin",
  name: "Ahmed Al-Amalon (مدير النظام)",
  email: "admin@amalon.com",
  role: { id: "admin-role", name: "admin", displayName: "مدير النظام (Admin)" },
  permissions: ["*"],
};

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        // keep default user
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 lg:ms-64">
        <Header onMenuToggle={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
