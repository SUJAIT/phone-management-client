"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Investment } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert, confirmAction } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/investments")
      .then((res) => setInvestments(res.data.investments))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["investments"], load);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/investments", { amount: Number(amount), source, note });
      setAmount("");
      setSource("");
      setNote("");
      successToast("Investment added");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not add investment";
      setError(msg);
      errorAlert("Could not add investment", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirmAction({ title: "Delete this investment?", danger: true });
    if (!ok) return;
    await api.delete(`/investments/${id}`);
    successToast("Investment deleted");
    load();
  }

  const total = investments.reduce((s, i) => s + i.amount, 0);

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">My Investments</h1>

        <Card className="mb-6">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold">Add New Investment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (Taka) *</Label>
                  <Input type="number" required min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <Label>Source *</Label>
                  <Input
                    required
                    placeholder="e.g. Own savings, borrowed from uncle"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">All Investments</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">Total: {money(total)}</span>
        </div>

        {loading ? (
          <PageLoader />
        ) : investments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No investments added yet.</p>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => (
              <Card key={inv._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {money(inv.amount)} &mdash; {inv.source}
                    </p>
                    {inv.note && <p className="text-sm text-slate-500 dark:text-slate-400">{inv.note}</p>}
                    <p className="text-xs text-slate-400 mt-1">{formatDate(inv.createdAt)}</p>
                  </div>
                  <Button onClick={() => handleDelete(inv._id)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
