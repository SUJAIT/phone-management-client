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
import { Phone } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import PhoneDetailContent from "@/components/PhoneDetailContent";
import api from "@/lib/api";
import { successToast, errorAlert, confirmAction } from "@/lib/alert";
import { Smartphone, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const statusVariant: Record<Phone["status"], "success" | "info" | "destructive" | "warning"> = {
  available: "success",
  sold: "info",
  issue: "destructive",
  loss: "warning",
};

interface PhoneDataTableProps {
  phones: Phone[];
  /** Extra column(s) specific to this section — e.g. Service Cost, Sold Price. */
  extraColumns?: ColumnDef<Phone>[];
  /** Show Edit/Delete alongside View (used on Total Phone). Off by default. */
  ownerActions?: boolean;
  onChanged?: () => void;
  pageSize?: number;
  /** Extra action button rendered before View/Edit/Delete (e.g. "Handle Issue"). */
  renderExtraAction?: (phone: Phone) => React.ReactNode;
}

export default function PhoneDataTable({
  phones,
  extraColumns = [],
  ownerActions = false,
  onChanged,
  pageSize = 10,
  renderExtraAction,
}: PhoneDataTableProps) {
  const [detailPhone, setDetailPhone] = useState<Phone | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  async function handleDelete(phone: Phone) {
    const ok = await confirmAction({
      title: `Delete ${phone.name}?`,
      text: "This can't be undone. If it was unsold, its cost stops counting against your investment right away.",
      confirmText: "Yes, delete it",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(phone._id);
    try {
      await api.delete(`/phones/${phone._id}`);
      successToast("Phone deleted");
      onChanged?.();
    } catch (err: any) {
      errorAlert("Could not delete phone", err?.response?.data?.message);
    } finally {
      setDeletingId(null);
    }
  }

  const columns = useMemo<ColumnDef<Phone>[]>(() => {
    const base: ColumnDef<Phone>[] = [
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
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status]} className="capitalize">
            {row.original.status}
          </Badge>
        ),
      },
    ];

    const date: ColumnDef<Phone> = {
      id: "date",
      header: "Added",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(row.original.createdAt)}</span>
      ),
    };

    const actions: ColumnDef<Phone> = {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {renderExtraAction?.(p)}
            <Button variant="ghost" size="icon" onClick={() => setDetailPhone(p)} aria-label="View details">
              <Eye className="h-4 w-4" />
            </Button>
            {ownerActions && (!!user && (typeof p.owner === "object" ? p.owner._id : p.owner) === user.id) && (
              <>
                <Link href={`/phones/${p._id}/edit`}>
                  <Button variant="ghost" size="icon" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 dark:text-red-400"
                  disabled={deletingId === p._id}
                  onClick={() => handleDelete(p)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    };

    return [...base, ...extraColumns, date, actions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraColumns, ownerActions, deletingId, renderExtraAction, user]);

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
                No phones found.
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
          <PhoneDetailContent phone={detailPhone} />
        </Modal>
      )}
    </div>
  );
}
