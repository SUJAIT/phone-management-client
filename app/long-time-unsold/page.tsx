"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { money, formatDate } from "@/lib/utils";
import { Phone, ShopPhoneView, LongTimeUnsoldBreakdown } from "@/lib/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Modal from "@/components/Modal";
import PhoneDetailContent from "@/components/PhoneDetailContent";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";
import { useAuth } from "@/lib/auth-context";
import { Clock, Eye } from "lucide-react";

// Colour ramp: the longer a phone has been sitting unsold, the more it stands out.
function ageTone(days: number) {
  if (days >= 30) return "text-red-600 dark:text-red-400";
  if (days >= 20) return "text-amber-600 dark:text-amber-400";
  return "text-slate-700 dark:text-slate-300";
}

/** Full-detail body for the shop role's row-click modal — shop never sees the internal
 * buying-cost breakdown or seller info, only what it's otherwise allowed to see. */
function ShopLongTimeUnsoldDetail({ phone }: { phone: ShopPhoneView & { daysUnsold?: number } }) {
  const ownerName = typeof phone.owner === "object" ? phone.owner.name : "";
  return (
    <div className="space-y-4 text-sm">
      {phone.images?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {phone.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img} src={img} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
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
        <span className="text-slate-500">Added on</span>
        <span className="text-right font-medium">{formatDate(phone.createdAt)}</span>
        <span className="text-slate-500">Days Unsold</span>
        <span className={`text-right font-medium ${ageTone(phone.daysUnsold || 0)}`}>{phone.daysUnsold}d</span>
        {ownerName && (
          <>
            <span className="text-slate-500">Added by</span>
            <span className="text-right font-medium">{ownerName}</span>
          </>
        )}
        <span className="text-slate-500">Buying Price</span>
        <span className="text-right font-medium">{money(phone.handoverPrice)}</span>
        <span className="text-slate-500">Sale Expectation</span>
        <span className="text-right font-medium">{phone.sellExpectation}</span>
      </div>
    </div>
  );
}

/**
 * A phone is "Long Time Unsold" once it's been sitting in stock, unsold, for 10+ days.
 * Shown as a Data Table (name, IMEI, specs, added date, days unsold, price, sale
 * expectation) plus a simple bar breakdown by age-bucket. Every row opens a full detail
 * view on click/tap — owners get the complete buying breakdown & seller info, shop gets
 * everything it's otherwise allowed to see.
 */
export default function LongTimeUnsoldPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LongTimeUnsoldBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailPhone, setDetailPhone] = useState<any | null>(null);

  function load() {
    api
      .get("/phones/long-time-unsold")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones"], load);

  const isShop = user?.role === "shop";
  const maxBucket = data ? Math.max(1, ...data.buckets.map((b) => b.count)) : 1;

  return (
    <ProtectedRoute allow={["owner", "shop"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-5 w-5 text-amber-500" />
          <h1 className="text-xl font-bold">Long Time Unsold Phone</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Phones still available {data ? data.thresholdDays : 10}+ days after they were added. Tap a row to see
          full details.
        </p>

        {loading || !data ? (
          <PageLoader />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quantity</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.quantity}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Average Days Unsold</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {data.averageDaysUnsold}d
                  </p>
                </CardContent>
              </Card>
              <Card className="col-span-2 sm:col-span-1">
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Threshold</p>
                  <p className="text-2xl font-bold">{data.thresholdDays}+ days</p>
                </CardContent>
              </Card>
            </div>

            {data.buckets.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold mb-4">By how long they&apos;ve been unsold</p>
                  <div className="space-y-2.5">
                    {data.buckets.map((b) => (
                      <div key={b.label} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-xs text-slate-500 dark:text-slate-400">{b.label}</span>
                        <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 dark:bg-amber-600 rounded-full flex items-center justify-end px-2"
                            style={{ width: `${Math.max(6, (b.count / maxBucket) * 100)}%` }}
                          >
                            <span className="text-[10px] font-semibold text-white">{b.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.phones.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">
                Nothing has been unsold for {data.thresholdDays}+ days right now.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Specs</TableHead>
                    {isShop && <TableHead>Owner</TableHead>}
                    <TableHead>Added</TableHead>
                    <TableHead>Days Unsold</TableHead>
                    <TableHead>{isShop ? "Buying Price" : "Final Buying Price"}</TableHead>
                    <TableHead>Sale Expectation</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.phones.map((p: any) => {
                    const ownerName = typeof p.owner === "object" ? p.owner?.name : "";
                    const specs = [p.ram && `${p.ram} RAM`, p.storage && `${p.storage} Storage`]
                      .filter(Boolean)
                      .join(" \u00b7 ");
                    const price = isShop
                      ? p.handoverPrice
                      : (p as Phone).buyingPrice +
                        (p as Phone).transportCost +
                        (p as Phone).serviceCost +
                        (p as Phone).issueFixCost;
                    return (
                      <TableRow
                        key={p._id}
                        className="cursor-pointer"
                        onClick={() => setDetailPhone(p)}
                      >
                        <TableCell>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">IMEI: {p.imei}</p>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">{specs || "—"}</TableCell>
                        {isShop && <TableCell>{ownerName}</TableCell>}
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(p.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning" className={ageTone(p.daysUnsold)}>
                            {p.daysUnsold}d
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{money(price)}</TableCell>
                        <TableCell className="text-xs">{p.sellExpectation}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setDetailPhone(p)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        )}

        {detailPhone && (
          <Modal title={detailPhone.name} onClose={() => setDetailPhone(null)}>
            {isShop ? (
              <ShopLongTimeUnsoldDetail phone={detailPhone} />
            ) : (
              <PhoneDetailContent phone={detailPhone as Phone} />
            )}
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}
