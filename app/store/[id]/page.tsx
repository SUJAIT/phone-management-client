"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageCircle, ImageOff } from "lucide-react";
import api from "@/lib/api";
import StoreHeader from "@/components/StoreHeader";
import { PublicPhone, bookingLink, formatPrice, STORE_NOTICE, chatLink } from "@/lib/store";

export default function StoreProductPage() {
  const { id } = useParams<{ id: string }>();
  const [phone, setPhone] = useState<PublicPhone | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api
      .get(`/public/phones/${id}`)
      .then((r) => setPhone(r.data.phone))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;

  return (
    <div className="min-h-screen">
      <StoreHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Link href="/store" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4">
          <ArrowLeft className="h-4 w-4" /> All Products
        </Link>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 animate-pulse">
            <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ) : notFound || !phone ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 mb-4">This phone is no longer available.</p>
            <Link href="/store" className="text-brand-600 dark:text-brand-500 underline">See all products</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                {phone.images[active] ? (
                  <img src={phone.images[active]} alt={phone.name} className="w-full h-full object-contain" />
                ) : (
                  <ImageOff className="h-10 w-10 text-slate-400" />
                )}
              </div>
              {phone.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {phone.images.map((img, i) => (
                    <button
                      key={img + i}
                      onClick={() => setActive(i)}
                      className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 ${
                        i === active ? "border-brand-600" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold leading-tight">{phone.name}</h1>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-500">{formatPrice(phone.price)}</p>

              {(phone.ram || phone.storage || phone.imeiLast4) && (
                <div className="grid grid-cols-2 gap-3">
                  {phone.imeiLast4 && (
                    <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 col-span-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">IMEI (last 4 digits)</p>
                      <p className="font-semibold tracking-widest">•••• •••• •••• {phone.imeiLast4}</p>
                    </div>
                  )}
                  {phone.ram && (
                    <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">RAM</p>
                      <p className="font-semibold">{phone.ram}</p>
                    </div>
                  )}
                  {phone.storage && (
                    <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">ROM / Storage</p>
                      <p className="font-semibold">{phone.storage}</p>
                    </div>
                  )}
                </div>
              )}

              {phone.details && (
                <div>
                  <h2 className="font-semibold mb-1">Details</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{phone.details}</p>
                </div>
              )}

              <a
                href={bookingLink(phone, pageUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                <MessageCircle className="h-5 w-5" /> Book on WhatsApp
              </a>
              <a
                href={chatLink(`Hello, I want more details about: ${phone.name}${pageUrl ? "\n" + pageUrl : ""}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp message for more details
              </a>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-sm p-3">
                {STORE_NOTICE}
              </div>
              <p className="text-xs text-slate-400 text-center">You will be taken to WhatsApp with this phone's details ready to send.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
