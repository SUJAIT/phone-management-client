"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { ShopPayment } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { ownerColor } from "@/lib/ownerColor";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { Wallet } from "lucide-react";

interface OwnerUnpaid {
  ownerId: string;
  name: string;
  unpaid: number;
  totalOwed: number;
  totalPaid: number;
}

export default function ShopPaymentHistoryPage() {
  const [owners, setOwners] = useState<OwnerUnpaid[]>([]);
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Which owners are currently shown in the combined list — starts as "everyone".
  const [visibleOwnerIds, setVisibleOwnerIds] = useState<Set<string> | null>(null);

  const [payTarget, setPayTarget] = useState<OwnerUnpaid | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState("");

  function load() {
    Promise.all([api.get("/shop-payments/by-owner"), api.get("/shop-payments/history")])
      .then(([o, h]) => {
        setOwners(o.data.owners);
        setPayments(h.data.payments);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["payments"], load);

  function ownerIdOf(payment: ShopPayment) {
    return typeof payment.owner === "object" ? payment.owner._id : payment.owner;
  }
  function ownerNameOf(payment: ShopPayment) {
    if (typeof payment.owner === "object") return payment.owner.name;
    return owners.find((o) => o.ownerId === payment.owner)?.name || "Unknown";
  }

  function toggleOwner(ownerId: string) {
    setVisibleOwnerIds((prev) => {
      const all = new Set(owners.map((o) => o.ownerId));
      const current = prev ?? all;
      const next = new Set(current);
      if (next.has(ownerId) && next.size === 1) return all; // clicking the only active one resets to "all"
      if (next.has(ownerId)) next.delete(ownerId);
      else next.add(ownerId);
      return next;
    });
  }

  const filteredPayments = useMemo(() => {
    if (!visibleOwnerIds) return payments;
    return payments.filter((p) => visibleOwnerIds.has(ownerIdOf(p)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, visibleOwnerIds]);

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payTarget) return;
    setPayError("");
    setPaySaving(true);
    try {
      await api.post("/shop-payments/by-owner", {
        ownerId: payTarget.ownerId,
        amount: Number(payAmount),
        note: payNote,
      });
      successToast("Payment recorded");
      setPayTarget(null);
      setPayAmount("");
      setPayNote("");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save payment";
      setPayError(msg);
      errorAlert("Could not save payment", msg);
    } finally {
      setPaySaving(false);
    }
  }

  return (
    <ProtectedRoute allow={["shop"]}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-1">Paid Money History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Every payment, from every reseller, color-coded so it's easy to tell whose is whose.
        </p>

        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Per-owner summary cards, each in their own color */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {owners.map((o) => {
                const c = ownerColor(o.ownerId);
                return (
                  <Card key={o.ownerId} className={`border-l-4 ${c.leftBorder}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full ${c.bg} ${c.text} flex items-center justify-center font-semibold text-sm shrink-0`}>
                          {o.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${c.text}`}>{o.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Paid {money(o.totalPaid)} &middot; Unpaid {money(o.unpaid)}
                          </p>
                        </div>
                      </div>
                      {/* <Button size="sm" variant="secondary" onClick={() => setPayTarget(o)}>
                        Paid — minus
                      </Button> */}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filter chips */}
            {owners.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {owners.map((o) => {
                  const c = ownerColor(o.ownerId);
                  const active = !visibleOwnerIds || visibleOwnerIds.has(o.ownerId);
                  return (
                    <button
                      key={o.ownerId}
                      onClick={() => toggleOwner(o.ownerId)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        active
                          ? `${c.chipActive} border-transparent`
                          : `bg-transparent ${c.text} ${c.border}`
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : c.dot}`} />
                      {o.name}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredPayments.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {filteredPayments.map((p) => {
                  const c = ownerColor(ownerIdOf(p));
                  return (
                    <Card key={p._id} className={`border-l-4 ${c.leftBorder}`}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {money(p.amount)} paid{" "}
                            <span className={`font-semibold ${c.text}`}>&middot; {ownerNameOf(p)}</span>
                          </p>
                          {p.note && <p className="text-sm text-slate-500 dark:text-slate-400">{p.note}</p>}
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.createdAt)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {payTarget && (
          <Modal title={`Record payment to ${payTarget.name}`} onClose={() => setPayTarget(null)}>
            <form onSubmit={submitPayment} className="space-y-4">
              {payError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{payError}</div>}
              <div>
                <label className="label">Amount paid (Taka) *</label>
                <Input type="number" required min={0} autoFocus value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Note</label>
                <Input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Optional" />
              </div>
              <Button type="submit" disabled={paySaving} className="w-full">
                {paySaving ? "Saving..." : "Confirm & minus from unpaid"}
              </Button>
            </form>
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}
