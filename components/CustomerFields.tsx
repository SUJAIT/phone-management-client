"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerInfo, PaymentMethod } from "@/lib/types";

const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "cash", label: "Hand Cash" },
  { key: "bank", label: "Bank" },
  { key: "bkash", label: "bKash" },
];

/**
 * Controlled form for the optional customer/buyer details captured on a sale (or edited
 * later via Invoice Edit). Every field is optional — nothing here is required to submit.
 */
export default function CustomerFields({
  value,
  onChange,
}: {
  value: CustomerInfo;
  onChange: (next: CustomerInfo) => void;
}) {
  function set<K extends keyof CustomerInfo>(key: K, v: CustomerInfo[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
      <div>
        <label className="label">Customer Name</label>
        <Input value={value.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <label className="label">Customer Phone Number</label>
        <Input
          value={value.phoneNumber || ""}
          onChange={(e) => set("phoneNumber", e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div>
        <label className="label">Customer Email Address</label>
        <Input
          type="email"
          value={value.email || ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div>
        <label className="label">Customer Address</label>
        <Input value={value.address || ""} onChange={(e) => set("address", e.target.value)} placeholder="Optional" />
      </div>

      <div>
        <label className="label">Payment Method</label>
        <div className="flex gap-1.5">
          {PAYMENT_METHODS.map((m) => (
            <Button
              key={m.key}
              type="button"
              size="sm"
              variant={value.paymentMethod === m.key ? "default" : "secondary"}
              className="flex-1"
              onClick={() => set("paymentMethod", value.paymentMethod === m.key ? undefined : m.key)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {value.paymentMethod === "bank" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Bank Name</label>
            <Input value={value.bankName || ""} onChange={(e) => set("bankName", e.target.value)} />
          </div>
          <div>
            <label className="label">Bank Number</label>
            <Input value={value.bankNumber || ""} onChange={(e) => set("bankNumber", e.target.value)} />
          </div>
        </div>
      )}

      {value.paymentMethod === "bkash" && (
        <div>
          <label className="label">bKash Number</label>
          <Input value={value.bkashNumber || ""} onChange={(e) => set("bkashNumber", e.target.value)} />
        </div>
      )}
    </div>
  );
}
