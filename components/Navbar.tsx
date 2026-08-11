"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Smartphone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-brand-600 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const links =
    user.role === "owner" ? (
      <>
        {/* <NavLink href="/dashboard" onClick={() => setOpen(false)}>
          Dashboard
        </NavLink> */}
        <NavLink href="/phones/add" onClick={() => setOpen(false)}>
          Add Phone
        </NavLink>
        <NavLink href="/phones" onClick={() => setOpen(false)}>
          Total Phone
        </NavLink>
        <NavLink href="/phones/all" onClick={() => setOpen(false)}>
          All Phone
        </NavLink>
        <NavLink href="/phones/sold" onClick={() => setOpen(false)}>
          Sold
        </NavLink>
        <NavLink href="/phones/issues" onClick={() => setOpen(false)}>
          Issue
        </NavLink>
        <NavLink href="/long-time-unsold" onClick={() => setOpen(false)}>
          Long Time Unsold
        </NavLink>
        <NavLink href="/losses" onClick={() => setOpen(false)}>
          Total Loss
        </NavLink>
        <NavLink href="/investments" onClick={() => setOpen(false)}>
          Investment
        </NavLink>
        <NavLink href="/expenses" onClick={() => setOpen(false)}>
          My Expenses
        </NavLink>
        <NavLink href="/payments" onClick={() => setOpen(false)}>
          Payment History
        </NavLink>
      </>
    ) : (
      <>
        <NavLink href="/shop" onClick={() => setOpen(false)}>
          Unsold Phones
        </NavLink>
        <NavLink href="/shop/sold" onClick={() => setOpen(false)}>
          Sold Phones
        </NavLink>
        <NavLink href="/shop/issues" onClick={() => setOpen(false)}>
          Issues
        </NavLink>
        <NavLink href="/long-time-unsold" onClick={() => setOpen(false)}>
          Long Time Unsold
        </NavLink>
        <NavLink href="/shop/dashboard" onClick={() => setOpen(false)}>
          Dashboard
        </NavLink>
        <NavLink href="/shop/payments" onClick={() => setOpen(false)}>
          Payment History
        </NavLink>
      </>
    );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 dark:bg-slate-900 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-brand-700 dark:text-brand-500 flex items-center gap-1.5 shrink-0">
          <Smartphone className="h-5 w-5" />
          <span className="hidden sm:inline">Phone Business</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex flex-wrap gap-1">{links}</div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">{user.name}</span>
          <Button onClick={logout} variant="secondary" size="sm" className="hidden md:inline-flex">
            Logout
          </Button>
          <Button
            onClick={() => setOpen((o) => !o)}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {links}
          <button
            onClick={logout}
            className="mt-2 text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            Logout ({user.name})
          </button>
        </div>
      )}
    </nav>
  );
}
