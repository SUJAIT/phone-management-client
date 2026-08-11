"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone } from "@/lib/types";
import { money } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import PhoneDetailContent from "@/components/PhoneDetailContent";
import api from "@/lib/api";
import { successToast, errorAlert, confirmAction } from "@/lib/alert";
import { Smartphone, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const statusVariant: Record<Phone["status"], "success" | "info" | "destructive" | "warning"> = {
  available: "success",
  sold: "info",
  issue: "destructive",
  loss: "warning",
};

/**
 * E-commerce style product card: big image up top, name + price below.
 * Clicking the card (outside of any button) opens a full detail view.
 * Pass action buttons as `children` — they render in the card footer.
 * `ownerActions` adds a standard Edit/Delete row (used on All Phone & Total Phone).
 */
export default function PhoneCard({
  phone,
  children,
  showBuyingBreakdown = true,
  ownerActions = false,
  onChanged,
}: {
  phone: Phone;
  children?: React.ReactNode;
  showBuyingBreakdown?: boolean;
  ownerActions?: boolean;
  onChanged?: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ownerName = typeof phone.owner === "object" ? phone.owner.name : "";
  const { user } = useAuth();
  const ownerId = typeof phone.owner === "object" ? phone.owner._id : phone.owner;
  // Edit/Delete are only shown to the owner who added this phone -- on shared pages like
  // "All Phone", Sujait and Ovi can each see the other's phones but not modify them.
  const canManage = !!user && ownerId === user.id;
  const handoverPrice =
    phone.shopHandoverPrice ??
    phone.buyingPrice + phone.transportCost + phone.serviceCost + phone.issueFixCost + phone.personalProfit;
  const isLossSale = phone.status === "sold" && phone.soldPrice != null && phone.soldPrice < handoverPrice;

  const specs = [phone.ram && `${phone.ram} RAM`, phone.storage && `${phone.storage} Storage`]
    .filter(Boolean)
    .join(" \u00b7 ");

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const ok = await confirmAction({
      title: `Delete ${phone.name}?`,
      text: "This can't be undone. If it was unsold, its cost stops counting against your investment right away.",
      confirmText: "Yes, delete it",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api.delete(`/phones/${phone._id}`);
      successToast("Phone deleted");
      onChanged?.();
    } catch (err: any) {
      errorAlert("Could not delete phone", err?.response?.data?.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        <button
          onClick={() => setDetailOpen(true)}
          className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden text-left"
        >
          {phone.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={phone.images[0]} alt={phone.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
              <Smartphone className="h-14 w-14" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge variant={statusVariant[phone.status]} className="capitalize">
              {phone.status}
            </Badge>
            {phone.hidden && <Badge variant="default">Hidden</Badge>}
          </div>
        </button>

        <div className="p-4 flex-1 flex flex-col gap-2">
          <button onClick={() => setDetailOpen(true)} className="text-left">
            <h3 className="font-semibold leading-snug line-clamp-2">{phone.name}</h3>
            {specs && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{specs}</p>}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">IMEI: {phone.imei}</p>
            {ownerName && <p className="text-xs text-slate-500 dark:text-slate-400">Added by: {ownerName}</p>}
          </button>

          <div className="mt-1">
            {phone.status === "sold" ? (
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {money(phone.soldPrice)}
                {isLossSale && (
                  <span className="ml-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-full px-1.5 py-0.5 align-middle">
                    Loss
                  </span>
                )}
              </p>
            ) : (
              <p className="text-lg font-bold text-brand-700 dark:text-brand-400">
                {phone.sellExpectation}
                <span className="text-xs font-normal text-slate-400 ml-1">expected</span>
              </p>
            )}
          </div>

          {phone.status === "issue" && phone.issueDescription && (
            <p className="text-xs bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-lg p-2 line-clamp-2">
              Issue: {phone.issueDescription}
            </p>
          )}

          {phone.status === "loss" && (
            <p className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg p-2">
              Written off as a loss
            </p>
          )}

          {ownerActions && canManage && (
            <div className={`${children ? "" : "mt-auto"} pt-2 flex gap-2`}>
              <Link href={`/phones/${phone._id}/edit`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="sm" className="w-full">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={deleting}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          )}

          {children && <div className="mt-auto pt-2">{children}</div>}
        </div>
      </Card>

      {detailOpen && (
        <Modal title={phone.name} onClose={() => setDetailOpen(false)}>
          <PhoneDetailContent phone={phone} showBuyingBreakdown={showBuyingBreakdown} />
        </Modal>
      )}
    </>
  );
}
