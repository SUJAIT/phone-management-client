"use client";

import { useState } from "react";
import { Phone } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import ImageLightbox from "@/components/ImageLightbox";

/** The full detail body shown inside a Modal — shared by card view and table row view. */
export default function PhoneDetailContent({
  phone,
  showBuyingBreakdown = true,
}: {
  phone: Phone;
  showBuyingBreakdown?: boolean;
}) {
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const ownerName = typeof phone.owner === "object" ? phone.owner.name : "";
  const handover =
    phone.shopHandoverPrice ??
    phone.buyingPrice + phone.transportCost + phone.serviceCost + phone.issueFixCost + phone.personalProfit;

  return (
    <div className="space-y-4 text-sm">
      {phone.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {phone.images.map((img, i) => (
            <button
              key={img}
              onClick={() => {
                setLightboxImages(phone.images);
                setLightboxIndex(i);
              }}
              className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {phone.details && <p className="text-slate-600 dark:text-slate-300">{phone.details}</p>}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <span className="text-slate-500">IMEI</span>
        <span className="text-right font-medium">{phone.imei}</span>
        {phone.ram && (
          <>
            <span className="text-slate-500">RAM</span>
            <span className="text-right font-medium">{phone.ram}</span>
          </>
        )}
        {phone.storage && (
          <>
            <span className="text-slate-500">Storage</span>
            <span className="text-right font-medium">{phone.storage}</span>
          </>
        )}
        <span className="text-slate-500">Status</span>
        <span className="text-right font-medium capitalize">{phone.status}</span>
        <span className="text-slate-500">Added on</span>
        <span className="text-right font-medium">{formatDate(phone.createdAt)}</span>
        {ownerName && (
          <>
            <span className="text-slate-500">Added by</span>
            <span className="text-right font-medium">{ownerName}</span>
          </>
        )}
      </div>

      {showBuyingBreakdown && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
          <span>Buying Price</span>
          <span className="text-right">{money(phone.buyingPrice)}</span>
          <span>Transport Cost</span>
          <span className="text-right">{money(phone.transportCost)}</span>
          <span>Service Cost</span>
          <span className="text-right">{money(phone.serviceCost)}</span>
          {phone.issueFixCost > 0 && (
            <>
              <span>Issue Fix Cost</span>
              <span className="text-right">{money(phone.issueFixCost)}</span>
            </>
          )}
          <span>Personal Profit</span>
          <span className="text-right">{money(phone.personalProfit)}</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">Shop Handover Price</span>
          <span className="text-right font-medium text-slate-800 dark:text-slate-200">{money(handover)}</span>
          <span>Sale Expectation</span>
          <span className="text-right">{phone.sellExpectation}</span>
        </div>
      )}

      {(phone.seller?.name ||
        phone.seller?.phoneNumber ||
        phone.seller?.nidNumber ||
        phone.seller?.socialMediaLink ||
        phone.seller?.note ||
        phone.seller?.nidImageUrl) && (
        <div>
          <p className="font-medium mb-1">Seller Info</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
            {phone.seller?.name && (
              <>
                <span>Name</span>
                <span className="text-right">{phone.seller.name}</span>
              </>
            )}
            {phone.seller?.phoneNumber && (
              <>
                <span>Phone</span>
                <span className="text-right">{phone.seller.phoneNumber}</span>
              </>
            )}
            {phone.seller?.nidNumber && (
              <>
                <span>NID</span>
                <span className="text-right">{phone.seller.nidNumber}</span>
              </>
            )}
            {phone.seller?.socialMediaLink && (
              <>
                <span>Social / ID</span>
                <span className="text-right break-all">{phone.seller.socialMediaLink}</span>
              </>
            )}
            {phone.seller?.note && (
              <>
                <span>Note</span>
                <span className="text-right">{phone.seller.note}</span>
              </>
            )}
          </div>
          {phone.seller?.nidImageUrl && (
            <button
              onClick={() => {
                setLightboxImages([phone.seller.nidImageUrl!]);
                setLightboxIndex(0);
              }}
              className="mt-2 h-20 w-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={phone.seller.nidImageUrl} alt="NID" className="w-full h-full object-cover" />
            </button>
          )}
        </div>
      )}

      {phone.status === "sold" && (
        <div className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl p-3 flex justify-between">
          <span>Sold for {money(phone.soldPrice)}</span>
          <span>on {formatDate(phone.soldAt)}</span>
        </div>
      )}

      {phone.status === "sold" && phone.soldPrice != null && phone.soldPrice < handover && (
        <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
          Sold {money(handover - phone.soldPrice)} below the shop handover price — recorded as a loss.
        </div>
      )}

      {phone.issueHistory?.length > 0 && (
        <div>
          <p className="font-medium mb-1">Issue History</p>
          <div className="space-y-1">
            {phone.issueHistory.map((h, i) => (
              <p key={i} className="text-red-600 dark:text-red-300 text-xs">
                {formatDate(h.createdAt)} — {h.description}
              </p>
            ))}
          </div>
        </div>
      )}

      {phone.issueFixHistory?.length > 0 && (
        <div>
          <p className="font-medium mb-1">Issue Fix History</p>
          <div className="space-y-1">
            {phone.issueFixHistory.map((h, i) => (
              <p key={i} className="text-emerald-600 dark:text-emerald-300 text-xs">
                {formatDate(h.createdAt)} — Repair {money(h.amount)}
                {h.note ? ` (${h.note})` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {phone.lossHistory?.length > 0 && (
        <div>
          <p className="font-medium mb-1">Loss History</p>
          <div className="space-y-1">
            {phone.lossHistory.map((h, i) => (
              <p key={i} className="text-amber-600 dark:text-amber-300 text-xs">
                {formatDate(h.createdAt)} — Loss {money(h.amount)}
                {h.note ? ` (${h.note})` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {lightboxImages && (
        <ImageLightbox images={lightboxImages} startIndex={lightboxIndex} onClose={() => setLightboxImages(null)} />
      )}
    </div>
  );
}
