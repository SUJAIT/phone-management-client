"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import PhoneCard from "@/components/PhoneCard";
import api from "@/lib/api";
import { Phone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useLiveRefresh } from "@/lib/realtime";
import { successToast } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";
import { useAuth } from "@/lib/auth-context";

export default function AllPhonesPage() {
  const { user } = useAuth();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get("/phones/all")
      .then((res) => setPhones(res.data.phones))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useLiveRefresh(["phones"], load);

  async function toggleHide(id: string, currentlyHidden: boolean) {
    await api.patch(`/phones/${id}/hide`);
    successToast(currentlyHidden ? "Unhidden — visible to shop again" : "Hidden from shop");
    load();
  }

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">All Phone ({phones.length})</h1>

        {loading ? (
          <PageLoader />
        ) : phones.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No phones added yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {phones.map((p) => {
              // "Hide from shop" is an owner-only action on your OWN phones -- Ovi and
              // Sujait can each see the other's phones here, but must not be able to
              // toggle each other's visibility to the shop.
              const ownerId = typeof p.owner === "object" ? p.owner._id : p.owner;
              const canManage = !!user && ownerId === user.id;
              return (
                <PhoneCard key={p._id} phone={p} ownerActions onChanged={load}>
                  {canManage && (
                    <Button onClick={() => toggleHide(p._id, p.hidden)} variant="secondary" size="sm" className="w-full">
                      {p.hidden ? (
                        <>
                          <Eye className="h-4 w-4" /> Unhide (show to shop)
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" /> Hide from shop
                        </>
                      )}
                    </Button>
                  )}
                </PhoneCard>
              );
            })}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

