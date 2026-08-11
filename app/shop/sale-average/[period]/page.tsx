"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { money } from "@/lib/utils";
import { ShopPhoneView } from "@/lib/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";

/**
 * Sale Average (Week/Month) detail — the exact date, time, and sale amount for every phone
 * sold in the period, so it's clear which sales pulled the average up or down. Reuses the
 * existing "sold in period" data, just filtered to the given period and shown as a table.
 */
export default function SaleAverageDetailPage() {
  const params = useParams<{ period: string }>();
  const period = params.period === "month" ? "month" : "week";

  const [phones, setPhones] = useState<ShopPhoneView[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get(`/phones/shop/sold/${period}`)
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(load, [period]);
  useLiveRefresh(["phones"], load);

  const total = phones.reduce((s, p) => s + (p.soldPrice || 0), 0);
  const average = phones.length ? Math.round(total / phones.length) : 0;
  const totalProfitShare = phones.reduce((s, p) => s + (p.shopProfitShare || 0), 0);

  return (
    <ProtectedRoute allow={["shop"]}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-1">
          {period === "month" ? "This Month" : "This Week"} Sale Average
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Every sale in {period === "month" ? "this month" : "this week"}, with date, time, and amount.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Average per Sale</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{money(average)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Sales</p>
              <p className="text-2xl font-bold">{phones.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold">{money(total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Jahed&apos;s Total Personal Profit</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{money(totalProfitShare)}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No sales in this period yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Sale Amount</TableHead>
                <TableHead>Jahed&apos;s Personal Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((p) => {
                const d = p.soldAt ? new Date(p.soldAt) : null;
                return (
                  <TableRow key={p._id}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">IMEI: {p.imei}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {d ? d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{money(p.soldPrice)}</TableCell>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {money(p.shopProfitShare || 0)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </main>
    </ProtectedRoute>
  );
}
