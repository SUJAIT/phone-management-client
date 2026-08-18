// import { ShopPhoneView } from "@/lib/types";
// import { money, formatDate } from "@/lib/utils";

// const WARRANTY_NOTE =
//   "7 Days Replacement Warranty and 20 Days Service Warranty. Any physical damage, overcharging, electrical issues, dust, or water damage are not covered.";
// const TERMS_NOTE = "Any physical damage, overcharging, electrical issues, dust, or water damage are not covered.";

// function paymentInfoLines(phone: ShopPhoneView): string[] {
//   const c = phone.customer;
//   if (!c?.paymentMethod) return [];
//   if (c.paymentMethod === "cash") {
//     return ["Hand Cash", c.name].filter(Boolean) as string[];
//   }
//   if (c.paymentMethod === "bank") {
//     return [c.bankName].filter(Boolean) as string[];
//   }
//   if (c.paymentMethod === "bkash") {
//     return ["bKash", c.bkashNumber].filter(Boolean) as string[];
//   }
//   return [];
// }

// /** Invoice # derived from the phone's own id — stable, unique, no separate counter needed. */
// function invoiceNumber(phone: ShopPhoneView) {
//   return phone._id.slice(-8).toUpperCase();
// }

// /**
//  * The printable invoice itself. Rendered inside a dedicated /shop/invoice/[id] page (no
//  * navbar/app chrome) so the browser's own Print / Save-as-PDF handles the "download".
//  * Every customer field is optional — anything not entered is simply omitted, never shown
//  * as blank/"null" text, so the sheet can still be filled in by hand afterward.
//  */
// export default function InvoicePrint({ phone }: { phone: ShopPhoneView }) {
//   const c = phone.customer;
//   const hasCustomerInfo = !!(c?.name || c?.phoneNumber || c?.email || c?.address);
//   const details = [phone.imei && `IMEI: ${phone.imei}`, (phone.ram || phone.storage) && `${[phone.ram, phone.storage].filter(Boolean).join("/")}`]
//     .filter(Boolean)
//     .join("  \u00b7  ");
//   const payment = paymentInfoLines(phone);

//   return (
//     <div className="invoice-sheet bg-white text-slate-900 mx-auto max-w-[800px] w-full p-8 sm:p-10 rounded-xl sm:rounded-none shadow-sm sm:shadow-none">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-6 pb-6 border-b-2 border-slate-800">
//         <div className="flex items-center gap-3">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img src="/logo/jahed-telecom-transparent.png" alt="Jahed Telecom" className="h-16 w-16 object-contain" />
//           <div>
//             <h1 className="text-2xl font-extrabold tracking-tight">Jahed Telecom</h1>
//             <p className="text-xs text-slate-600 leading-relaxed">
//               Boalkhali, Fultol, Chittagong
//               <br />
//               01856208521, 01315015900
//             </p>
//           </div>
//         </div>
//         <div className="text-right shrink-0">
//           <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800">Invoice</h2>
//           <p className="text-xs text-slate-500 mt-1">#{invoiceNumber(phone)}</p>
//           <p className="text-xs text-slate-500">{formatDate(phone.soldAt)}</p>
//         </div>
//       </div>

//       {/* Bill To — only shown if at least one customer field is present */}
//       {hasCustomerInfo && (
//         <div className="pt-5 pb-1">
//           <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">To:</p>
//           <div className="text-sm space-y-0.5">
//             {c?.name && (
//               <p>
//                 <span className="text-slate-500">Name: </span>
//                 {c.name}
//               </p>
//             )}
//             {c?.phoneNumber && (
//               <p>
//                 <span className="text-slate-500">Number: </span>
//                 {c.phoneNumber}
//               </p>
//             )}
//             {c?.email && (
//               <p>
//                 <span className="text-slate-500">Gmail: </span>
//                 {c.email}
//               </p>
//             )}
//             {c?.address && (
//               <p>
//                 <span className="text-slate-500">Address: </span>
//                 {c.address}
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Items */}
//       <table className="w-full text-sm mt-6 border-collapse">
//         <thead>
//           <tr className="bg-slate-800 text-white">
//             <th className="text-left font-semibold px-3 py-2 rounded-tl-lg">Items Description</th>
//             <th className="text-right font-semibold px-3 py-2">Unit Price</th>
//             <th className="text-right font-semibold px-3 py-2">Qnt</th>
//             <th className="text-right font-semibold px-3 py-2 rounded-tr-lg">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border-b border-slate-200">
//             <td className="px-3 py-3 align-top">
//               <p className="font-semibold">{phone.name}</p>
//               {details && <p className="text-xs text-slate-500 mt-0.5">{details}</p>}
//             </td>
//             <td className="px-3 py-3 text-right align-top">{money(phone.soldPrice)}</td>
//             <td className="px-3 py-3 text-right align-top">1</td>
//             <td className="px-3 py-3 text-right align-top font-semibold">{money(phone.soldPrice)}</td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Total — no tax/VAT/discount/total-due, just the total */}
//       <div className="flex justify-end mt-3">
//         <div className="w-56 flex justify-between items-center bg-slate-800 text-white rounded-lg px-4 py-2.5">
//           <span className="text-sm font-semibold">Total</span>
//           <span className="text-base font-bold">{money(phone.soldPrice)}</span>
//         </div>
//       </div>

//       {/* Note */}
//       <div className="mt-6">
//         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Note</p>
//         <p className="text-xs text-slate-600 leading-relaxed">{WARRANTY_NOTE}</p>
//       </div>

//       {/* Footer: Happy Shopping / Signature */}
//       <div className="flex items-end justify-between mt-10 pt-6">
//         <p className="text-base font-bold text-slate-800">Happy Shopping</p>
//         <div className="text-center">
//           <div className="w-40 border-t border-slate-400 pt-1">
//             <p className="text-xs text-slate-500">Sales Sign / Shop Authority</p>
//           </div>
//         </div>
//       </div>

//       {/* Questions / Payment info / Terms */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-4 border-t border-slate-200 text-xs text-slate-600">
//         <div>
//           <p className="font-semibold text-slate-800 mb-1">Questions?</p>
//           <p>Email: mdjahed@gmail.com</p>
//           <p>WhatsApp: 01856208521</p>
//         </div>
//         <div>
//           <p className="font-semibold text-slate-800 mb-1">Payment Info</p>
//           {payment.length > 0 ? payment.map((line, i) => <p key={i}>{line}</p>) : <p>&nbsp;</p>}
//         </div>
//         <div>
//           <p className="font-semibold text-slate-800 mb-1">Terms &amp; Conditions</p>
//           <p>{TERMS_NOTE}</p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { ShopPhoneView } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";

const WARRANTY_NOTE =
  "7 Days Replacement Warranty and 20 Days Service Warranty. Any physical damage, overcharging, electrical issues, dust, or water damage are not covered.";
const TERMS_NOTE = "Any physical damage, overcharging, electrical issues, dust, or water damage are not covered.";

function paymentInfoLines(phone: ShopPhoneView): string[] {
  const c = phone.customer;
  if (!c?.paymentMethod) return [];
  if (c.paymentMethod === "cash") {
    return ["Hand Cash", c.name].filter(Boolean) as string[];
  }
  if (c.paymentMethod === "bank") {
    return [c.bankName].filter(Boolean) as string[];
  }
  if (c.paymentMethod === "bkash") {
    return ["bKash", c.bkashNumber].filter(Boolean) as string[];
  }
  return [];
}

/** Invoice # derived from the phone's own id — stable, unique, no separate counter needed. */
function invoiceNumber(phone: ShopPhoneView) {
  return phone._id.slice(-8).toUpperCase();
}

/**
 * The printable invoice itself. Rendered inside a dedicated /shop/invoice/[id] page (no
 * navbar/app chrome) so the browser's own Print / Save-as-PDF handles the "download".
 * Every customer field is optional — anything not entered is simply omitted, never shown
 * as blank/"null" text, so the sheet can still be filled in by hand afterward.
 */
export default function InvoicePrint({ phone }: { phone: ShopPhoneView }) {
  const c = phone.customer;
  const hasCustomerInfo = !!(c?.name || c?.phoneNumber || c?.email || c?.address);
  const details = [phone.imei && `IMEI: ${phone.imei}`, (phone.ram || phone.storage) && `${[phone.ram, phone.storage].filter(Boolean).join("/")}`]
    .filter(Boolean)
    .join("  \u00b7  ");
  const payment = paymentInfoLines(phone);

  return (
    <div className="invoice-sheet bg-white text-slate-900 mx-auto max-w-[800px] w-full p-8 sm:p-10 rounded-xl sm:rounded-none shadow-sm sm:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 pb-6 border-b-2 border-slate-800">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/jahed-telecom-transparent.png" alt="Jahed Telecom" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Jahed Telecom</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Boalkhali, Fultol, Chittagong
              <br />
              01856208521, 01315015900
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800">Invoice</h2>
          <p className="text-xs text-slate-500 mt-1">#{invoiceNumber(phone)}</p>
          <p className="text-xs text-slate-500">{formatDate(phone.soldAt)}</p>
        </div>
      </div>

      {/* Bill To — only shown if at least one customer field is present */}
      {hasCustomerInfo && (
        <div className="pt-5 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">To:</p>
          <div className="text-sm space-y-0.5">
            {c?.name && (
              <p>
                <span className="text-slate-500">Name: </span>
                {c.name}
              </p>
            )}
            {c?.phoneNumber && (
              <p>
                <span className="text-slate-500">Number: </span>
                {c.phoneNumber}
              </p>
            )}
            {c?.email && (
              <p>
                <span className="text-slate-500">Gmail: </span>
                {c.email}
              </p>
            )}
            {c?.address && (
              <p>
                <span className="text-slate-500">Address: </span>
                {c.address}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <table className="w-full text-sm mt-6 border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <th className="text-left font-semibold px-3 py-2 rounded-tl-lg">Items Description</th>
            <th className="text-right font-semibold px-3 py-2">Unit Price</th>
            <th className="text-right font-semibold px-3 py-2">Qnt</th>
            <th className="text-right font-semibold px-3 py-2 rounded-tr-lg">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="px-3 py-3 align-top">
              <p className="font-semibold">{phone.name}</p>
              {details && <p className="text-xs text-slate-500 mt-0.5">{details}</p>}
            </td>
            <td className="px-3 py-3 text-right align-top">{money(phone.soldPrice)}</td>
            <td className="px-3 py-3 text-right align-top">1</td>
            <td className="px-3 py-3 text-right align-top font-semibold">{money(phone.soldPrice)}</td>
          </tr>
        </tbody>
      </table>

      {/* Total — no tax/VAT/discount/total-due, just the total */}
      <div className="flex justify-end mt-3">
        <div
          className="w-56 flex justify-between items-center bg-slate-800 text-white rounded-lg px-4 py-2.5"
          style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <span className="text-sm font-semibold">Total</span>
          <span className="text-base font-bold">{money(phone.soldPrice)}</span>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Note</p>
        <p className="text-xs text-slate-600 leading-relaxed">{WARRANTY_NOTE}</p>
      </div>

      {/* Footer: Happy Shopping / Signature */}
      <div className="flex items-end justify-between mt-10 pt-6">
        <p className="text-base font-bold text-slate-800">Happy Shopping</p>
        <div className="text-center">
          <div className="w-40 border-t border-slate-400 pt-1">
            <p className="text-xs text-slate-500">Sales Sign / Shop Authority</p>
          </div>
        </div>
      </div>

      {/* Questions / Payment info / Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-4 border-t border-slate-200 text-xs text-slate-600">
        <div>
          <p className="font-semibold text-slate-800 mb-1">Questions?</p>
          <p>Email: mdjahed@gmail.com</p>
          <p>WhatsApp: 01856208521</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">Payment Info</p>
          {payment.length > 0 ? payment.map((line, i) => <p key={i}>{line}</p>) : <p>&nbsp;</p>}
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">Terms &amp; Conditions</p>
          <p>{TERMS_NOTE}</p>
        </div>
      </div>
    </div>
  );
}
