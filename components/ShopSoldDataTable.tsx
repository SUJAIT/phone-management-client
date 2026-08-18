"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ShopPhoneView } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { Smartphone, ChevronLeft, ChevronRight, Eye, Printer, AlertTriangle } from "lucide-react";

interface ShopSoldDataTableProps {
  phones: ShopPhoneView[];
  pageSize?: number;
  onReportIssue: (phone: ShopPhoneView) => void;
}

/**
 * Clean, paginated table for a single Sold Phones range (This Week / This Month / This
 * Year / All). Clicking any row opens the full detail; Print opens the printable invoice
 * in a new tab so it can be saved as a PDF straight from the browser's print dialog.
 */
export default function ShopSoldDataTable({ phones, pageSize = 10, onReportIssue }: ShopSoldDataTableProps) {
  const [detailPhone, setDetailPhone] = useState<ShopPhoneView | null>(null);

  const columns = useMemo<ColumnDef<ShopPhoneView>[]>(
    () => [
      {
        id: "image",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
              {p.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <Smartphone className="h-5 w-5 text-slate-300 dark:text-slate-600" />
              )}
            </div>
          );
        },
      },
      {
        id: "name",
        header: "Phone",
        cell: ({ row }) => {
          const p = row.original;
          const specs = [p.ram && `${p.ram} RAM`, p.storage && `${p.storage} Storage`].filter(Boolean).join(" \u00b7 ");
          return (
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">IMEI: {p.imei}</p>
              {specs && <p className="text-xs text-slate-400">{specs}</p>}
            </div>
          );
        },
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const c = row.original.customer;
          return c?.name ? (
            <span className="text-sm">{c.name}</span>
          ) : (
            <span className="text-xs text-slate-400 italic">Not recorded</span>
          );
        },
      },
      {
        id: "soldPrice",
        header: "Sold Price",
        cell: ({ row }) => (
          <div>
            <span className="font-semibold">{money(row.original.soldPrice)}</span>
            {row.original.isLossSale && (
              <Badge variant="warning" className="ml-1.5 align-middle">
                Loss
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: "soldAt",
        header: "Sold On",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(row.original.soldAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={() => setDetailPhone(p)} aria-label="View details">
                <Eye className="h-4 w-4" />
              </Button>
              <Link href={`/shop/invoice/${p._id}`} target="_blank">
                <Button variant="ghost" size="icon" aria-label="Print invoice">
                  <Printer className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 dark:text-red-400"
                onClick={() => onReportIssue(p)}
                aria-label="Report issue"
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onReportIssue]
  );

  const table = useReactTable({
    data: phones,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-slate-400 py-8">
                No sold phones in this range.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => setDetailPhone(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} onClick={(e) => cell.column.id === "actions" && e.stopPropagation()}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {phones.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())} &middot;{" "}
            {phones.length} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="secondary" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {detailPhone && (
        <Modal title={detailPhone.name} onClose={() => setDetailPhone(null)}>
          <div className="space-y-4 text-sm">
            {detailPhone.images?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {detailPhone.images.map((img) => (
                  <div key={img} className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {detailPhone.details && <p className="text-slate-600 dark:text-slate-300">{detailPhone.details}</p>}

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <span className="text-slate-500">IMEI</span>
              <span className="text-right font-medium">{detailPhone.imei}</span>
              {detailPhone.ram && (
                <>
                  <span className="text-slate-500">RAM</span>
                  <span className="text-right font-medium">{detailPhone.ram}</span>
                </>
              )}
              {detailPhone.storage && (
                <>
                  <span className="text-slate-500">Storage</span>
                  <span className="text-right font-medium">{detailPhone.storage}</span>
                </>
              )}
              <span className="text-slate-500">Sold Price</span>
              <span className="text-right font-medium">{money(detailPhone.soldPrice)}</span>
              <span className="text-slate-500">Sold On</span>
              <span className="text-right font-medium">{formatDate(detailPhone.soldAt)}</span>
              {typeof detailPhone.owner === "object" && (
                <>
                  <span className="text-slate-500">Owner</span>
                  <span className="text-right font-medium">{detailPhone.owner.name}</span>
                </>
              )}
            </div>

            {detailPhone.isLossSale && (
              <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
                Sold below buying price — recorded as a loss.
              </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Customer</p>
              {detailPhone.customer?.name ||
              detailPhone.customer?.phoneNumber ||
              detailPhone.customer?.email ||
              detailPhone.customer?.address ? (
                <div className="space-y-0.5">
                  {detailPhone.customer.name && <p>{detailPhone.customer.name}</p>}
                  {detailPhone.customer.phoneNumber && (
                    <p className="text-slate-500">{detailPhone.customer.phoneNumber}</p>
                  )}
                  {detailPhone.customer.email && <p className="text-slate-500">{detailPhone.customer.email}</p>}
                  {detailPhone.customer.address && <p className="text-slate-500">{detailPhone.customer.address}</p>}
                </div>
              ) : (
                <p className="text-slate-400 italic">No customer details recorded</p>
              )}
            </div>

            {detailPhone.issueDescription && (
              <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
                Issue: {detailPhone.issueDescription}
              </div>
            )}

            <div className="flex gap-2">
              <Link href={`/shop/invoice/${detailPhone._id}`} target="_blank" className="flex-1">
                <Button variant="secondary" className="w-full">
                  <Printer className="h-4 w-4" /> View / Print Invoice
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => {
                  onReportIssue(detailPhone);
                  setDetailPhone(null);
                }}
              >
                <AlertTriangle className="h-4 w-4" /> Report Issue
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
