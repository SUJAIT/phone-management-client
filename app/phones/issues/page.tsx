"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import PhoneCard from "@/components/PhoneCard";
import PhoneDataTable from "@/components/PhoneDataTable";
import ViewToggle, { ViewMode } from "@/components/ViewToggle";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { Phone } from "@/lib/types";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert, confirmAction } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench } from "lucide-react";

type ActionMode = "menu" | "loss" | "fix";

export default function IssuePhonesPage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("table");

  const [target, setTarget] = useState<Phone | null>(null);
  const [mode, setMode] = useState<ActionMode>("menu");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api
      .get("/phones/issues")
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones"], load);

  function openFor(phone: Phone) {
    setTarget(phone);
    setMode("menu");
    setAmount("");
    setNote("");
    setError("");
  }

  async function submitLoss(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    const ok = await confirmAction({
      title: "Write off this loss?",
      text: "This will be deducted from your available profit first, then your investment if needed.",
      confirmText: "Yes, write it off",
      danger: true,
    });
    if (!ok) return;

    setError("");
    setSaving(true);
    try {
      await api.post(`/phones/${target._id}/loss`, { amount: Number(amount), note });
      successToast("Loss recorded");
      setTarget(null);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not record loss";
      setError(msg);
      errorAlert("Could not record loss", msg);
    } finally {
      setSaving(false);
    }
  }

  async function submitFix(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setError("");
    setSaving(true);
    try {
      await api.post(`/phones/${target._id}/issue-fix`, { repairCost: Number(amount), note });
      successToast("Repair cost recorded — phone is back in stock");
      setTarget(null);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not record repair";
      setError(msg);
      errorAlert("Could not record repair", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-1">Issue Phone ({phones.length})</h1>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tap a phone to write off a loss or record a repair (Issue Fix).
          </p>
          <ViewToggle mode={view} onChange={setView} />
        </div>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No phones currently have an issue.</p>
        ) : view === "table" ? (
          <PhoneDataTable
            phones={phones}
            renderExtraAction={(p) => (
              <Button onClick={() => openFor(p)} size="sm">
                Handle Issue
              </Button>
            )}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {phones.map((p) => (
              <PhoneCard key={p._id} phone={p}>
                <Button onClick={() => openFor(p)} size="sm" className="w-full">
                  Handle Issue
                </Button>
              </PhoneCard>
            ))}
          </div>
        )}

        {target && mode === "menu" && (
          <Modal title={`Handle issue: ${target.name}`} onClose={() => setTarget(null)}>
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{target.issueDescription}</p>
              <button
                onClick={() => setMode("loss")}
                className="w-full flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-left hover:bg-amber-100 dark:hover:bg-amber-950/50"
              >
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-300">Loss</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Write off money — comes from profit first, then investment.
                  </p>
                </div>
              </button>
              <button
                onClick={() => setMode("fix")}
                className="w-full flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-left hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
              >
                <Wrench className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">Issue Fix</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pay to repair — added to the phone's cost, phone goes back on sale.
                  </p>
                </div>
              </button>
            </div>
          </Modal>
        )}

        {target && mode === "loss" && (
          <Modal title="Write off Loss" onClose={() => setTarget(null)}>
            <form onSubmit={submitLoss} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <div>
                <label className="label">Loss amount (Taka) *</label>
                <Input type="number" required min={0} autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Note</label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setMode("menu")} className="flex-1">
                  Back
                </Button>
                <Button type="submit" variant="destructive" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Confirm Loss"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {target && mode === "fix" && (
          <Modal title="Issue Fix" onClose={() => setTarget(null)}>
            <form onSubmit={submitFix} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <div>
                <label className="label">Repair cost (Taka) *</label>
                <Input type="number" required min={0} autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Note</label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
              </div>
              <p className="text-xs text-slate-400">
                This comes out of your Total Investment and raises this phone's final buying price by the same
                amount.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setMode("menu")} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Confirm Repair"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}
