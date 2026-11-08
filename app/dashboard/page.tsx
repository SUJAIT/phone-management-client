"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { money } from "@/lib/utils";
import { OwnerDashboardStats, UnpaidSummary } from "@/lib/types";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert } from "@/lib/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import HoldToConfirmButton from "@/components/HoldToConfirmButton";
import PaymentStatementModal from "@/components/PaymentStatementModal";
import { PageLoader } from "@/components/Loader";
import { Plus, Wallet, Minus } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warn";
  href?: string;
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
      ? "text-red-600 dark:text-red-400"
      : "text-slate-800 dark:text-slate-100";

  const body = (
    <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer h-full" : "h-full"}>
      <CardContent className="p-5">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [unpaid, setUnpaid] = useState<UnpaidSummary | null>(null);
  const [stmtView, setStmtView] = useState<"unpaid" | "paid" | null>(null);
  const [loading, setLoading] = useState(true);

  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState("");

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  function load() {
    Promise.all([api.get("/dashboard/owner"), api.get("/shop-payments/mine")])
      .then(([d, u]) => {
        setStats(d.data);
        setUnpaid(u.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones", "investments", "payments", "ledger"], load);

  const maxPayable = Math.max(0, unpaid?.unpaid ?? 0);
  const payNum = Number(payAmount);
  const payValid = payAmount !== "" && Number.isFinite(payNum) && payNum > 0 && payNum <= maxPayable;

  function openPayModal() {
    setPayAmount("");
    setPayNote("");
    setPayError("");
    setPayOpen(true);
  }

  // Never let the typed value go above the unpaid balance (or below 0).
  function onPayAmountChange(v: string) {
    setPayError("");
    if (v === "") return setPayAmount("");
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return;
    setPayAmount(n > maxPayable ? String(maxPayable) : v);
  }

  async function submitPayment() {
    if (paySaving) return;
    if (!payValid) {
      setPayError(`Enter an amount between 1 and ${maxPayable}`);
      return;
    }
    setPayError("");
    setPaySaving(true);
    try {
      await api.post("/shop-payments/mine", { amount: payNum, note: payNote });
      setPayOpen(false);
      setPayAmount("");
      setPayNote("");
      successToast("Payment recorded");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save payment";
      setPayError(msg);
      load(); // balance may have changed — refresh the limit
    } finally {
      setPaySaving(false);
    }
  }

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    setExpenseError("");
    setExpenseSaving(true);
    try {
      await api.post("/ledger/expense", { amount: Number(expenseAmount), note: expenseNote });
      setExpenseOpen(false);
      setExpenseAmount("");
      setExpenseNote("");
      successToast("Expense recorded");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not save expense";
      setExpenseError(msg);
      errorAlert("Could not save expense", msg);
    } finally {
      setExpenseSaving(false);
    }
  }

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold">My Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/phones/add">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add Phone
              </Button>
            </Link>
            <Link href="/investments">
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" /> Add Investment
              </Button>
            </Link>
          </div>
        </div>

        {loading || !stats ? (
          <PageLoader />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Investment" value={money(stats.totalInvestmentPool)} />
              <StatCard label="Total Unsold Phone" value={money(stats.totalUnsoldPhoneValue)} />
              <StatCard
                label="Total Mobile Adding Average"
                value={`${stats.weeklyAddingAverage.toFixed(1)}/wk`}
                sub={`${stats.monthlyAddingAverage.toFixed(1)}/month \u00b7 tap for details`}
                href="/phones/adding-average"
              />
              <StatCard label="Total Sold Phone" value={money(stats.totalSoldPhoneValue)} href="/phones/sold" />
              <StatCard
                label="Remaining Balance"
                value={money(stats.remainingBalance)}
                tone={stats.remainingBalance >= 0 ? "good" : "warn"}
              />
              <StatCard
                label="Total Profit"
                value={money(stats.totalProfit)}
                sub={`Available: ${money(stats.availableProfit)} \u00b7 tap to withdraw`}
                tone="good"
                href="#profit"
              />
              <StatCard label="Total Personal Profit" value={money(stats.totalPersonalProfit)} tone="good" />
              <StatCard label="Shop Profit Share" value={money(stats.totalShopProfitShare)} tone="good" />
              <StatCard
                label="Total Service Cost"
                value={money(stats.totalServiceCost)}
                href="/phones/service-cost"
              />
              <StatCard label="Total Transport Cost" value={money(stats.totalTransportCost)} />
              <StatCard
                label="This Week Buying Phone"
                value={money(stats.weeklyPurchaseTotal)}
                href="/phones/buying/week"
              />
              <StatCard
                label="This Month Buying Phone"
                value={money(stats.monthlyPurchaseTotal)}
                href="/phones/buying/month"
              />
              {/* <StatCard
                label="Total Loss"
                value={money(stats.totalLoss)}
                tone={stats.totalLoss > 0 ? "warn" : "default"}
                href="/losses"
              /> */}
            </div>

            {/* Total Profit — click to withdraw */}
            <Card id="profit" className="mt-6 border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Available Profit (withdrawable)</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {money(stats.availableProfit)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Withdrawn so far: {money(stats.totalExpenses)} &middot;{" "}
                    <Link href="/expenses" className="underline">
                      view My Expenses
                    </Link>
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setExpenseOpen(true)}>
                  <Minus className="h-4 w-4" /> Take money out
                </Button>
              </CardContent>
            </Card>

            {/* Jahad/Zahed Telecom Unpaid Money */}
            <Card className="mt-4 border-amber-200 dark:border-amber-900">
              <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-300">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Shop Telecom Unpaid Money</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {money(unpaid?.unpaid)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Total owed: {money(unpaid?.totalOwed)} &middot; Received so far: {money(unpaid?.totalPaid)}{" "}
                      &middot; <Link href="/payments" className="underline">view history</Link>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setStmtView("paid")}>
                    Paid Phones
                  </Button>
                  <Button variant="secondary" onClick={() => setStmtView("unpaid")}>
                    Unpaid Phones
                  </Button>
                  <Button variant="secondary" onClick={openPayModal}>
                    I received money — minus it
                  </Button>
                </div>
              </CardContent>
            </Card>
            {stmtView && <PaymentStatementModal name="Shop Telecom" initialView={stmtView} onClose={() => setStmtView(null)} />}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
              <Link href="/phones/all">
                <Card className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.counts.available}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Available Phone</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/phones/sold">
                <Card className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.counts.sold}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sold Phone</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/phones/issues">
                <Card className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.counts.issue}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Issue Phone</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/phones">
                <Card className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.counts.loss}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Loss Phone</p>
                  </CardContent>
                </Card>
              </Link>
    <Link href="/long-time-unsold" className="col-span-2 sm:col-span-1">
  <Card className="text-center hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
        {stats.longTimeUnsoldQuantity}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Long Time Unsold</p>
    </CardContent>
  </Card>
</Link>

{/* <Link href="/losses">
  <Card className="text-center hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <p
        className={`text-3xl font-bold ${
          stats.totalLoss > 0
            ? "text-orange-600 dark:text-orange-400"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {money(stats.totalLoss)}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Total Loss
      </p>
    </CardContent>
  </Card>
</Link> */}

            </div>
          </>
        )}

        {payOpen && (
          <Modal title="Record money received from shop" onClose={() => !paySaving && setPayOpen(false)}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {payError && <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl p-3">{payError}</div>}

              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 p-3 text-sm flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Shop unpaid (max you can minus)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{money(maxPayable)}</span>
              </div>

              {maxPayable <= 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nothing is unpaid right now, so there is no amount to minus.
                </p>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="label">Amount received (Taka) *</label>
                      <button
                        type="button"
                        onClick={() => onPayAmountChange(String(maxPayable))}
                        className="text-xs text-brand-600 dark:text-brand-400 underline mb-1"
                      >
                        Full {money(maxPayable)}
                      </button>
                    </div>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      max={maxPayable}
                      autoFocus
                      value={payAmount}
                      onChange={(e) => onPayAmountChange(e.target.value)}
                      placeholder={`1 - ${maxPayable}`}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Cannot be more than {money(maxPayable)}. After this the unpaid will be{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {money(payValid ? maxPayable - payNum : maxPayable)}
                      </span>
                      .
                    </p>
                  </div>
                  <div>
                    <label className="label">Note</label>
                    <Input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Optional (e.g. bKash TrxID)" />
                  </div>
                  <div>
                    <HoldToConfirmButton
                      label="Hold to confirm payment"
                      holdingLabel="Keep holding"
                      doneLabel="Confirmed"
                      disabled={!payValid}
                      loading={paySaving}
                      onComplete={submitPayment}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Press and hold until the bar is full. Only confirm after payment is complete.
                    </p>
                  </div>
                </>
              )}
            </form>
          </Modal>
        )}

        {expenseOpen && (
          <Modal title="Take money out of Total Profit" onClose={() => setExpenseOpen(false)}>
            <form onSubmit={submitExpense} className="space-y-4">
              {expenseError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{expenseError}</div>}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Available profit: <b>{money(stats?.availableProfit)}</b>
              </p>
              <div>
                <label className="label">Amount (Taka) *</label>
                <Input
                  type="number"
                  required
                  min={0}
                  autoFocus
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Note *</label>
                <Input
                  required
                  placeholder="e.g. withdraw for personal use"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={expenseSaving} className="w-full">
                {expenseSaving ? "Saving..." : "Confirm withdrawal"}
              </Button>
            </form>
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}
