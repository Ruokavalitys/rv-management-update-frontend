"use server";

import { authenticated } from "@/server/wrappers";
import { User } from "@/server/requests/userRequests";
import { Product } from "./productRequests";
import { QueryKeys } from "./queryKeys";

const depositsUrl = "api/v1/admin/depositHistory";
const purchasesUrl = "api/v1/admin/purchaseHistory";

export type Deposit = {
  depositId: number;
  time: string;
  amount: number;
  balanceAfter: number;
  user: User;
  type: number;
};
export type getAllDepositsResponse = {
  deposits: Deposit[];
};

export async function getAllDeposits() {
  "use server";

  return await authenticated<getAllDepositsResponse>(
    `${process.env.RV_BACKEND_URL}/${depositsUrl}`,
    {
      method: "GET",
      next: {
        tags: [QueryKeys.deposits],
      },
    },
  ).then((data) => data.deposits);
}

export type Purchase = {
  purchaseId: number;
  time: string;
  price: number;
  balanceAfter: number;
  stockAfter: number;
  product: Product;
  user: User;
  returned: boolean;
  returnedTime: string;
  returnedBalanceAfter: number;
  isReturnAction: boolean;
};
export type getAllPurchasesResponse = {
  purchases: Purchase[];
};

export async function getAllPurchases() {
  "use server";

  return await authenticated<getAllPurchasesResponse>(
    `${process.env.RV_BACKEND_URL}/${purchasesUrl}`,
    {
      method: "GET",
      next: {
        tags: [QueryKeys.purchases],
      },
    },
  ).then((data) => data.purchases);
}

export type Transaction = Partial<Deposit> | Partial<Purchase>;
