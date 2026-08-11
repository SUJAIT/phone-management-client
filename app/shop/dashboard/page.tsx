"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { money } from "@/lib/utils";
import { ShopDashboardStats } from "@/lib/types";
import { ownerColor } from "@/lib/ownerColor";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { Wallet, Clock, Wallet2 } from "lucide-react";

function StatCard({ label, amount, count, href }: { label: string; amount: number; count: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold">{money(amount)}</p>
          <p className="text-xs text-slate-400 mt-1">{count} phone(s) sold</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ShopDashboardPage() {
  const [stats, setStats] = useState<ShopDashboardStats | null>(null);
  const [unpaid, setUnpaid] = useState<{ ownerId: string; name: string; unpaid: number; totalOwed: number; totalPaid: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [payTarget, setPayTarget] = useState<{ ownerId: string; name: string } | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState("");

  function load() {
    Promise.all([api.get("/dashboard/shop"), api.get("/shop-payments/by-owner")])
      .then(([d, u]) => {
        setStats(d.data);
        setUnpaid(u.data.owners);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones", "payments"], load);

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
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-6">Shop Dashboard</h1>

        {loading || !stats ? (
          <PageLoader />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Link href="/shop">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Unsold Phones</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.totalUnsoldQuantity}
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/shop/sold">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sold Phones</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalSoldQuantity}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatCard label="Today's Sale" amount={stats.totalSell.day.amount} count={stats.totalSell.day.count} href="/shop/sold" />
              <StatCard label="This Week Sale" amount={stats.totalSell.week.amount} count={stats.totalSell.week.count} href="/shop/sold?period=week" />
              <StatCard label="This Month Sale" amount={stats.totalSell.month.amount} count={stats.totalSell.month.count} href="/shop/sold?period=month" />
              <StatCard label="This Year Sale" amount={stats.totalSell.year.amount} count={stats.totalSell.year.count} href="/shop/sold?period=year" />
            </div>

            {/* Sale Average — Week / Month. Tap through for the exact date/time/amount breakdown. */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Link href="/shop/sale-average/week">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Week Sale Average</p>
                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      {money(stats.saleAverage.week.average)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats.saleAverage.week.count} sale(s) &middot; tap for details
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/shop/sale-average/month">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Month Sale Average</p>
                    <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      {money(stats.saleAverage.month.average)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats.saleAverage.month.count} sale(s) &middot; tap for details
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Final Buying Price Unsold Phone Total + Long Time Unsold Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Link href="/shop">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                      <Wallet2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Final Buying Price — Unsold Phone Total
                      </p>
                      <p className="text-xl font-bold">{money(stats.finalBuyingPriceUnsoldTotal)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">across both owners &middot; tap for details</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/long-time-unsold">
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-300 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Long Time Unsold Phone</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {stats.longTimeUnsoldQuantity}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">avg {stats.longTimeUnsoldAvgDays}d &middot; tap for details</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Week Profit</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {money(stats.totalProfit.week)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Month Profit</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {money(stats.totalProfit.month)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Year Profit</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {money(stats.totalProfit.year)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Unpaid Money by Reseller</h2>
              <Link href="/shop/payments" className="text-sm text-brand-600 dark:text-brand-400 underline">
                Payment history
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {unpaid.map((o) => {
                const c = ownerColor(o.ownerId);
                return (
                  <Card key={o.ownerId} className={`border-l-4 ${c.leftBorder}`}>
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${c.bg} ${c.text} flex items-center justify-center font-semibold`}>
                          {o.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${c.text}`}>{o.name} Unpaid</p>
                          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{money(o.unpaid)}</p>
                        </div>
                      </div>
                      {/* <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPayTarget({ ownerId: o.ownerId, name: o.name })}
                      >
                        Paid — minus
                      </Button> */}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <h2 className="font-semibold mb-3">Recent Issue / Bad Review</h2>
            {stats.recentIssues.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No issues right now.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentIssues.map((p) => (
                  <Card key={p._id}>
                    <CardContent className="p-4 text-sm">
                      <p className="font-medium">
                        {p.name} — IMEI: {p.imei}
                      </p>
                      <p className="text-red-600 dark:text-red-400 mt-1">{p.issueDescription}</p>
                    </CardContent>
                  </Card>
                ))}
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
