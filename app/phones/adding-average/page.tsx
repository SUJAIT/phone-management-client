"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { AddingAverageBreakdown } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useLiveRefresh } from "@/lib/realtime";
import { PageLoader } from "@/components/Loader";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export default function AddingAveragePage() {
  const [data, setData] = useState<AddingAverageBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/phones/adding-average")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones"], load);

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-6">Total Mobile Adding Average</h1>

        {loading || !data ? (
          <PageLoader />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Weekly Average</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {data.weeklyAddingAverage.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">phones / week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly Average</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {data.monthlyAddingAverage.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">phones / month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Added</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.totalPhones}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {data.firstAddedAt ? `since ${formatDate(data.firstAddedAt.slice(0, 10))}` : "no phones yet"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {data.daily.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No phones added yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Phones Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.daily.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
