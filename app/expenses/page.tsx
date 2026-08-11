"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { LedgerEntry } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Wallet } from "lucide-react";
import Modal from "@/components/Modal";

export default function MyExpensesPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api
      .get("/ledger/expenses")
      .then((res) => setEntries(res.data.entries))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["ledger"], load);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/ledger/expense", { amount: Number(amount), note });
      successToast("Expense recorded");
      setOpen(false);
      setAmount("");
      setNote("");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save expense";
      setError(msg);
      errorAlert("Could not save expense", msg);
    } finally {
      setSaving(false);
    }
  }

  const total = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">My Expenses</h1>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Minus className="h-4 w-4" /> Take money out
          </Button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Money withdrawn from Total Profit. Total withdrawn: <b>{money(total)}</b>
        </p>

        {loading ? (
          <PageLoader />
        ) : entries.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry._id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-300 shrink-0">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{money(entry.amount)}</p>
                    {entry.note && <p className="text-sm text-slate-500 dark:text-slate-400">{entry.note}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {open && (
          <Modal title="Take money out of Total Profit" onClose={() => setOpen(false)}>
            <form onSubmit={submit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <div>
                <label className="label">Amount (Taka) *</label>
                <Input type="number" required min={0} autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Note *</label>
                <Input required placeholder="e.g. Bought a power bank" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Confirm withdrawal"}
              </Button>
            </form>
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}
