"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "cards" | "table";

export default function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 gap-0.5">
      <Button
        variant={mode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("table")}
        aria-label="Table view"
      >
        <Table2 className="h-4 w-4" /> Table
      </Button>
      <Button
        variant={mode === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("cards")}
        aria-label="Card view"
      >
        <LayoutGrid className="h-4 w-4" /> Cards
      </Button>
    </div>
  );
}
