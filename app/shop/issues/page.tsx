"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ShopPhoneCard from "@/components/ShopPhoneCard";
import Modal from "@/components/Modal";
import api from "@/lib/api";
import { ShopPhoneView } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast, errorAlert } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";

/**
 * Shop-side view of every phone currently flagged with an issue -- both freshly reported
 * ones and ones the shop already reported earlier. "Update Issue Status" re-submits the
 * same endpoint with a new note, so the owner always sees the latest situation.
 */
export default function ShopIssuesPage() {
  const [phones, setPhones] = useState<ShopPhoneView[]>([]);
  const [loading, setLoading] = useState(true);

  const [updateTarget, setUpdateTarget] = useState<ShopPhoneView | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api
      .get("/phones/issues")
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones"], load);

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!updateTarget) return;
    setError("");
    setSaving(true);
    try {
      await api.patch(`/phones/${updateTarget._id}/issue`, { description: note });
      successToast("Issue status updated");
      setUpdateTarget(null);
      setNote("");
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not update";
      setError(msg);
      errorAlert("Could not update issue", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allow={["shop"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-1">Issue Phone ({phones.length})</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Phones with an open issue, reported by you. Update the status if anything changes.
        </p>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No open issues right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {phones.map((p) => (
              <ShopPhoneCard key={p._id} phone={p}>
                <Button
                  onClick={() => {
                    setUpdateTarget(p);
                    setNote(p.issueDescription || "");
                  }}
                  size="sm"
                  className="w-full"
                >
                  <RefreshCcw className="h-4 w-4" /> Update Issue Status
                </Button>
              </ShopPhoneCard>
            ))}
          </div>
        )}

        {updateTarget && (
          <Modal title={`Update issue: ${updateTarget.name}`} onClose={() => setUpdateTarget(null)}>
            <form onSubmit={submitUpdate} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}
              <div>
                <label className="label">Current status / update *</label>
                <textarea
                  required
                  autoFocus
                  rows={3}
                  className="input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save update"}
              </Button>
            </form>
          </Modal>
        )}
      </main>
    </ProtectedRoute>
  );
}
