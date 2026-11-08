"use client";

import Link from "next/link";
import { Smartphone, MessageCircle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { STORE_NAME, chatLink } from "@/lib/store";

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/store" className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-500">
          <Smartphone className="h-5 w-5" />
          {STORE_NAME}
        </Link>
        <div className="flex items-center gap-1">
          <a
            href={chatLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 px-3 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
