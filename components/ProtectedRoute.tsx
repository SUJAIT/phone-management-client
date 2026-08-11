"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth-context";

export default function ProtectedRoute({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace(user.role === "owner" ? "/dashboard" : "/shop");
    }
  }, [loading, user, allow, router]);

  if (loading || !user || !allow.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
