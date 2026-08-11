"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace("/login");
    router.replace(user.role === "owner" ? "/dashboard" : "/shop");
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
      Loading...
    </div>
  );
}
