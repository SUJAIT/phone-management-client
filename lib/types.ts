// export type PhoneStatus = "available" | "sold" | "issue" | "loss";

// export interface CostEvent {
//   amount: number;
//   note?: string;
//   createdAt: string;
// }

// export interface Phone {
//   _id: string;
//   owner: { _id: string; name: string } | string;

//   name: string;
//   ram?: string;
//   storage?: string;

//   seller: {
//     name?: string;
//     phoneNumber?: string;
//     nidNumber?: string;
//     nidImageUrl?: string;
//     socialMediaLink?: string;
//     note?: string;
//   };

//   buyingPrice: number;
//   transportCost: number;
//   serviceCost: number;
//   issueFixCost: number;
//   personalProfit: number;

//   imei: string;
//   details: string;
//   sellExpectation: string; // free text, e.g. "10000-12000" or "10000/12000"
//   images: string[];

//   status: PhoneStatus;
//   hidden: boolean;

//   soldPrice?: number;
//   soldAt?: string;

//   issueDescription?: string;
//   issueHistory: { description: string; createdAt: string }[];
//   issueFixHistory: CostEvent[];
//   lossHistory: CostEvent[];

//   shopHandoverPrice?: number;
//   shopProfit?: number;
//   splitShare?: number;

//   createdAt: string;
//   updatedAt: string;
//   daysUnsold?: number; // present on Long Time Unsold Phone responses
// }

// export interface Investment {
//   _id: string;
//   owner: string;
//   amount: number;
//   source: string;
//   note?: string;
//   createdAt: string;
// }

// // Trimmed-down phone shape returned to the shop role (no internal cost breakdown).
// export interface ShopPhoneView {
//   _id: string;
//   name: string;
//   ram?: string;
//   storage?: string;
//   imei: string;
//   details: string;
//   images: string[];
//   status: PhoneStatus;
//   sellExpectation: string;
//   handoverPrice: number;
//   soldPrice?: number;
//   soldAt?: string;
//   // Jahed's (the shop's) 50% split of the profit when sold above handover price.
//   shopProfitShare?: number;
//   isLossSale?: boolean;
//   issueDescription?: string;
//   owner: { _id: string; name: string } | string;
//   createdAt: string;
//   daysUnsold?: number; // present on Long Time Unsold Phone responses
// }

// export interface OwnerDashboardStats {
//   counts: { available: number; sold: number; issue: number; loss: number };
//   totalInvestmentPool: number;
//   totalUnsoldPhoneValue: number;
//   unsoldPhoneQuantity: number;
//   soldPhoneQuantity: number;
//   totalSoldPhoneValue: number;
//   weeklyAddingAverage: number;
//   monthlyAddingAverage: number;
//   remainingBalance: number;
//   totalPersonalProfit: number;
//   totalShopProfitShare: number;
//   totalProfit: number;
//   availableProfit: number;
//   totalExpenses: number;
//   totalLosses: number;
//   totalLoss: number;
//   totalRepairCosts: number;
//   investmentWrittenOff: number;
//   totalServiceCost: number;
//   totalTransportCost: number;
//   weeklyPurchaseTotal: number;
//   monthlyPurchaseTotal: number;
//   shopUnpaidMoney: number;
//   totalOwedByShop: number;
//   totalReceivedFromShop: number;
//   longTimeUnsoldQuantity: number;
//   longTimeUnsoldAvgDays: number;
// }

// export interface ShopDashboardStats {
//   totalSell: {
//     day: { amount: number; count: number };
//     week: { amount: number; count: number };
//     month: { amount: number; count: number };
//     year: { amount: number; count: number };
//   };
//   totalProfit: { week: number; month: number; year: number };
//   saleAverage: {
//     week: { average: number; count: number; total: number };
//     month: { average: number; count: number; total: number };
//   };
//   totalSoldQuantity: number;
//   totalUnsoldQuantity: number;
//   finalBuyingPriceUnsoldTotal: number;
//   longTimeUnsoldQuantity: number;
//   longTimeUnsoldAvgDays: number;
//   recentIssues: ShopPhoneView[];
//   owners: { id: string; name: string }[];
// }

// export interface LongTimeUnsoldBreakdown {
//   thresholdDays: number;
//   quantity: number;
//   averageDaysUnsold: number;
//   buckets: { label: string; count: number }[];
//   phones: (Phone | ShopPhoneView)[];
// }

// export interface AddingAverageBreakdown {
//   totalPhones: number;
//   firstAddedAt: string | null;
//   weeklyAddingAverage: number;
//   monthlyAddingAverage: number;
//   daily: { date: string; count: number }[];
// }

// export interface UnpaidSummary {
//   totalOwed: number;
//   totalPaid: number;
//   unpaid: number;
// }

// export interface ShopPayment {
//   _id: string;
//   owner: string | { _id: string; name: string };
//   amount: number;
//   note?: string;
//   recordedBy: string;
//   createdAt: string;
// }

// export type LedgerEntryType = "expense" | "loss" | "repair";

// export interface LedgerEntry {
//   _id: string;
//   owner: string;
//   type: LedgerEntryType;
//   amount: number;
//   note?: string;
//   phone?: { _id: string; name: string; imei: string } | string;
//   profitPortion: number;
//   investmentPortion: number;
//   recordedBy: string;
//   createdAt: string;
// }


// new update 8/18/26
export type PhoneStatus = "available" | "sold" | "issue" | "loss";

export interface CostEvent {
  amount: number;
  note?: string;
  createdAt: string;
}

export type PaymentMethod = "cash" | "bank" | "bkash";

// Optional buyer details captured when a phone is marked sold (or edited afterwards via
// Invoice Edit). Every field is optional.
export interface CustomerInfo {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  paymentMethod?: PaymentMethod;
  bankName?: string;
  bankNumber?: string;
  bkashNumber?: string;
}

export interface Phone {
  _id: string;
  owner: { _id: string; name: string } | string;

  name: string;
  ram?: string;
  storage?: string;

  seller: {
    name?: string;
    phoneNumber?: string;
    nidNumber?: string;
    nidImageUrl?: string;
    socialMediaLink?: string;
    note?: string;
  };

  buyingPrice: number;
  transportCost: number;
  serviceCost: number;
  issueFixCost: number;
  personalProfit: number;

  imei: string;
  details: string;
  sellExpectation: string; // free text, e.g. "10000-12000" or "10000/12000"
  images: string[];

  status: PhoneStatus;
  hidden: boolean;

  soldPrice?: number;
  soldAt?: string;
  customer?: CustomerInfo;

  issueDescription?: string;
  issueHistory: { description: string; createdAt: string }[];
  issueFixHistory: CostEvent[];
  lossHistory: CostEvent[];

  shopHandoverPrice?: number;
  shopProfit?: number;
  splitShare?: number;

  createdAt: string;
  updatedAt: string;
  daysUnsold?: number; // present on Long Time Unsold Phone responses
}

export interface Investment {
  _id: string;
  owner: string;
  amount: number;
  source: string;
  note?: string;
  createdAt: string;
}

// Trimmed-down phone shape returned to the shop role (no internal cost breakdown).
export interface ShopPhoneView {
  _id: string;
  name: string;
  ram?: string;
  storage?: string;
  imei: string;
  details: string;
  images: string[];
  status: PhoneStatus;
  sellExpectation: string;
  handoverPrice: number;
  soldPrice?: number;
  soldAt?: string;
  customer?: CustomerInfo;
  // Jahed's (the shop's) 50% split of the profit when sold above handover price.
  shopProfitShare?: number;
  isLossSale?: boolean;
  issueDescription?: string;
  owner: { _id: string; name: string } | string;
  createdAt: string;
  daysUnsold?: number; // present on Long Time Unsold Phone responses
}

export interface OwnerDashboardStats {
  counts: { available: number; sold: number; issue: number; loss: number };
  totalInvestmentPool: number;
  totalUnsoldPhoneValue: number;
  unsoldPhoneQuantity: number;
  soldPhoneQuantity: number;
  totalSoldPhoneValue: number;
  weeklyAddingAverage: number;
  monthlyAddingAverage: number;
  remainingBalance: number;
  totalPersonalProfit: number;
  totalShopProfitShare: number;
  totalProfit: number;
  availableProfit: number;
  totalExpenses: number;
  totalLosses: number;
  totalLoss: number;
  totalRepairCosts: number;
  investmentWrittenOff: number;
  totalServiceCost: number;
  totalTransportCost: number;
  weeklyPurchaseTotal: number;
  monthlyPurchaseTotal: number;
  shopUnpaidMoney: number;
  totalOwedByShop: number;
  totalReceivedFromShop: number;
  longTimeUnsoldQuantity: number;
  longTimeUnsoldAvgDays: number;
}

export interface ShopDashboardStats {
  totalSell: {
    day: { amount: number; count: number };
    week: { amount: number; count: number };
    month: { amount: number; count: number };
    year: { amount: number; count: number };
  };
  totalProfit: { week: number; month: number; year: number };
  saleAverage: {
    week: { average: number; count: number; total: number };
    month: { average: number; count: number; total: number };
  };
  totalSoldQuantity: number;
  totalUnsoldQuantity: number;
  finalBuyingPriceUnsoldTotal: number;
  longTimeUnsoldQuantity: number;
  longTimeUnsoldAvgDays: number;
  recentIssues: ShopPhoneView[];
  owners: { id: string; name: string }[];
}

export interface LongTimeUnsoldBreakdown {
  thresholdDays: number;
  quantity: number;
  averageDaysUnsold: number;
  buckets: { label: string; count: number }[];
  phones: (Phone | ShopPhoneView)[];
}

export interface AddingAverageBreakdown {
  totalPhones: number;
  firstAddedAt: string | null;
  weeklyAddingAverage: number;
  monthlyAddingAverage: number;
  daily: { date: string; count: number }[];
}

export interface UnpaidSummary {
  totalOwed: number;
  totalPaid: number;
  unpaid: number;
}

export interface ShopPayment {
  _id: string;
  owner: string | { _id: string; name: string };
  amount: number;
  note?: string;
  recordedBy: string;
  createdAt: string;
}

export type LedgerEntryType = "expense" | "loss" | "repair";

export interface LedgerEntry {
  _id: string;
  owner: string;
  type: LedgerEntryType;
  amount: number;
  note?: string;
  phone?: { _id: string; name: string; imei: string } | string;
  profitPortion: number;
  investmentPortion: number;
  recordedBy: string;
  createdAt: string;
}

