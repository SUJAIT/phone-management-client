// Public storefront settings + helpers. Change the name / WhatsApp number here.
export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Jahed Telecom";

// WhatsApp wants the full international number, no "+" and no leading 0.
// 01856208521 (Bangladesh)  ->  8801856208521
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801856208521";
export const WHATSAPP_DISPLAY = "01856208521";

export interface PublicPhone {
  _id: string;
  name: string;
  imeiLast4: string; // last 4 digits of IMEI only
  ram: string;
  storage: string; // ROM
  details: string;
  price: string; // sale expectation (free text, e.g. "10000-12000")
  images: string[];
  createdAt: string;
}

/** "10000" -> "৳10,000", "10000-12000" -> "৳10,000-৳12,000". Non-numeric text is shown as-is. */
export function formatPrice(raw?: string) {
  const t = (raw || "").trim();
  if (!t) return "Call for price";
  if (!/\d/.test(t)) return t;
  return t.replace(/\d+/g, (n) => `\u09F3${Number(n).toLocaleString("en-US")}`);
}

export function bookingLink(p: PublicPhone, pageUrl?: string) {
  const specs = [p.ram && `RAM: ${p.ram}`, p.storage && `ROM: ${p.storage}`].filter(Boolean).join(" | ");
  const parts = [
    `Hello ${STORE_NAME}, I want to book this phone:`,
    "",
    `Phone: ${p.name}`,
    p.imeiLast4 ? `IMEI (last 4): ${p.imeiLast4}` : "",
    specs,
    `Price: ${formatPrice(p.price)}`,
    pageUrl ? `Link: ${pageUrl}` : "",
  ];
  const text = parts.filter((l, i) => l !== "" || i === 1).join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const STORE_NOTICE =
  "Notice: If you like any phone, please book on WhatsApp or send a WhatsApp message for more details.";

export function chatLink(text = `Hello ${STORE_NAME}, I have a question.`) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
