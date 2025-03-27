// historyRequests.ts
"use server";

import { User } from "@/server/requests/userRequests";
import { authenticated } from "@/server/wrappers";
import { Product } from "./productRequests";
import { QueryKeys } from "./queryKeys";

const adminDepositsUrl = "api/v1/admin/depositHistory";
const adminPurchasesUrl = "api/v1/admin/purchaseHistory";
const userDepositsUrl = "api/v1/user/depositHistory";
const userPurchasesUrl = "api/v1/user/purchaseHistory";

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
		`${process.env.RV_BACKEND_URL}/${adminDepositsUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.deposits],
			},
		},
	).then((data) => data.deposits);
}

export async function getCurrentUserDeposits() {
	"use server";

	return await authenticated<{ deposits: Omit<Deposit, "user">[] }>(
		`${process.env.RV_BACKEND_URL}/${userDepositsUrl}`,
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
};
export type getAllPurchasesResponse = {
	purchases: Purchase[];
};

export async function getAllPurchases() {
	"use server";

	return await authenticated<getAllPurchasesResponse>(
		`${process.env.RV_BACKEND_URL}/${adminPurchasesUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.purchases],
			},
		},
	).then((data) => data.purchases);
}

export async function getCurrentUserPurchases() {
	"use server";

	return await authenticated<{ purchases: Omit<Purchase, "user">[] }>(
		`${process.env.RV_BACKEND_URL}/${userPurchasesUrl}`,
		{
			method: "GET",
			next: {
				tags: [QueryKeys.purchases],
			},
		},
	).then((data) => data.purchases);
}

export async function getPagedDeposits(limit: number, offset: number) {
  "use server";

  return await authenticated<getAllDepositsResponse>(
    `${process.env.RV_BACKEND_URL}/${depositsUrl}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit, offset }),
      next: {
        tags: [QueryKeys.purchases],
      },
    },
  ).then((data) => data.deposits);
}

export async function getPagedPurchases(limit: number, offset: number) {
  "use server";

  return await authenticated<getAllPurchasesResponse>(
    `${process.env.RV_BACKEND_URL}/${depositsUrl}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit, offset }),
      next: {
        tags: [QueryKeys.purchases],
      },
    },
  ).then((data) => data.purchases);
}

export type Transaction = Partial<Deposit> | Partial<Purchase>;
