"use client";

import { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, Clock, ScrollText, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useLiveRefresh } from "@/lib/realtime";
import { StatementResponse, StatementPhoneRow, StatementEntryRow } from "@/lib/types";

type View = "unpaid" | "paid" | "statement";

// Exact taka (shows .50 when a half-split profit makes it fractional) so rows add up exactly.
const fmt = (n?: number) => {
  const v = Math.round((n ?? 0) * 100) / 100;
  return `\u09F3${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};

const TABS: { id: View; label: string; icon: any }[] = [
  { id: "unpaid", label: "Unpaid Phones", icon: Clock },
  { id: "paid", label: "Paid Phones", icon: CheckCircle2 },
  { id: "statement", label: "Statement", icon: ScrollText },
];

/**
 * Read-only "bank statement" for what the shop owes one reseller.
 *  - Reseller dashboard: omit `ownerId` (server uses the logged-in reseller).
 *  - Shop dashboard: pass the reseller's `ownerId`.
 */
export default function PaymentStatementModal({
  ownerId,
  name,
  initialView = "unpaid",
  onClose,
}: {
  ownerId?: string;
  name?: string;
  initialView?: View;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>(initialView);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/shop-payments/statement", { params: { view, page, limit: 25, ...(ownerId ? { ownerId } : {}) } })
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(e?.response?.data?.message || "Could not load statement"))
      .finally(() => setLoading(false));
  }, [view, page, ownerId]);

  useEffect(load, [load]);
  useLiveRefresh(["phones", "payments"], load);

  function changeView(v: View) {
    if (v === view) return;
    setData(null);
    setPage(1);
    setView(v);
  }

  const t = data?.totals;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[92vh] flex flex-col border border-transparent dark:border-slate-800"
      >
        {/* header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-lg">{name ? `${name} — ` : ""}Phone Payment Statement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* totals */}
        <div className="grid grid-cols-3 gap-2 px-4">
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total owed</p>
            <p className="font-bold text-sm">{fmt(t?.totalOwed)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Paid</p>
            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{fmt(t?.totalPaid)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-2.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Unpaid</p>
            <p className="font-bold text-sm text-amber-600 dark:text-amber-400">{fmt(t?.unpaid)}</p>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1 px-4 pt-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const count = data ? (id === "unpaid" ? data.counts.unpaid : id === "paid" ? data.counts.paid : data.counts.entries) : null;
            return (
              <button
                key={id}
                onClick={() => changeView(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  view === id
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-4 w-4 hidden sm:block" />
                {label}
                {count !== null && <span className="opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>

        {data && !data.reconciled && (
          <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs p-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            This list does not match the dashboard total. Please do not rely on it and tell the admin.
          </div>
        )}
        {t && t.surplus > 0 && (
          <div className="mx-4 mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs p-2.5">
            Payments received are {fmt(t.surplus)} more than the total owed for sold phones.
          </div>
        )}

        {/* body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[200px]">
          {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl p-3">{error}</div>}
          {loading && !data && <p className="text-sm text-slate-500 text-center py-10">Loading...</p>}

          {data && data.items.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
              {view === "unpaid" ? "No unpaid phones. Everything is paid." : view === "paid" ? "No fully paid phones yet." : "No entries yet."}
            </p>
          )}

          {data && view !== "statement" && (
            <div className="space-y-2">
              {(data.items as StatementPhoneRow[]).map((p) => (
                <div key={p._id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sold {formatDate(p.soldAt)} &middot; for {fmt(p.soldPrice)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {p.state === "paid" ? (
                      <>
                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{fmt(p.owed)}</p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Paid</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-sm text-amber-600 dark:text-amber-400">{fmt(p.unpaidAmount)}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {p.state === "partial" ? `${fmt(p.paidAmount)} paid of ${fmt(p.owed)}` : "Unpaid"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data && view === "statement" && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[110px_1fr_90px_90px_100px] gap-x-3 px-3 py-2 text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/60">
                <span className="hidden sm:block">Date</span>
                <span>Details</span>
                <span className="text-right hidden sm:block">Owed +</span>
                <span className="text-right hidden sm:block">Paid −</span>
                <span className="text-right col-span-2 sm:col-span-1">Balance</span>
              </div>
              {(data.items as StatementEntryRow[]).map((e) => (
                <div
                  key={`${e.type}-${e.id}`}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[110px_1fr_90px_90px_100px] gap-x-3 px-3 py-2 text-sm border-t border-slate-100 dark:border-slate-800 items-center"
                >
                  <span className="hidden sm:block text-xs text-slate-500">{formatDate(e.date).split(",").slice(0, 2).join(",")}</span>
                  <span className="min-w-0">
                    <span className="block truncate">{e.description}</span>
                    <span className="sm:hidden block text-[11px] text-slate-500">
                      {formatDate(e.date)} &middot;{" "}
                      {e.debit > 0 ? <span className="text-red-500">+{fmt(e.debit)}</span> : <span className="text-emerald-600">−{fmt(e.credit)}</span>}
                    </span>
                  </span>
                  <span className="hidden sm:block text-right text-red-500">{e.debit > 0 ? `+${fmt(e.debit)}` : ""}</span>
                  <span className="hidden sm:block text-right text-emerald-600 dark:text-emerald-400">{e.credit > 0 ? `−${fmt(e.credit)}` : ""}</span>
                  <span className="text-right font-semibold">{fmt(e.balance)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-4 pb-4 pt-1">
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mb-2 text-sm">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-slate-500">
                Page {data.page} / {data.pages}
              </span>
              <button
                disabled={page >= data.pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
          <p className="text-[11px] text-slate-400 leading-snug">
            Payments are recorded as one total, so they are matched to the oldest sold phones first (like a bank statement). The
            totals above are exact and always equal the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
