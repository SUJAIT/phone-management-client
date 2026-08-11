"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { money, formatDate } from "@/lib/utils";
import { LedgerEntry } from "@/lib/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { TrendingDown } from "lucide-react";

const SALE_LOSS_NOTE = "Sold below shop handover price";

/**
 * Total Loss detail table: every "loss" ledger entry, whether it came from an Issue-page
 * write-off or was recorded automatically because a phone sold for less than its shop
 * handover price.
 */
export default function LossesPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get("/ledger", { params: { type: "loss" } })
      .then((res) => {
        setEntries(res.data.entries);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["ledger", "phones"], load);

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="h-5 w-5 text-amber-500" />
          <h1 className="text-xl font-bold">Total Loss</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Issue-page write-offs and phones sold below their shop handover price.
        </p>

        <Card className="mb-6 border-amber-200 dark:border-amber-900 max-w-xs">
          <CardContent className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Loss</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{money(total)}</p>
          </CardContent>
        </Card>

        {loading ? (
          <PageLoader />
        ) : entries.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No losses recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => {
                const phone = typeof e.phone === "object" ? e.phone : null;
                const isSaleLoss = e.note === SALE_LOSS_NOTE;
                return (
                  <TableRow key={e._id}>
                    <TableCell>
                      {phone ? (
                        <>
                          <p className="font-medium">{phone.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">IMEI: {phone.imei}</p>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isSaleLoss ? "warning" : "destructive"}>
                        {isSaleLoss ? "Sold Below Price" : "Issue Write-off"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">{e.note || "—"}</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(e.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-amber-600 dark:text-amber-400">
                      {money(e.amount)}
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
