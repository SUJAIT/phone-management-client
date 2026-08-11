"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import { successToast, errorAlert } from "@/lib/alert";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";

export default function AddPhonePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Belt-and-braces against a double form submission (e.g. a fast double-tap before the
  // "Saving..." state re-renders) creating the same phone twice.
  const submittingRef = useRef(false);

  const [imeis, setImeis] = useState<string[]>([""]);

  const [form, setForm] = useState({
    name: "",
    ram: "",
    storage: "",
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
  const [images, setImages] = useState<FileList | null>(null);
  const [nidImage, setNidImage] = useState<File | null>(null);
  const [nidPreview, setNidPreview] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateImei(index: number, value: string) {
    setImeis((list) => list.map((v, i) => (i === index ? value : v)));
  }
  function addImeiField() {
    setImeis((list) => [...list, ""]);
  }
  function removeImeiField(index: number) {
    setImeis((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  }

  function onNidChange(file: File | null) {
    setNidImage(file);
    if (nidPreview) URL.revokeObjectURL(nidPreview);
    setNidPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError("");

    const cleanImeis = imeis.map((i) => i.trim()).filter(Boolean);
    if (cleanImeis.length === 0) {
      setError("At least one IMEI is required");
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      cleanImeis.forEach((imei) => fd.append("imeis", imei));
      if (images) Array.from(images).forEach((f) => fd.append("images", f));
      if (nidImage) fd.append("nidImage", nidImage);

      await api.post("/phones", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      successToast(
        cleanImeis.length > 1 ? `${cleanImeis.length} phones added` : "Phone added"
      );
      router.push("/phones/all");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Could not add phone";
      setError(msg);
      errorAlert("Could not add phone", msg);
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  }

  return (
    <ProtectedRoute allow={["owner"]}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">
        <h1 className="text-xl font-bold mb-6 ">Add New Phone</h1>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}

            <section>
              <h2 className="font-bold mb-3 text-orange-600">Phone Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Phone name *</Label>
                  <Input
                    required
                    placeholder="e.g. iPhone 11"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>RAM</Label>
                  <Input placeholder="e.g. 4GB" value={form.ram} onChange={(e) => update("ram", e.target.value)} />
                </div>
                <div>
                  <Label>Storage</Label>
                  <Input
                    placeholder="e.g. 64GB"
                    value={form.storage}
                    onChange={(e) => update("storage", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>IMEI number(s) *</Label>
                <div className="space-y-2">
                  {imeis.map((imei, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        required
                        placeholder={`IMEI ${i + 1}`}
                        value={imei}
                        onChange={(e) => updateImei(i, e.target.value)}
                      />
                      {imeis.length > 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => removeImeiField(i)}
                          aria-label="Remove IMEI"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addImeiField}>
                  <Plus className="h-4 w-4" /> Add another IMEI
                </Button>
                <p className="text-xs text-slate-400 mt-1">
                  Each IMEI you add becomes its own phone entry in stock, sharing the details below.
                </p>
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
                  <Input value={form.sellerNidNumber} onChange={(e) => update("sellerNidNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Social media link or ID name</Label>
                  <Input
                    placeholder="Facebook link, ID name, etc."
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
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onNidChange(e.target.files?.[0] || null)}
                  />
                  {nidPreview && (
                    <div className="relative mt-2 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={nidPreview} alt="NID preview" className="h-28 rounded-lg border border-slate-200 dark:border-slate-700" />
                      <button
                        type="button"
                        onClick={() => onNidChange(null)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                        aria-label="Remove NID photo"
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
                  <Label>Transport cost (car fare, etc.)</Label>
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
                  <p className="text-xs text-slate-400 mt-1">A single value or a range — whatever you'd tell the shop.</p>
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
                placeholder="Model, condition, any damage description..."
              />
            </section>

            <section>
              <Label>Phone photos (multiple allowed)</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} />
            </section>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Add Phone"}
            </Button>
          </form>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
