// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import InvoicePrint from "@/components/InvoicePrint";
// import Modal from "@/components/Modal";
// import CustomerFields from "@/components/CustomerFields";
// import api from "@/lib/api";
// import { ShopPhoneView, CustomerInfo } from "@/lib/types";
// import { Button } from "@/components/ui/button";
// import { PageLoader } from "@/components/Loader";
// import { successToast, errorAlert } from "@/lib/alert";
// import { Printer, Pencil, ArrowLeft } from "lucide-react";

// export default function ShopInvoicePage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params?.id as string;

//   const [phone, setPhone] = useState<ShopPhoneView | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [notFound, setNotFound] = useState(false);

//   const [editOpen, setEditOpen] = useState(false);
//   const [customer, setCustomer] = useState<CustomerInfo>({});
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   function load() {
//     setLoading(true);
//     api
//       .get(`/phones/shop/${id}`)
//       .then((res) => setPhone(res.data.phone))
//       .catch(() => setNotFound(true))
//       .finally(() => setLoading(false));
//   }

//   useEffect(() => {
//     if (id) load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   function openEdit() {
//     setCustomer(phone?.customer || {});
//     setError("");
//     setEditOpen(true);
//   }

//   async function saveInvoice(e: React.FormEvent) {
//     e.preventDefault();
//     setSaving(true);
//     setError("");
//     try {
//       const res = await api.patch(`/phones/${id}/invoice`, { customer });
//       setPhone(res.data.phone);
//       successToast("Invoice updated");
//       setEditOpen(false);
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || "Could not update invoice";
//       setError(msg);
//       errorAlert("Could not update invoice", msg);
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <ProtectedRoute allow={["shop"]}>
//       <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 px-3 sm:px-6">
//         <div className="max-w-[800px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-2 no-print">
//           <Button variant="secondary" size="sm" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4" /> Back
//           </Button>
//           {phone && (
//             <div className="flex gap-2">
//               <Button variant="secondary" size="sm" onClick={openEdit}>
//                 <Pencil className="h-4 w-4" /> Edit Invoice
//               </Button>
//               <Button size="sm" onClick={() => window.print()}>
//                 <Printer className="h-4 w-4" /> Print / Save PDF
//               </Button>
//             </div>
//           )}
//         </div>

//         {loading ? (
//           <PageLoader />
//         ) : notFound || !phone ? (
//           <p className="text-center text-slate-500 dark:text-slate-400">Phone not found.</p>
//         ) : phone.status !== "sold" ? (
//           <p className="text-center text-slate-500 dark:text-slate-400">
//             This phone hasn&apos;t been sold yet, so there&apos;s no invoice to show.
//           </p>
//         ) : (
//           <InvoicePrint phone={phone} />
//         )}

//         {editOpen && (
//           <Modal title="Edit Invoice — Customer Details" onClose={() => setEditOpen(false)}>
//             <form onSubmit={saveInvoice} className="space-y-4">
//               {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
//               <p className="text-xs text-slate-500 dark:text-slate-400">
//                 Every field is optional. Leave a field blank to keep it off the printed invoice.
//               </p>
//               <CustomerFields value={customer} onChange={setCustomer} />
//               <Button type="submit" disabled={saving} className="w-full">
//                 {saving ? "Saving..." : "Save"}
//               </Button>
//             </form>
//           </Modal>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvoicePrint from "@/components/InvoicePrint";
import Modal from "@/components/Modal";
import CustomerFields from "@/components/CustomerFields";
import api from "@/lib/api";
import { ShopPhoneView, CustomerInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/Loader";
import { successToast, errorAlert } from "@/lib/alert";
import { Printer, Pencil, ArrowLeft } from "lucide-react";

export default function ShopInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [phone, setPhone] = useState<ShopPhoneView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The invoice always opens in a brand-new tab, so the embedded Roboto font files start
  // downloading from scratch. If Print/Save-PDF fires before those finish loading, Chrome
  // silently falls back to the system font for that render -- which is exactly what
  // produces the bold-looking lowercase "l". Block printing until the fonts are truly
  // ready so the PDF always uses the same font the page is showing on screen.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      setFontsReady(true);
      return;
    }
    let cancelled = false;
    Promise.all([
      document.fonts.load("400 14px Roboto"),
      document.fonts.load("500 14px Roboto"),
      document.fonts.load("600 14px Roboto"),
      document.fonts.load("700 14px Roboto"),
      document.fonts.load("800 14px Roboto"),
      document.fonts.ready,
    ]).finally(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function load() {
    setLoading(true);
    api
      .get(`/phones/shop/${id}`)
      .then((res) => setPhone(res.data.phone))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function openEdit() {
    setCustomer(phone?.customer || {});
    setError("");
    setEditOpen(true);
  }

  async function saveInvoice(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.patch(`/phones/${id}/invoice`, { customer });
      setPhone(res.data.phone);
      successToast("Invoice updated");
      setEditOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not update invoice";
      setError(msg);
      errorAlert("Could not update invoice", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allow={["shop"]}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 px-3 sm:px-6">
        <div className="max-w-[800px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-2 no-print">
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {phone && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={openEdit}>
                <Pencil className="h-4 w-4" /> Edit Invoice
              </Button>
              <Button size="sm" onClick={() => window.print()} disabled={!fontsReady}>
                <Printer className="h-4 w-4" /> {fontsReady ? "Print / Save PDF" : "Preparing..."}
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <PageLoader />
        ) : notFound || !phone ? (
          <p className="text-center text-slate-500 dark:text-slate-400">Phone not found.</p>
        ) : phone.status !== "sold" ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            This phone hasn&apos;t been sold yet, so there&apos;s no invoice to show.
          </p>
        ) : (
          <InvoicePrint phone={phone} />
        )}

        {editOpen && (
          <Modal title="Edit Invoice — Customer Details" onClose={() => setEditOpen(false)}>
            <form onSubmit={saveInvoice} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every field is optional. Leave a field blank to keep it off the printed invoice.
              </p>
              <CustomerFields value={customer} onChange={setCustomer} />
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save"}
              </Button>
            </form>
          </Modal>
        )}
      </div>
    </ProtectedRoute>
  );
}
