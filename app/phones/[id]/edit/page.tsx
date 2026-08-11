"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { Phone } from "@/lib/types";
import { successToast, errorAlert } from "@/lib/alert";
import { PageLoader } from "@/components/Loader";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPhonePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    ram: "",
    storage: "",
    imei: "",
    sellerName: "",
    sellerPhoneNumber: "",
    sellerNidNumber: "",
    sellerSocialMediaLink: "",
    sellerNote: "",
    buyingPrice: "",
    transportCost: "",
    serviceCost: "",
    personalProfit: "",
    details: "",
    sellExpectation: "",
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<FileList | null>(null);

  const [existingNid, setExistingNid] = useState<string | null>(null);
  const [nidImage, setNidImage] = useState<File | null>(null);
  const [nidPreview, setNidPreview] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/phones/${params.id}`)
      .then((res) => {
        const p: Phone = res.data.phone;
        setForm({
          name: p.name || "",
          ram: p.ram || "",
          storage: p.storage || "",
          imei: p.imei || "",
          sellerName: p.seller?.name || "",
          sellerPhoneNumber: p.seller?.phoneNumber || "",
          sellerNidNumber: p.seller?.nidNumber || "",
          sellerSocialMediaLink: p.seller?.socialMediaLink || "",
          sellerNote: p.seller?.note || "",
          buyingPrice: String(p.buyingPrice ?? ""),
          transportCost: String(p.transportCost ?? ""),
          serviceCost: String(p.serviceCost ?? ""),
          personalProfit: String(p.personalProfit ?? ""),
          details: p.details || "",
          sellExpectation: p.sellExpectation || "",
        });
        setExistingImages(p.images || []);
        setExistingNid(p.seller?.nidImageUrl || null);
      })
      .catch((err) => errorAlert("Could not load phone", err?.response?.data?.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function removeExistingImage(url: string) {
    setExistingImages((imgs) => imgs.filter((i) => i !== url));
  }

  function onNidChange(file: File | null) {
    setNidImage(file);
    if (nidPreview) URL.revokeObjectURL(nidPreview);
    setNidPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("existingImages", JSON.stringify(existingImages));
      if (newImages) Array.from(newImages).forEach((f) => fd.append("images", f));
      if (nidImage) fd.append("nidImage", nidImage);

      await api.patch(`/phones/${params.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      successToast("Phone updated");
      router.back();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not update phone";
      setError(msg);
      errorAlert("Could not update phone", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-xl font-bold mb-6">Edit Phone</h1>

        {loading ? (
          <PageLoader />
        ) : (
          <Card className="p-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}

              <section>
                <h2 className="font-bold mb-3 text-orange-600">Phone Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Phone name *</Label>
                    <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
                  </div>
                  <div>
                    <Label>RAM</Label>
                    <Input value={form.ram} onChange={(e) => update("ram", e.target.value)} />
                  </div>
                  <div>
                    <Label>Storage</Label>
                    <Input value={form.storage} onChange={(e) => update("storage", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label>IMEI number *</Label>
                    <Input required value={form.imei} onChange={(e) => update("imei", e.target.value)} />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-bold mb-3 text-blue-400">Seller Info (optional)</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.sellerName} onChange={(e) => update("sellerName", e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <Input
                      value={form.sellerPhoneNumber}
                      onChange={(e) => update("sellerPhoneNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>NID number</Label>
                    <Input
                      value={form.sellerNidNumber}
                      onChange={(e) => update("sellerNidNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Social media link or ID name</Label>
                    <Input
                      value={form.sellerSocialMediaLink}
                      onChange={(e) => update("sellerSocialMediaLink", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Note</Label>
                    <Input value={form.sellerNote} onChange={(e) => update("sellerNote", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label>NID photo</Label>
                    {existingNid && !nidPreview && (
                      <div className="relative mt-2 inline-block mr-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={existingNid}
                          alt="Current NID"
                          className="h-28 rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => onNidChange(e.target.files?.[0] || null)} />
                    {nidPreview && (
                      <div className="relative mt-2 inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={nidPreview}
                          alt="New NID preview"
                          className="h-28 rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => onNidChange(null)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-bold mb-3 text-green-500">Phone Costing Management</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Buying price (Taka) *</Label>
                    <Input
                      type="number"
                      required
                      min={0}
                      value={form.buyingPrice}
                      onChange={(e) => update("buyingPrice", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Transport cost</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.transportCost}
                      onChange={(e) => update("transportCost", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Service / repair cost</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.serviceCost}
                      onChange={(e) => update("serviceCost", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Personal profit</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.personalProfit}
                      onChange={(e) => update("personalProfit", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Sale expectation *</Label>
                    <Input
                      required
                      placeholder="e.g. 10000-12000 or 10000/12000"
                      value={form.sellExpectation}
                      onChange={(e) => update("sellExpectation", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <Label>Phone details (optional)</Label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.details}
                  onChange={(e) => update("details", e.target.value)}
                />
              </section>

              <section>
                <Label>Phone photos</Label>
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {existingImages.map((img) => (
                      <div key={img} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="h-20 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Label className="text-xs text-slate-400 mb-1">Add more photos</Label>
                <Input type="file" accept="image/*" multiple onChange={(e) => setNewImages(e.target.files)} />
              </section>

              <div className="flex gap-2">
                <Link href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
