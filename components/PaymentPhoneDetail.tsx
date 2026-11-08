"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import PhoneDetailContent from "@/components/PhoneDetailContent";
import { Phone, ShopPhoneView } from "@/lib/types";

const fmt = (n?: number) => {
  const v = Math.round((n ?? 0) * 100) / 100;
  return `\u09F3${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
};

export interface PhonePaySummary {
  id: string;
  name: string;
  imei?: string;
  state?: "paid" | "partial" | "unpaid";
  owed?: number;
  paidAmount?: number;
  unpaidAmount?: number;
}

/**
 * Full details of one phone, opened from the Paid / Unpaid / Statement lists.
 *  - Reseller (isShop = false): the same full detail they see on their own phone pages
 *    (cost breakdown, seller info, histories) via GET /phones/:id.
 *  - Shop holder (isShop = true): ONLY the shop's restricted view via GET /phones/shop/:id
 *    (no buying / transport / service / profit breakdown).
 */
export default function PaymentPhoneDetail({
  summary,
  isShop,
  onBack,
}: {
  summary: PhonePaySummary;
  isShop: boolean;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(isShop ? `/phones/shop/${summary.id}` : `/phones/${summary.id}`)
      .then((r) => setPhone(r.data.phone))
      .catch((e) => setError(e?.response?.data?.message || "Could not load phone details"))
      .finally(() => setLoading(false));
  }, [summary.id, isShop]);

  const shopPhone = phone as ShopPhoneView | null;

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 mb-3">
        <ArrowLeft className="h-4 w-4" /> Back to list
      </button>

      <h4 className="font-semibold text-base mb-1">{summary.name}</h4>
      {summary.imei && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">IMEI {summary.imei}</p>}

      {/* payment status for this phone (from the oldest-first statement) */}
      {summary.owed != null && (
        <div
          className={`rounded-xl p-3 mb-4 text-sm flex items-center justify-between gap-3 ${
            summary.state === "paid"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
          }`}
        >
          <div>
            <p className="font-semibold">
              {summary.state === "paid" ? "Paid" : summary.state === "partial" ? "Partly paid" : "Unpaid"}
            </p>
            <p className="text-xs opacity-80">Shop owes {fmt(summary.owed)} for this phone</p>
          </div>
          <div className="text-right text-xs">
            <p>Paid {fmt(summary.paidAmount)}</p>
            <p className="font-semibold">Unpaid {fmt(summary.unpaidAmount)}</p>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500 text-center py-8">Loading...</p>}
      {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl p-3">{error}</div>}

      {phone && !isShop && <PhoneDetailContent phone={phone as Phone} />}

      {shopPhone && isShop && (
        <div className="space-y-4 text-sm">
          {shopPhone.images?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {shopPhone.images.map((img) => (
                <div key={img} className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {shopPhone.details && <p className="text-slate-600 dark:text-slate-300">{shopPhone.details}</p>}

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span className="text-slate-500">IMEI</span>
            <span className="text-right font-medium">{shopPhone.imei}</span>
            {shopPhone.ram && (
              <>
                <span className="text-slate-500">RAM</span>
                <span className="text-right font-medium">{shopPhone.ram}</span>
              </>
            )}
            {shopPhone.storage && (
              <>
                <span className="text-slate-500">Storage</span>
                <span className="text-right font-medium">{shopPhone.storage}</span>
              </>
            )}
            <span className="text-slate-500">Status</span>
            <span className="text-right font-medium capitalize">{shopPhone.status}</span>
            <span className="text-slate-500">Buying Price</span>
            <span className="text-right font-medium">{fmt(shopPhone.handoverPrice)}</span>
            <span className="text-slate-500">Sale Expectation</span>
            <span className="text-right font-medium">{shopPhone.sellExpectation}</span>
            <span className="text-slate-500">Sold Price</span>
            <span className="text-right font-medium">{fmt(shopPhone.soldPrice)}</span>
            <span className="text-slate-500">Sold On</span>
            <span className="text-right font-medium">{formatDate(shopPhone.soldAt)}</span>
            {typeof shopPhone.owner === "object" && (
              <>
                <span className="text-slate-500">Reseller</span>
                <span className="text-right font-medium">{shopPhone.owner.name}</span>
              </>
            )}
          </div>

          {shopPhone.isLossSale && (
            <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
              Sold below the Buying Price — recorded as a loss.
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Customer</p>
            {shopPhone.customer?.name || shopPhone.customer?.phoneNumber || shopPhone.customer?.email || shopPhone.customer?.address ? (
              <div className="space-y-0.5">
                {shopPhone.customer.name && <p>{shopPhone.customer.name}</p>}
                {shopPhone.customer.phoneNumber && <p className="text-slate-500">{shopPhone.customer.phoneNumber}</p>}
                {shopPhone.customer.email && <p className="text-slate-500">{shopPhone.customer.email}</p>}
                {shopPhone.customer.address && <p className="text-slate-500">{shopPhone.customer.address}</p>}
              </div>
            ) : (
              <p className="text-slate-400 italic">No customer details recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
