"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "owner" ? "/dashboard" : "/shop");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={handleSubmit}>
          <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-brand-600" /> Phone Business Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to your account</p>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}

          <Label>Email</Label>
          <Input
            type="email"
            required
            className="mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Label>Password</Label>
          <Input
            type="password"
            required
            className="mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
