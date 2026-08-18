// "use client";

// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import Navbar from "@/components/Navbar";
// import ShopPhoneCard from "@/components/ShopPhoneCard";
// import Modal from "@/components/Modal";
// import api from "@/lib/api";
// import { ShopPhoneView } from "@/lib/types";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Search, AlertTriangle } from "lucide-react";
// import Link from "next/link";
// import { useLiveRefresh } from "@/lib/realtime";
// import { PageLoader } from "@/components/Loader";
// import { successToast, errorAlert } from "@/lib/alert";

// const PERIODS = [
//   { key: "all", label: "All" },
//   { key: "week", label: "This Week" },
//   { key: "month", label: "This Month" },
//   { key: "year", label: "This Year" },
// ];

// function ShopSoldContent() {
//   const searchParams = useSearchParams();
//   const initialPeriod = searchParams.get("period") || "all";

//   const [period, setPeriod] = useState(initialPeriod);
//   const [phones, setPhones] = useState<ShopPhoneView[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState("");

//   // Sold phone develops an issue after the sale -- report it here so it lands on the Issue
//   // Page for the owner to handle (write off as a loss, or fix and re-list).
//   const [issueTarget, setIssueTarget] = useState<ShopPhoneView | null>(null);
//   const [issueDesc, setIssueDesc] = useState("");
//   const [issueError, setIssueError] = useState("");
//   const [issueSaving, setIssueSaving] = useState(false);

//   function load(p: string, q = "") {
//     setLoading(true);
//     api
//       .get(`/phones/shop/sold/${p}`, { params: q ? { q } : {} })
//       .then((res) => setPhones(res.data.phones))
//       .finally(() => setLoading(false));
//   }

//   useEffect(() => {
//     load(period);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [period]);
//   useLiveRefresh(["phones"], () => load(period, query));

//   useEffect(() => {
//     const t = setTimeout(() => load(period, query), 300);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [query]);

//   async function submitIssue(e: React.FormEvent) {
//     e.preventDefault();
//     if (!issueTarget) return;
//     setIssueError("");
//     setIssueSaving(true);
//     try {
//       await api.patch(`/phones/${issueTarget._id}/issue`, { description: issueDesc });
//       successToast("Issue reported — it's now on the Issue Page");
//       setIssueTarget(null);
//       setIssueDesc("");
//       load(period, query);
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || "Could not submit";
//       setIssueError(msg);
//       errorAlert("Could not report issue", msg);
//     } finally {
//       setIssueSaving(false);
//     }
//   }

//   return (
//     <ProtectedRoute allow={["shop"]}>
//       <Navbar />
//       <main className="max-w-6xl mx-auto px-4 py-6">
//         <h1 className="text-xl font-bold mb-4">Sold Phones ({phones.length})</h1>

//         <div className="flex flex-wrap gap-2 mb-4">
//           {PERIODS.map((p) => (
//             <Button
//               key={p.key}
//               size="sm"
//               variant={period === p.key ? "default" : "secondary"}
//               onClick={() => setPeriod(p.key)}
//             >
//               {p.label}
//             </Button>
//           ))}
//         </div>

//         <div className="relative mb-6 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//           <Input
//             className="pl-9"
//             placeholder="Search by IMEI or phone name"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//         </div>

//         {loading ? (
//           <PageLoader />
//         ) : phones.length === 0 ? (
//           <p className="text-slate-500 dark:text-slate-400">No sold phones in this range.</p>
//         ) : (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {phones.map((p) => (
//               <ShopPhoneCard key={p._id} phone={p}>
//                 <Button
//                   onClick={() => {
//                     setIssueTarget(p);
//                     setIssueDesc("");
//                   }}
//                   variant="destructive"
//                   size="sm"
//                   className="w-full"
//                 >
//                   <AlertTriangle className="h-4 w-4" /> Report Issue
//                 </Button>
//               </ShopPhoneCard>
//             ))}
//           </div>
//         )}

//         <p className="text-xs text-slate-400 mt-6">
//           Looking for unsold phones? <Link href="/shop" className="underline">Go here</Link>. Already reported
//           an issue? <Link href="/shop/issues" className="underline">View / update issue status</Link>.
//         </p>

//         {issueTarget && (
//           <Modal title={`Report an issue: ${issueTarget.name}`} onClose={() => setIssueTarget(null)}>
//             <form onSubmit={submitIssue} className="space-y-4">
//               {issueError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{issueError}</div>}
//               <p className="text-xs text-slate-500 dark:text-slate-400">
//                 This phone was already sold. Reporting an issue moves it to the owner's Issue Page so it can be
//                 written off as a loss or repaired.
//               </p>
//               <div>
//                 <label className="label">What's the issue? *</label>
//                 <textarea
//                   required
//                   autoFocus
//                   rows={3}
//                   className="input"
//                   value={issueDesc}
//                   onChange={(e) => setIssueDesc(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" variant="destructive" disabled={issueSaving} className="w-full">
//                 {issueSaving ? "Submitting..." : "Report"}
//               </Button>
//             </form>
//           </Modal>
//         )}
//       </main>
//     </ProtectedRoute>
//   );
// }

// export default function ShopSoldPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
//           Loading...
//         </div>
//       }
//     >
//       <ShopSoldContent />
//     </Suspense>
//   );
// }


// new update 8/18/26

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ShopSoldDataTable from "@/components/ShopSoldDataTable";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { ShopPhoneView } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { successToast, errorAlert } from "@/lib/alert";

const PERIODS = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All" },
];

function ShopSoldContent() {
  const searchParams = useSearchParams();
  const initialPeriod = searchParams.get("period") || "week";

  const [period, setPeriod] = useState(initialPeriod);
  const [phones, setPhones] = useState<ShopPhoneView[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Sold phone develops an issue after the sale -- report it here so it lands on the Issue
  // Page for the owner to handle (write off as a loss, or fix and re-list).
  const [issueTarget, setIssueTarget] = useState<ShopPhoneView | null>(null);
  const [issueDesc, setIssueDesc] = useState("");
  const [issueError, setIssueError] = useState("");
  const [issueSaving, setIssueSaving] = useState(false);

  function load(p: string, q = "") {
    setLoading(true);
    api
      .get(`/phones/shop/sold/${p}`, { params: q ? { q } : {} })
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);
  useLiveRefresh(["phones"], () => load(period, query));

  useEffect(() => {
    const t = setTimeout(() => load(period, query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!issueTarget) return;
    setIssueError("");
    setIssueSaving(true);
    try {
      await api.patch(`/phones/${issueTarget._id}/issue`, { description: issueDesc });
      successToast("Issue reported — it's now on the Issue Page");
      setIssueTarget(null);
      setIssueDesc("");
      load(period, query);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not submit";
      setIssueError(msg);
      errorAlert("Could not report issue", msg);
    } finally {
      setIssueSaving(false);
    }
  }

  const totalSold = phones.reduce((s, p) => s + (p.soldPrice || 0), 0);

  return (
    <ProtectedRoute allow={["shop"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-1">Sold Phones</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {phones.length} sold &middot; {totalSold.toLocaleString()} Taka total in this range
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={period === p.key ? "default" : "secondary"}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
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
        ) : (
          <ShopSoldDataTable phones={phones} onReportIssue={(p) => { setIssueTarget(p); setIssueDesc(""); }} />
        )}

        <p className="text-xs text-slate-400 mt-6">
          Looking for unsold phones? <Link href="/shop" className="underline">Go here</Link>. Already reported
          an issue? <Link href="/shop/issues" className="underline">View / update issue status</Link>.
        </p>

        {issueTarget && (
          <Modal title={`Report an issue: ${issueTarget.name}`} onClose={() => setIssueTarget(null)}>
            <form onSubmit={submitIssue} className="space-y-4">
              {issueError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{issueError}</div>}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This phone was already sold. Reporting an issue moves it to the owner's Issue Page so it can be
                written off as a loss or repaired.
              </p>
              <div>
                <label className="label">What's the issue? *</label>
                <textarea
                  required
                  autoFocus
                  rows={3}
                  className="input"
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                />
              </div>
              <Button type="submit" variant="destructive" disabled={issueSaving} className="w-full">
                {issueSaving ? "Submitting..." : "Report"}
              </Button>
            </form>
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}

export default function ShopSoldPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400">
          Loading...
        </div>
      }
    >
      <ShopSoldContent />
    </Suspense>
  );
}
