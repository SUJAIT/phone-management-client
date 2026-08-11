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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { ColumnDef } from "@tanstack/react-table";

const serviceCostColumns: ColumnDef<Phone>[] = [
  {
    id: "serviceCost",
    header: "Service Cost",
    cell: ({ row }) => <span>{money(row.original.serviceCost)}</span>,
  },
  {
    id: "issueFixCost",
    header: "Issue Fix Cost",
    cell: ({ row }) => <span>{money(row.original.issueFixCost)}</span>,
  },
  {
    id: "totalCost",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium">{money(row.original.serviceCost + row.original.issueFixCost)}</span>
    ),
  },
];

export default function ServiceCostPage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("table");

  function load(q = "") {
    setLoading(true);
    api
      .get("/phones/service-cost", { params: q ? { q } : {} })
      .then((res) => {
        setPhones(res.data.phones);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);
  useLiveRefresh(["phones"], () => load(query));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(query);
  }

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h1 className="text-xl font-bold">Total Service Cost ({phones.length} phones)</h1>
          <ViewToggle mode={view} onChange={setView} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Total: {money(total)}</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
          <Input placeholder="Search by IMEI or phone name" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No service costs recorded yet.</p>
        ) : view === "table" ? (
          <PhoneDataTable phones={phones} extraColumns={serviceCostColumns} ownerActions onChanged={() => load(query)} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {phones.map((p) => (
              <PhoneCard key={p._id} phone={p} ownerActions onChanged={() => load(query)} />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
