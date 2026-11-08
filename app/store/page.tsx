"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MessageCircle, ImageOff } from "lucide-react";
import api from "@/lib/api";
import StoreHeader from "@/components/StoreHeader";
import { PublicPhone, bookingLink, formatPrice, STORE_NAME, STORE_NOTICE, WHATSAPP_DISPLAY } from "@/lib/store";

function ProductCard({ p }: { p: PublicPhone }) {
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/store/${p._id}` : undefined;
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <Link href={`/store/${p._id}`} className="block">
        <div className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
          {p.images[0] ? (
            <img
              src={p.images[0]}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ImageOff className="h-8 w-8 text-slate-400" />
          )}
        </div>
      </Link>
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <Link href={`/store/${p._id}`} className="font-semibold leading-snug line-clamp-2 hover:underline">
          {p.name}
        </Link>
        {(p.ram || p.storage) && (
          <div className="flex flex-wrap gap-1.5">
            {p.ram && <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">RAM {p.ram}</span>}
            {p.storage && <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">ROM {p.storage}</span>}
          </div>
        )}
        {p.imeiLast4 && <p className="text-xs text-slate-500 dark:text-slate-400">IMEI last 4: <span className="font-semibold text-slate-700 dark:text-slate-200">{p.imeiLast4}</span></p>}
        <p className="text-lg font-bold text-brand-600 dark:text-brand-500 mt-auto">{formatPrice(p.price)}</p>
        <a
          href={bookingLink(p, pageUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Book Now
        </a>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [phones, setPhones] = useState<PublicPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // debounce search
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get("/public/phones", { params: q.trim() ? { q: q.trim() } : {} })
        .then((r) => {
          setPhones(r.data.phones);
          setError("");
        })
        .catch(() => setError("Could not load products. Please try again."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="min-h-screen">
      <StoreHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading..." : `${phones.length} phone${phones.length === 1 ? "" : "s"} available`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phone..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-sm p-3 flex items-start gap-2">
          <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{STORE_NOTICE}</span>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl p-3 mb-4">{error}</div>}

        {loading && phones.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : phones.length === 0 && !error ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            {q ? "No phone matched your search." : "No phones available right now. Please check back soon."}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {phones.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {STORE_NAME} &middot; WhatsApp {WHATSAPP_DISPLAY}
      </footer>
    </div>
  );
}
