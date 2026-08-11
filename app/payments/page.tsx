"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { ShopPayment, UnpaidSummary } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [unpaid, setUnpaid] = useState<UnpaidSummary | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([api.get("/shop-payments/history"), api.get("/shop-payments/mine")])
      .then(([h, u]) => {
        setPayments(h.data.payments);
        setUnpaid(u.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["payments"], load);

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-1">Paid Money History</h1>
        {unpaid && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Total received so far: <b>{money(unpaid.totalPaid)}</b> &middot; Still unpaid:{" "}
            <b>{money(unpaid.unpaid)}</b>
          </p>
        )}

        {loading ? (
          <PageLoader />
        ) : payments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <Card key={p._id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{money(p.amount)} received</p>
                    {p.note && <p className="text-sm text-slate-500 dark:text-slate-400">{p.note}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
