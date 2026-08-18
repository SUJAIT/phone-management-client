// // "use client";

// // import { useState } from "react";
// // import { ShopPhoneView } from "@/lib/types";
// // import { money, formatDate } from "@/lib/utils";
// // import { Card } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import Modal from "@/components/Modal";
// // import ImageLightbox from "@/components/ImageLightbox";
// // import { Smartphone } from "lucide-react";

// // const statusVariant: Record<ShopPhoneView["status"], "success" | "info" | "destructive" | "warning"> = {
// //   available: "success",
// //   sold: "info",
// //   issue: "destructive",
// //   loss: "warning",
// // };

// // // Green if the low end of the sale expectation clears the buying price (there's margin
// // // to work with), red if it's tight or unparseable — a quick "can I make money on this?" cue.
// // function buyingPriceTone(handoverPrice: number, sellExpectation: string) {
// //   const firstNumber = parseInt(sellExpectation.replace(/[^0-9]/g, ""), 10);
// //   if (!firstNumber || firstNumber <= handoverPrice) return "text-red-600 dark:text-red-400";
// //   return "text-emerald-600 dark:text-emerald-400";
// // }

// // /**
// //  * E-commerce style card for the shop role. Deliberately shows only what the shop is
// //  * allowed to see: name, IMEI, "Buying Price" (= the handover price it paid), sell
// //  * expectation, and status — never the reseller's internal cost breakdown.
// //  */
// // export default function ShopPhoneCard({
// //   phone,
// //   children,
// // }: {
// //   phone: ShopPhoneView;
// //   children?: React.ReactNode;
// // }) {
// //   const [detailOpen, setDetailOpen] = useState(false);
// //   const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
// //   const specs = [phone.ram && `${phone.ram} RAM`, phone.storage && `${phone.storage} Storage`]
// //     .filter(Boolean)
// //     .join(" \u00b7 ");

// //   return (
// //     <>
// //       <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
// //         {/* Phone name at the very top of the card */}
// //         <button onClick={() => setDetailOpen(true)} className="px-4 pt-3 pb-2 text-left">
// //           <h3 className="font-semibold leading-snug line-clamp-1">{phone.name}</h3>
// //           {specs && <p className="text-xs text-slate-500 dark:text-slate-400">{specs}</p>}
// //         </button>

// //         <button
// //           onClick={() => setDetailOpen(true)}
// //           className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden text-left"
// //         >
// //           {phone.images?.[0] ? (
// //             // eslint-disable-next-line @next/next/no-img-element
// //             <img src={phone.images[0]} alt={phone.name} className="w-full h-full object-cover" />
// //           ) : (
// //             <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
// //               <Smartphone className="h-14 w-14" />
// //             </div>
// //           )}
// //           <div className="absolute top-2 left-2">
// //             <Badge variant={statusVariant[phone.status]} className="capitalize">
// //               {phone.status}
// //             </Badge>
// //           </div>
// //         </button>

// //         <div className="p-4 flex-1 flex flex-col gap-2">
// //           <button onClick={() => setDetailOpen(true)} className="text-left">
// //             <p className="text-xs text-slate-500 dark:text-slate-400">IMEI: {phone.imei}</p>
// //           </button>

// //           <div className="mt-1 space-y-0.5">
// //             <p className={`text-lg font-bold ${buyingPriceTone(phone.handoverPrice, phone.sellExpectation)}`}>
// //               {money(phone.handoverPrice)}
// //               <span className="text-xs font-normal text-slate-400 ml-1">buying price</span>
// //             </p>
// //             {phone.status === "sold" ? (
// //               <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
// //                 Sold {money(phone.soldPrice)}
// //                 {phone.isLossSale && (
// //                   <span className="ml-1.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-full px-1.5 py-0.5 align-middle">
// //                     Loss
// //                   </span>
// //                 )}
// //               </p>
// //             ) : (
// //               <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
// //                 {phone.sellExpectation}
// //                 <span className="text-xs font-normal text-slate-400 ml-1">expected</span>
// //               </p>
// //             )}
// //           </div>

// //           {children && <div className="mt-auto pt-2">{children}</div>}
// //         </div>
// //       </Card>

// //       {detailOpen && (
// //         <Modal title={phone.name} onClose={() => setDetailOpen(false)}>
// //           <div className="space-y-4 text-sm">
// //             {phone.images?.length > 0 && (
// //               <div className="flex gap-2 overflow-x-auto pb-1">
// //                 {phone.images.map((img, i) => (
// //                   <button
// //                     key={img}
// //                     onClick={() => setLightboxIndex(i)}
// //                     className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
// //                   >
// //                     {/* eslint-disable-next-line @next/next/no-img-element */}
// //                     <img src={img} alt="" className="w-full h-full object-cover" />
// //                   </button>
// //                 ))}
// //               </div>
// //             )}

// //             {phone.details && <p className="text-slate-600 dark:text-slate-300">{phone.details}</p>}

// //             <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
// //               <span className="text-slate-500">IMEI</span>
// //               <span className="text-right font-medium">{phone.imei}</span>
// //               {phone.ram && (
// //                 <>
// //                   <span className="text-slate-500">RAM</span>
// //                   <span className="text-right font-medium">{phone.ram}</span>
// //                 </>
// //               )}
// //               {phone.storage && (
// //                 <>
// //                   <span className="text-slate-500">Storage</span>
// //                   <span className="text-right font-medium">{phone.storage}</span>
// //                 </>
// //               )}
// //               <span className="text-slate-500">Status</span>
// //               <span className="text-right font-medium capitalize">{phone.status}</span>
// //               <span className="text-slate-500">Buying Price</span>
// //               <span className="text-right font-medium">{money(phone.handoverPrice)}</span>
// //               <span className="text-slate-500">Sale Expectation</span>
// //               <span className="text-right font-medium">{phone.sellExpectation}</span>
// //               {typeof phone.owner === "object" && (
// //                 <>
// //                   <span className="text-slate-500">Owner</span>
// //                   <span className="text-right font-medium">{phone.owner.name}</span>
// //                 </>
// //               )}
// //             </div>

// //             {phone.status === "sold" && (
// //               <div className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl p-3 flex justify-between">
// //                 <span>Sold for {money(phone.soldPrice)}</span>
// //                 <span>on {formatDate(phone.soldAt)}</span>
// //               </div>
// //             )}

// //             {phone.status === "sold" && phone.isLossSale && (
// //               <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
// //                 Sold below buying price — recorded as a loss.
// //               </div>
// //             )}

// //             {phone.status === "issue" && phone.issueDescription && (
// //               <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
// //                 Issue: {phone.issueDescription}
// //               </div>
// //             )}
// //           </div>
// //         </Modal>
// //       )}

// //       {lightboxIndex !== null && (
// //         <ImageLightbox images={phone.images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
// //       )}
// //     </>
// //   );
// // }



// "use client";

// import { useState } from "react";
// import { ShopPhoneView } from "@/lib/types";
// import { money, formatDate } from "@/lib/utils";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Modal from "@/components/Modal";
// import ImageLightbox from "@/components/ImageLightbox";
// import { Smartphone } from "lucide-react";

// const statusVariant: Record<ShopPhoneView["status"], "success" | "info" | "destructive" | "warning"> = {
//   available: "success",
//   sold: "info",
//   issue: "destructive",
//   loss: "warning",
// };

// // Green if the low end of the sale expectation clears the buying price (there's margin
// // to work with), red if it's tight or unparseable — a quick "can I make money on this?" cue.
// function buyingPriceTone(handoverPrice: number, sellExpectation: string) {
//   const firstNumber = parseInt(sellExpectation.replace(/[^0-9]/g, ""), 10);
//   if (!firstNumber || firstNumber <= handoverPrice) return "text-red-600 dark:text-red-400";
//   return "text-emerald-600 dark:text-emerald-400";
// }

// /**
//  * E-commerce style card for the shop role. Deliberately shows only what the shop is
//  * allowed to see: name, IMEI, "Buying Price" (= the handover price it paid), sell
//  * expectation, and status — never the reseller's internal cost breakdown.
//  */
// export default function ShopPhoneCard({
//   phone,
//   children,
// }: {
//   phone: ShopPhoneView;
//   children?: React.ReactNode;
// }) {
//   const [detailOpen, setDetailOpen] = useState(false);
//   const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
//   const specs = [phone.ram && `${phone.ram} RAM`, phone.storage && `${phone.storage} Storage`]
//     .filter(Boolean)
//     .join(" \u00b7 ");

//   return (
//     <>
//       <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
//         {/* Phone name at the very top of the card */}
//         <button onClick={() => setDetailOpen(true)} className="px-2.5 pt-2.5 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2 text-left">
//           <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-1">{phone.name}</h3>
//           {specs && <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{specs}</p>}
//         </button>

//         <button
//           onClick={() => setDetailOpen(true)}
//           className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden text-left"
//         >
//           {phone.images?.[0] ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={phone.images[0]} alt={phone.name} className="w-full h-full object-cover" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
//               <Smartphone className="h-14 w-14" />
//             </div>
//           )}
//           <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
//             <Badge
//               variant={statusVariant[phone.status]}
//               className="capitalize text-[10px] px-1.5 py-0 sm:text-xs sm:px-2 sm:py-0.5"
//             >
//               {phone.status}
//             </Badge>
//           </div>
//         </button>

//         <div className="p-2.5 sm:p-4 flex-1 flex flex-col gap-1.5 sm:gap-2">
//           <button onClick={() => setDetailOpen(true)} className="text-left">
//             <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">IMEI: {phone.imei}</p>
//           </button>

//           <div className="mt-0.5 sm:mt-1 space-y-0.5">
//             <p
//               className={`text-sm sm:text-lg font-bold ${buyingPriceTone(phone.handoverPrice, phone.sellExpectation)}`}
//             >
//               {money(phone.handoverPrice)}
//               <span className="text-[9px] sm:text-xs font-normal text-slate-400 ml-1">buying price</span>
//             </p>
//             {phone.status === "sold" ? (
//               <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
//                 Sold {money(phone.soldPrice)}
//                 {phone.isLossSale && (
//                   <span className="ml-1.5 inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-full px-1.5 py-0.5 align-middle">
//                     Loss
//                   </span>
//                 )}
//               </p>
//             ) : (
//               <p className="text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-400">
//                 {phone.sellExpectation}
//                 <span className="text-[9px] sm:text-xs font-normal text-slate-400 ml-1">expected</span>
//               </p>
//             )}
//           </div>

//           {children && <div className="mt-auto pt-1.5 sm:pt-2">{children}</div>}
//         </div>
//       </Card>

//       {detailOpen && (
//         <Modal title={phone.name} onClose={() => setDetailOpen(false)}>
//           <div className="space-y-4 text-sm">
//             {phone.images?.length > 0 && (
//               <div className="flex gap-2 overflow-x-auto pb-1">
//                 {phone.images.map((img, i) => (
//                   <button
//                     key={img}
//                     onClick={() => setLightboxIndex(i)}
//                     className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
//                   >
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img src={img} alt="" className="w-full h-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}

//             {phone.details && <p className="text-slate-600 dark:text-slate-300">{phone.details}</p>}

//             <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
//               <span className="text-slate-500">IMEI</span>
//               <span className="text-right font-medium">{phone.imei}</span>
//               {phone.ram && (
//                 <>
//                   <span className="text-slate-500">RAM</span>
//                   <span className="text-right font-medium">{phone.ram}</span>
//                 </>
//               )}
//               {phone.storage && (
//                 <>
//                   <span className="text-slate-500">Storage</span>
//                   <span className="text-right font-medium">{phone.storage}</span>
//                 </>
//               )}
//               <span className="text-slate-500">Status</span>
//               <span className="text-right font-medium capitalize">{phone.status}</span>
//               <span className="text-slate-500">Buying Price</span>
//               <span className="text-right font-medium">{money(phone.handoverPrice)}</span>
//               <span className="text-slate-500">Sale Expectation</span>
//               <span className="text-right font-medium">{phone.sellExpectation}</span>
//               {typeof phone.owner === "object" && (
//                 <>
//                   <span className="text-slate-500">Owner</span>
//                   <span className="text-right font-medium">{phone.owner.name}</span>
//                 </>
//               )}
//             </div>

//             {phone.status === "sold" && (
//               <div className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl p-3 flex justify-between">
//                 <span>Sold for {money(phone.soldPrice)}</span>
//                 <span>on {formatDate(phone.soldAt)}</span>
//               </div>
//             )}

//             {phone.status === "sold" && phone.isLossSale && (
//               <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
//                 Sold below buying price — recorded as a loss.
//               </div>
//             )}

//             {phone.status === "issue" && phone.issueDescription && (
//               <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
//                 Issue: {phone.issueDescription}
//               </div>
//             )}
//           </div>
//         </Modal>
//       )}

//       {lightboxIndex !== null && (
//         <ImageLightbox images={phone.images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
//       )}
//     </>
//   );
// }

// new update 8/18/26

"use client";

import { useState } from "react";
import Link from "next/link";
import { ShopPhoneView } from "@/lib/types";
import { money, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import ImageLightbox from "@/components/ImageLightbox";
import { Smartphone, Printer } from "lucide-react";

const statusVariant: Record<ShopPhoneView["status"], "success" | "info" | "destructive" | "warning"> = {
  available: "success",
  sold: "info",
  issue: "destructive",
  loss: "warning",
};

// Green if the low end of the sale expectation clears the buying price (there's margin
// to work with), red if it's tight or unparseable — a quick "can I make money on this?" cue.
function buyingPriceTone(handoverPrice: number, sellExpectation: string) {
  const firstNumber = parseInt(sellExpectation.replace(/[^0-9]/g, ""), 10);
  if (!firstNumber || firstNumber <= handoverPrice) return "text-red-600 dark:text-red-400";
  return "text-emerald-600 dark:text-emerald-400";
}

/**
 * E-commerce style card for the shop role. Deliberately shows only what the shop is
 * allowed to see: name, IMEI, "Buying Price" (= the handover price it paid), sell
 * expectation, and status — never the reseller's internal cost breakdown.
 */
export default function ShopPhoneCard({
  phone,
  children,
}: {
  phone: ShopPhoneView;
  children?: React.ReactNode;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const specs = [phone.ram && `${phone.ram} RAM`, phone.storage && `${phone.storage} Storage`]
    .filter(Boolean)
    .join(" \u00b7 ");

  return (
    <>
      <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        {/* Phone name at the very top of the card */}
        <button onClick={() => setDetailOpen(true)} className="px-2.5 pt-2.5 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2 text-left">
          <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-1">{phone.name}</h3>
          {specs && <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{specs}</p>}
        </button>

        <button
          onClick={() => setDetailOpen(true)}
          className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden text-left"
        >
          {phone.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={phone.images[0]} alt={phone.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
              <Smartphone className="h-14 w-14" />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <Badge
              variant={statusVariant[phone.status]}
              className="capitalize text-[10px] px-1.5 py-0 sm:text-xs sm:px-2 sm:py-0.5"
            >
              {phone.status}
            </Badge>
          </div>
        </button>

        <div className="p-2.5 sm:p-4 flex-1 flex flex-col gap-1.5 sm:gap-2">
          <button onClick={() => setDetailOpen(true)} className="text-left">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">IMEI: {phone.imei}</p>
          </button>

          <div className="mt-0.5 sm:mt-1 space-y-0.5">
            <p
              className={`text-sm sm:text-lg font-bold ${buyingPriceTone(phone.handoverPrice, phone.sellExpectation)}`}
            >
              {money(phone.handoverPrice)}
              <span className="text-[9px] sm:text-xs font-normal text-slate-400 ml-1">buying price</span>
            </p>
            {phone.status === "sold" ? (
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                Sold {money(phone.soldPrice)}
                {phone.isLossSale && (
                  <span className="ml-1.5 inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-full px-1.5 py-0.5 align-middle">
                    Loss
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-400">
                {phone.sellExpectation}
                <span className="text-[9px] sm:text-xs font-normal text-slate-400 ml-1">expected</span>
              </p>
            )}
          </div>

          {children && <div className="mt-auto pt-1.5 sm:pt-2">{children}</div>}
        </div>
      </Card>

      {detailOpen && (
        <Modal title={phone.name} onClose={() => setDetailOpen(false)}>
          <div className="space-y-4 text-sm">
            {phone.images?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {phone.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setLightboxIndex(i)}
                    className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {phone.details && <p className="text-slate-600 dark:text-slate-300">{phone.details}</p>}

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <span className="text-slate-500">IMEI</span>
              <span className="text-right font-medium">{phone.imei}</span>
              {phone.ram && (
                <>
                  <span className="text-slate-500">RAM</span>
                  <span className="text-right font-medium">{phone.ram}</span>
                </>
              )}
              {phone.storage && (
                <>
                  <span className="text-slate-500">Storage</span>
                  <span className="text-right font-medium">{phone.storage}</span>
                </>
              )}
              <span className="text-slate-500">Status</span>
              <span className="text-right font-medium capitalize">{phone.status}</span>
              <span className="text-slate-500">Buying Price</span>
              <span className="text-right font-medium">{money(phone.handoverPrice)}</span>
              <span className="text-slate-500">Sale Expectation</span>
              <span className="text-right font-medium">{phone.sellExpectation}</span>
              {typeof phone.owner === "object" && (
                <>
                  <span className="text-slate-500">Owner</span>
                  <span className="text-right font-medium">{phone.owner.name}</span>
                </>
              )}
            </div>

            {phone.status === "sold" && (
              <div className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl p-3 flex justify-between">
                <span>Sold for {money(phone.soldPrice)}</span>
                <span>on {formatDate(phone.soldAt)}</span>
              </div>
            )}

            {phone.status === "sold" && phone.isLossSale && (
              <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
                Sold below buying price — recorded as a loss.
              </div>
            )}

            {phone.status === "sold" && phone.customer?.name && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customer: <span className="font-medium text-slate-700 dark:text-slate-200">{phone.customer.name}</span>
              </p>
            )}

            {phone.status === "issue" && phone.issueDescription && (
              <div className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl p-3">
                Issue: {phone.issueDescription}
              </div>
            )}

            {phone.status === "sold" && (
              <Link href={`/shop/invoice/${phone._id}`} target="_blank">
                <Button variant="secondary" className="w-full">
                  <Printer className="h-4 w-4" /> View / Print Invoice
                </Button>
              </Link>
            )}
          </div>
        </Modal>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox images={phone.images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

