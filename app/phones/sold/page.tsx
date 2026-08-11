"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import PhoneCard from "@/components/PhoneCard";
import PhoneDataTable from "@/components/PhoneDataTable";
import ViewToggle, { ViewMode } from "@/components/ViewToggle";
import api from "@/lib/api";
import { money } from "@/lib/utils";
import { Phone } from "@/lib/types";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { ColumnDef } from "@tanstack/react-table";

const soldColumns: ColumnDef<Phone>[] = [
  {
    id: "soldPrice",
    header: "Sold Price",
    cell: ({ row }) => {
      const p = row.original;
      const handover =
        p.shopHandoverPrice ?? p.buyingPrice + p.transportCost + p.serviceCost + p.issueFixCost + p.personalProfit;
      const isLoss = p.soldPrice != null && p.soldPrice < handover;
      return (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {money(p.soldPrice)}
          {isLoss && (
            <span className="ml-1.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-full px-1.5 py-0.5 align-middle">
              Loss
            </span>
          )}
        </span>
      );
    },
  },
  {
    id: "profit",
    header: "Your Profit Share",
    cell: ({ row }) => {
      const p = row.original;
      const total = (p.personalProfit || 0) + (p.splitShare || 0);
      return <span className="text-emerald-600 dark:text-emerald-400">{money(total)}</span>;
    },
  },
];

export default function SoldPhonesPage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("table");

  function load() {
    api
      .get("/phones/sold")
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones"], load);

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-xl font-bold">Sold Phone ({phones.length})</h1>
          <ViewToggle mode={view} onChange={setView} />
        </div>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No phones have sold yet.</p>
        ) : view === "table" ? (
          <PhoneDataTable phones={phones} extraColumns={soldColumns} ownerActions onChanged={load} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {phones.map((p) => (
              <PhoneCard key={p._id} phone={p} ownerActions onChanged={load} />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
