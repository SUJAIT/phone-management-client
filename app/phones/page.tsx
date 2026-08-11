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
import { Search } from "lucide-react";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { ColumnDef } from "@tanstack/react-table";

const totalPhoneColumns: ColumnDef<Phone>[] = [
  {
    id: "price",
    header: "Price",
    cell: ({ row }) => {
      const p = row.original;
      return p.status === "sold" ? (
        <span className="font-medium text-blue-600 dark:text-blue-400">{money(p.soldPrice)}</span>
      ) : (
        <span className="font-medium text-brand-700 dark:text-brand-400">{p.sellExpectation}</span>
      );
    },
  },
];

// "Total Phone": every phone this owner has ever added — sold or unsold — with status.
export default function TotalPhonePage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("table");

  function load(q = "") {
    setLoading(true);
    api
      .get("/phones/mine", { params: q ? { q } : {} })
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  useLiveRefresh(["phones"], () => load(query));

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-xl font-bold">Total Phone ({phones.length})</h1>
          <ViewToggle mode={view} onChange={setView} />
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by IMEI or phone name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">You haven't added any phones yet.</p>
        ) : view === "table" ? (
          <PhoneDataTable phones={phones} extraColumns={totalPhoneColumns} ownerActions onChanged={() => load(query)} />
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
