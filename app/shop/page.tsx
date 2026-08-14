// "use client";

// import { useEffect, useState } from "react";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import Navbar from "@/components/Navbar";
// import ShopPhoneCard from "@/components/ShopPhoneCard";
// import Modal from "@/components/Modal";
// import api from "@/lib/api";
// import { ShopPhoneView } from "@/lib/types";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Search } from "lucide-react";
// import { useLiveRefresh } from "@/lib/realtime";
// import { successToast, errorAlert } from "@/lib/alert";
// import { PageLoader } from "@/components/Loader";

// export default function ShopUnsoldPage() {
//   const [phones, setPhones] = useState<ShopPhoneView[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState("");

//   const [soldTarget, setSoldTarget] = useState<ShopPhoneView | null>(null);
//   const [soldPrice, setSoldPrice] = useState("");
//   const [soldError, setSoldError] = useState("");
//   const [soldSaving, setSoldSaving] = useState(false);

//   const [issueTarget, setIssueTarget] = useState<ShopPhoneView | null>(null);
//   const [issueDesc, setIssueDesc] = useState("");
//   const [issueError, setIssueError] = useState("");
//   const [issueSaving, setIssueSaving] = useState(false);

//   // IMEI/name search to find whose phone it is
//   const [imeiQuery, setImeiQuery] = useState("");
//   const [imeiResult, setImeiResult] = useState<{ status: string; owner: any } | null | undefined>(undefined);
//   const [imeiSearching, setImeiSearching] = useState(false);

//   function load(q = "") {
//     setLoading(true);
//     api
//       .get("/phones/shop/unsold", { params: q ? { q } : {} })
//       .then((res) => setPhones(res.data.phones))
//       .finally(() => setLoading(false));
//   }

//   useEffect(() => {
//     const t = setTimeout(() => load(query), 300);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [query]);
//   useLiveRefresh(["phones"], () => load(query));

//   async function submitSold(e: React.FormEvent) {
//     e.preventDefault();
//     if (!soldTarget) return;
//     setSoldError("");
//     setSoldSaving(true);
//     try {
//       await api.patch(`/phones/${soldTarget._id}/sold`, { soldPrice: Number(soldPrice) });
//       successToast("Marked as sold");
//       setSoldTarget(null);
//       setSoldPrice("");
//       load(query);
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || "Could not submit";
//       setSoldError(msg);
//       errorAlert("Could not mark as sold", msg);
//     } finally {
//       setSoldSaving(false);
//     }
//   }

//   async function submitIssue(e: React.FormEvent) {
//     e.preventDefault();
//     if (!issueTarget) return;
//     setIssueError("");
//     setIssueSaving(true);
//     try {
//       await api.patch(`/phones/${issueTarget._id}/issue`, { description: issueDesc });
//       successToast("Issue reported");
//       setIssueTarget(null);
//       setIssueDesc("");
//       load(query);
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || "Could not submit";
//       setIssueError(msg);
//       errorAlert("Could not report issue", msg);
//     } finally {
//       setIssueSaving(false);
//     }
//   }

//   async function searchImei(e: React.FormEvent) {
//     e.preventDefault();
//     if (!imeiQuery.trim()) return;
//     setImeiSearching(true);
//     try {
//       const res = await api.get("/phones/search/imei", { params: { imei: imeiQuery.trim() } });
//       setImeiResult(res.data.phone);
//     } catch {
//       setImeiResult(null);
//     } finally {
//       setImeiSearching(false);
//     }
//   }

//   return (
//     <ProtectedRoute allow={["shop"]}>
//       <Navbar />
//       <main className="max-w-6xl mx-auto px-4 py-6">
//         <h1 className="text-xl font-bold mb-4">Unsold Phone ({phones.length})</h1>

//         <div className="grid sm:grid-cols-2 gap-4 mb-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             <Input
//               className="pl-9"
//               placeholder="Search this list by IMEI or name"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//           </div>

//           <form onSubmit={searchImei} className="flex gap-2">
//             <Input
//               placeholder="Look up any IMEI (whose phone is it)"
//               value={imeiQuery}
//               onChange={(e) => setImeiQuery(e.target.value)}
//             />
//             <Button type="submit" disabled={imeiSearching}>
//               Find
//             </Button>
//           </form>
//         </div>

//         {imeiResult !== undefined && (
//           <div className="mb-6">
//             {imeiResult === null ? (
//               <p className="text-sm text-red-600 dark:text-red-400">No phone found with this IMEI.</p>
//             ) : (
//               <div className="card text-sm">
//                 <p>
//                   This phone belongs to <b>{typeof imeiResult.owner === "object" ? imeiResult.owner.name : ""}</b>.
//                   Status: <b className="capitalize">{imeiResult.status}</b>
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {loading ? (
//           <PageLoader />
//         ) : phones.length === 0 ? (
//           <p className="text-slate-500 dark:text-slate-400">No phones available to sell right now.</p>
//         ) : (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {phones.map((p) => (
//               <ShopPhoneCard key={p._id} phone={p}>
//                 <div className="flex gap-2">
//                   <Button
//                     onClick={() => {
//                       setSoldTarget(p);
//                       setSoldPrice("");
//                     }}
//                     size="sm"
//                     className="flex-1"
//                   >
//                     Sold
//                   </Button>
//                   <Button onClick={() => setIssueTarget(p)} variant="destructive" size="sm" className="flex-1">
//                     Issue
//                   </Button>
//                 </div>
//               </ShopPhoneCard>
//             ))}
//           </div>
//         )}

//         {soldTarget && (
//           <Modal title="Mark phone as sold" onClose={() => setSoldTarget(null)}>
//             <form onSubmit={submitSold} className="space-y-4">
//               {soldError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{soldError}</div>}
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 Sale expectation: <b>{soldTarget.sellExpectation}</b>
//               </p>
//               <div>
//                 <label className="label">Sold price (Taka) *</label>
//                 <Input
//                   type="number"
//                   required
//                   min={0}
//                   autoFocus
//                   value={soldPrice}
//                   onChange={(e) => setSoldPrice(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" disabled={soldSaving} className="w-full">
//                 {soldSaving ? "Submitting..." : "Confirm"}
//               </Button>
//             </form>
//           </Modal>
//         )}

//         {issueTarget && (
//           <Modal title="Report an issue" onClose={() => setIssueTarget(null)}>
//             <form onSubmit={submitIssue} className="space-y-4">
//               {issueError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{issueError}</div>}
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



"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ShopPhoneCard from "@/components/ShopPhoneCard";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { ShopPhoneView } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";

export default function ShopUnsoldPage() {
  const [phones, setPhones] = useState<ShopPhoneView[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [soldTarget, setSoldTarget] = useState<ShopPhoneView | null>(null);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldError, setSoldError] = useState("");
  const [soldSaving, setSoldSaving] = useState(false);

  const [issueTarget, setIssueTarget] = useState<ShopPhoneView | null>(null);
  const [issueDesc, setIssueDesc] = useState("");
  const [issueError, setIssueError] = useState("");
  const [issueSaving, setIssueSaving] = useState(false);

  // IMEI/name search to find whose phone it is
  const [imeiQuery, setImeiQuery] = useState("");
  const [imeiResult, setImeiResult] = useState<{ status: string; owner: any } | null | undefined>(undefined);
  const [imeiSearching, setImeiSearching] = useState(false);

  function load(q = "") {
    setLoading(true);
    api
      .get("/phones/shop/unsold", { params: q ? { q } : {} })
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  useLiveRefresh(["phones"], () => load(query));

  async function submitSold(e: React.FormEvent) {
    e.preventDefault();
    if (!soldTarget) return;
    setSoldError("");
    setSoldSaving(true);
    try {
      await api.patch(`/phones/${soldTarget._id}/sold`, { soldPrice: Number(soldPrice) });
      successToast("Marked as sold");
      setSoldTarget(null);
      setSoldPrice("");
      load(query);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not submit";
      setSoldError(msg);
      errorAlert("Could not mark as sold", msg);
    } finally {
      setSoldSaving(false);
    }
  }

  async function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!issueTarget) return;
    setIssueError("");
    setIssueSaving(true);
    try {
      await api.patch(`/phones/${issueTarget._id}/issue`, { description: issueDesc });
      successToast("Issue reported");
      setIssueTarget(null);
      setIssueDesc("");
      load(query);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not submit";
      setIssueError(msg);
      errorAlert("Could not report issue", msg);
    } finally {
      setIssueSaving(false);
    }
  }

  async function searchImei(e: React.FormEvent) {
    e.preventDefault();
    if (!imeiQuery.trim()) return;
    setImeiSearching(true);
    try {
      const res = await api.get("/phones/search/imei", { params: { imei: imeiQuery.trim() } });
      setImeiResult(res.data.phone);
    } catch {
      setImeiResult(null);
    } finally {
      setImeiSearching(false);
    }
  }

  return (
    <ProtectedRoute allow={["shop"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Unsold Phone ({phones.length})</h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search this list by IMEI or name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <form onSubmit={searchImei} className="flex gap-2">
            <Input
              placeholder="Look up any IMEI (whose phone is it)"
              value={imeiQuery}
              onChange={(e) => setImeiQuery(e.target.value)}
            />
            <Button type="submit" disabled={imeiSearching}>
              Find
            </Button>
          </form>
        </div>

        {imeiResult !== undefined && (
          <div className="mb-6">
            {imeiResult === null ? (
              <p className="text-sm text-red-600 dark:text-red-400">No phone found with this IMEI.</p>
            ) : (
              <div className="card text-sm">
                <p>
                  This phone belongs to <b>{typeof imeiResult.owner === "object" ? imeiResult.owner.name : ""}</b>.
                  Status: <b className="capitalize">{imeiResult.status}</b>
                </p>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No phones available to sell right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {phones.map((p) => (
              <ShopPhoneCard key={p._id} phone={p}>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => {
                      setSoldTarget(p);
                      setSoldPrice("");
                    }}
                    size="sm"
                    className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Sold
                  </Button>
                  <Button
                    onClick={() => setIssueTarget(p)}
                    variant="destructive"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Issue
                  </Button>
                </div>
              </ShopPhoneCard>
            ))}
          </div>
        )}

        {soldTarget && (
          <Modal title="Mark phone as sold" onClose={() => setSoldTarget(null)}>
            <form onSubmit={submitSold} className="space-y-4">
              {soldError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{soldError}</div>}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sale expectation: <b>{soldTarget.sellExpectation}</b>
              </p>
              <div>
                <label className="label">Sold price (Taka) *</label>
                <Input
                  type="number"
                  required
                  min={0}
                  autoFocus
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={soldSaving} className="w-full">
                {soldSaving ? "Submitting..." : "Confirm"}
              </Button>
            </form>
          </Modal>
        )}

        {issueTarget && (
          <Modal title="Report an issue" onClose={() => setIssueTarget(null)}>
            <form onSubmit={submitIssue} className="space-y-4">
              {issueError && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{issueError}</div>}
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